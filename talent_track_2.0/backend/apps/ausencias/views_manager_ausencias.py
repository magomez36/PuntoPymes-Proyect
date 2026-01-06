# apps/ausencias/views_manager_ausencias.py
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.usuarios.models import Usuario
from apps.ausencias.models import SolicitudAusencia, AprobacionAusencia
from apps.notificaciones.models import Notificacion

from apps.ausencias.serializers_manager_ausencias import (
    SolicitudPendienteManagerSerializer,
    SolicitudDetalleManagerSerializer,
    AprobacionesHechasManagerSerializer,
)

ESTADO_PENDIENTE = 1
ESTADO_APROBADO = 2
ESTADO_RECHAZADO = 3

CANAL_WEBHOOK = 4
TITULO_APROBACION = "Aprobacion Solicitud"


def _get_usuario_tt(request):
    auth_user = getattr(request, "user", None)
    if not auth_user or not getattr(auth_user, "is_authenticated", False):
        return None

    usuario_id = getattr(auth_user, "usuario_id", None)
    if not usuario_id:
        return None

    return Usuario.objects.select_related("empresa", "empleado").filter(id=usuario_id).first()


def _msg_aprobado(nombres, apellidos):
    full = f"{(nombres or '').strip()} {(apellidos or '').strip()}".strip() or "Usuario"
    return (
        f"Estimado/a {full}:\n\n"
        "Su solicitud de ausencia ha sido aprobada satisfactoriamente y ha quedado registrada en el sistema conforme a lo solicitado.\n\n"
        "Para consultar fechas, tipo de ausencia u otros detalles asociados, le recomendamos revisar la información disponible en el sistema.\n\n"
        "Agradecemos su atención."
    )


def _msg_rechazado(nombres, apellidos):
    full = f"{(nombres or '').strip()} {(apellidos or '').strip()}".strip() or "Usuario"
    return (
        f"Estimado/a {full}:\n\n"
        "Le informamos que su solicitud de ausencia ha sido rechazada tras el proceso de revisión correspondiente.\n\n"
        "Para mayor detalle sobre esta decisión, puede revisar la información disponible en el sistema.\n\n"
        "Agradecemos su atención."
    )


class ManagerSolicitudesPendientesAPIView(APIView):
    """
    GET /api/manager/ausencias/solicitudes/
    Solo pendientes (estado=1) y solo empleados del equipo.
    """
    def get(self, request):
        u = _get_usuario_tt(request)
        if not u or not u.empresa_id or not u.empleado_id:
            return Response({"detail": "No autorizado."}, status=401)

        qs = (
            SolicitudAusencia.objects
            .select_related("empleado", "tipo_ausencia")
            .filter(
                empresa_id=u.empresa_id,
                estado=ESTADO_PENDIENTE,
                empleado__manager_id=u.empleado_id,
            )
            .order_by("creada_el", "id")
        )

        return Response(
            {
                "count": qs.count(),
                "results": SolicitudPendienteManagerSerializer(qs, many=True).data,
            },
            status=200,
        )


class ManagerSolicitudDetalleAPIView(APIView):
    """
    GET /api/manager/ausencias/solicitudes/<id>/
    Solo si pertenece al equipo del manager.
    """
    def get(self, request, pk):
        u = _get_usuario_tt(request)
        if not u or not u.empresa_id or not u.empleado_id:
            return Response({"detail": "No autorizado."}, status=401)

        sol = (
            SolicitudAusencia.objects
            .select_related("empleado__unidad", "empleado__puesto", "tipo_ausencia")
            .filter(
                id=pk,
                empresa_id=u.empresa_id,
                empleado__manager_id=u.empleado_id,
            )
            .first()
        )
        if not sol:
            return Response({"detail": "Solicitud no encontrada."}, status=404)

        return Response(SolicitudDetalleManagerSerializer(sol).data, status=200)


class ManagerSolicitudDecidirAPIView(APIView):
    """
    PATCH /api/manager/ausencias/solicitudes/<id>/decidir/
    body: { "accion": 1|2, "comentario": "..." | null }
    """
    def patch(self, request, pk):
        u = _get_usuario_tt(request)
        if not u or not u.empresa_id or not u.empleado_id:
            return Response({"detail": "No autorizado."}, status=401)

        accion = request.data.get("accion")
        comentario = request.data.get("comentario", None)

        if accion not in (1, 2):
            return Response({"accion": "accion debe ser 1 (aprobar) o 2 (rechazar)."}, status=400)

        sol = (
            SolicitudAusencia.objects
            .select_related("empleado", "tipo_ausencia")
            .filter(
                id=pk,
                empresa_id=u.empresa_id,
                empleado__manager_id=u.empleado_id,
            )
            .first()
        )
        if not sol:
            return Response({"detail": "Solicitud no encontrada."}, status=404)

        if sol.estado != ESTADO_PENDIENTE:
            return Response({"detail": "Solo se pueden decidir solicitudes en estado pendiente."}, status=400)

        # 1) PATCH SolicitudAusencia (estado)
        sol.estado = ESTADO_APROBADO if accion == 1 else ESTADO_RECHAZADO
        sol.save(update_fields=["estado"])

        # 2) POST AprobacionAusencia (usa nombres correctos del modelo!)
        AprobacionAusencia.objects.create(
            solicitud_id=sol.id,
            aprobador_id=u.id,  # usuario_id del manager
            accion=accion,
            comentario=comentario if comentario else "",
            fecha=timezone.now(),
        )

        # 3) POST Notificacion
        emp = sol.empleado
        Notificacion.objects.create(
            empresa_id=u.empresa_id,
            empleado_id=emp.id,
            canal=CANAL_WEBHOOK,
            titulo=TITULO_APROBACION,
            mensaje=_msg_aprobado(emp.nombres, emp.apellidos) if accion == 1 else _msg_rechazado(emp.nombres, emp.apellidos),
            enviada_el=timezone.now(),
            leida_el=None,
            accion_url=None,
        )

        return Response(
            {
                "ok": True,
                "solicitud_id": sol.id,
                "estado": sol.estado,
                "estado_label": "aprobado" if sol.estado == ESTADO_APROBADO else "rechazado",
            },
            status=200,
        )


class ManagerAprobacionesHechasAPIView(APIView):
    """
    GET /api/manager/ausencias/aprobaciones/
    Solo aprobaciones hechas por este manager (aprobador_id = usuario.id)
    """
    def get(self, request):
        u = _get_usuario_tt(request)
        if not u or not u.empresa_id:
            return Response({"detail": "No autorizado."}, status=401)

        qs = (
            AprobacionAusencia.objects
            .select_related(
                "solicitud__empleado",
                "solicitud__tipo_ausencia",
                "aprobador__empleado",
            )
            .filter(
                aprobador_id=u.id,
                solicitud__empresa_id=u.empresa_id,  # por coherencia
            )
            .order_by("-fecha", "-id")
        )

        return Response(
            {
                "count": qs.count(),
                "results": AprobacionesHechasManagerSerializer(qs, many=True).data,
            },
            status=200,
        )
