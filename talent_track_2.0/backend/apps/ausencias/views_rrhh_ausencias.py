# apps/ausencias/views_rrhh_ausencias.py
from datetime import date
from django.utils import timezone
from django.db import transaction

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.ausencias.models import SolicitudAusencia, AprobacionAusencia
from apps.notificaciones.models import Notificacion
from apps.empleados.models import Empleado
from apps.core.models import UnidadOrganizacional, Puesto


# =========================
# Helpers / scope RRHH
# =========================
def require_rrhh(request):
    """
    Debe devolverte mínimo:
    - empresa_id: int
    - usuario_id: int

    Ajusta este helper a tu implementación real si ya lo tienes en otro lado.
    """
    usuario = getattr(request.user, "usuario", None)
    if not usuario:
        # si tu auth no usa request.user.usuario, ajusta aquí
        raise PermissionError("Usuario no autenticado en tabla negocio usuarios.Usuario")

    # empresa del usuario (RRHH siempre tiene empresa)
    if not usuario.empresa_id:
        raise PermissionError("El usuario no tiene empresa asignada.")

    return {
        "empresa_id": usuario.empresa_id,
        "usuario_id": usuario.id,
        "usuario": usuario,
    }


def fmt_date(d):
    if not d:
        return None
    if isinstance(d, date):
        return d.isoformat()
    try:
        return d.strftime("%Y-%m-%d")
    except Exception:
        return str(d)


def fmt_dt(dt):
    if not dt:
        return None
    try:
        return dt.isoformat()
    except Exception:
        return str(dt)


def empleado_fullname(emp: Empleado):
    if not emp:
        return ""
    nombres = (emp.nombres or "").strip()
    apellidos = (emp.apellidos or "").strip()
    full = f"{nombres} {apellidos}".strip()
    return full


ESTADO_SOL_LABEL = {
    1: "pendiente",
    2: "aprobado",
    3: "rechazado",
    4: "cancelado",
}

ACCION_APROB_LABEL = {
    1: "aprobado",
    2: "rechazado",
}


# =========================
# HU01 - Solicitudes pendientes (RRHH)
# =========================
class RRHHSolicitudesAusenciasPendientesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        qs = (
            SolicitudAusencia.objects
            .select_related("empleado", "tipo_ausencia")
            .filter(empresa_id=empresa_id, estado=1)  # SOLO pendientes
            .order_by("-creada_el", "-id")
        )

        data = []
        for s in qs:
            emp = s.empleado
            tipo = s.tipo_ausencia
            data.append({
                "id": s.id,
                "nombres": emp.nombres if emp else "",
                "apellidos": emp.apellidos if emp else "",
                "email": emp.email if emp else "",
                "tipo_ausencia": tipo.nombre if tipo else "N/A",
                "fecha_inicio": fmt_date(s.fecha_inicio),
                "fecha_fin": fmt_date(s.fecha_fin),
                "dias_habiles": s.dias_habiles,
                "estado": s.estado,
                "estado_label": ESTADO_SOL_LABEL.get(s.estado, f"desconocido({s.estado})"),
                "creada_el": fmt_dt(s.creada_el),
            })

        return Response(data, status=200)


# =========================
# HU02 - Detalle solicitud (RRHH)
# =========================
class RRHHSolicitudAusenciaDetalleAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        sol = (
            SolicitudAusencia.objects
            .select_related(
                "empleado",
                "empleado__unidad",
                "empleado__puesto",
                "empleado__manager",
                "tipo_ausencia",
            )
            .filter(id=pk, empresa_id=empresa_id)
            .first()
        )
        if not sol:
            return Response({"detail": "No encontrado."}, status=404)

        emp = sol.empleado
        unidad = emp.unidad if emp else None
        puesto = emp.puesto if emp else None
        manager = emp.manager if emp else None
        tipo = sol.tipo_ausencia

        payload = {
            "id": sol.id,
            "nombres": emp.nombres if emp else "",
            "apellidos": emp.apellidos if emp else "",
            "email": emp.email if emp else "",
            "unidad": unidad.nombre if unidad else "N/A",
            "manager": empleado_fullname(manager) if manager else "N/A",
            "puesto": puesto.nombre if puesto else "N/A",
            "tipo_ausencia": tipo.nombre if tipo else "N/A",
            "fecha_inicio": fmt_date(sol.fecha_inicio),
            "fecha_fin": fmt_date(sol.fecha_fin),
            "dias_habiles": sol.dias_habiles,
            "motivo": sol.motivo,
            "flujo_actual": sol.flujo_actual,
            "creada_el": fmt_dt(sol.creada_el),

            # Para calendario opcional en front:
            "calendario": {
                "inicio": fmt_date(sol.fecha_inicio),
                "fin": fmt_date(sol.fecha_fin or sol.fecha_inicio),
            }
        }

        return Response(payload, status=200)


# =========================
# HU02 - Decidir (aprobar/rechazar) (RRHH)
# PATCH /api/rrhh/ausencias/solicitudes/<id>/decidir/
# body: { accion: 1|2, comentario?: string|null }
# =========================
class RRHHSolicitudAusenciaDecidirAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]
        usuario_id = scope["usuario_id"]

        raw_accion = request.data.get("accion", None)
        comentario = request.data.get("comentario", None)

        # Normalizar accion: acepta 1/2, "1"/"2", "aprobar"/"rechazar"
        accion = None

        if raw_accion is None:
            return Response({"accion": "accion es obligatorio (1 aprobar, 2 rechazar)."}, status=400)

        if isinstance(raw_accion, int):
            accion = raw_accion
        else:
            s = str(raw_accion).strip().lower()
            if s in ("1", "aprobar", "aprobado", "aprobada"):
                accion = 1
            elif s in ("2", "rechazar", "rechazado", "rechazada"):
                accion = 2
            else:
                accion = None

        if accion not in (1, 2):
            return Response({"accion": "accion debe ser 1 (aprobar) o 2 (rechazar)."}, status=400)

        # comentario no puede ser None porque tu modelo NO permite null
        comentario_db = (comentario or "").strip()

        sol = (
            SolicitudAusencia.objects
            .select_related("empleado")
            .filter(id=pk, empresa_id=empresa_id)
            .first()
        )
        if not sol:
            return Response({"detail": "No encontrado."}, status=404)

        if sol.estado != 1:
            return Response({"detail": "Solo se puede decidir una solicitud en estado pendiente."}, status=400)

        now = timezone.now()
        empleado = sol.empleado
        emp_nombre = empleado_fullname(empleado) if empleado else "Empleado"

        if accion == 1:
            nuevo_estado = 2
            msg = (
                f"Estimado/a {emp_nombre}:\n\n"
                "Su solicitud de ausencia ha sido aprobada satisfactoriamente y ha quedado registrada en el sistema conforme a lo solicitado.\n\n"
                "Para consultar fechas, tipo de ausencia u otros detalles asociados, le recomendamos revisar la información disponible en el sistema.\n\n"
                "Agradecemos su atención."
            )
        else:
            nuevo_estado = 3
            msg = (
                f"Estimado/a {emp_nombre}:\n\n"
                "Le informamos que su solicitud de ausencia ha sido rechazada tras el proceso de revisión correspondiente.\n\n"
                "Para mayor detalle sobre esta decisión, puede revisar la información disponible en el sistema.\n\n"
                "Agradecemos su atención."
            )

        with transaction.atomic():
            sol.estado = nuevo_estado
            sol.save()

            AprobacionAusencia.objects.create(
                solicitud=sol,
                aprobador_id=usuario_id,
                accion=accion,
                comentario=comentario_db,
                fecha=now,
            )

            if empleado:
                Notificacion.objects.create(
                    empresa_id=empresa_id,
                    empleado_id=empleado.id,
                    canal=4,
                    titulo="Aprobacion Solicitud",
                    mensaje=msg,
                    enviada_el=now,
                    leida_el=None,
                    accion_url=None,
                )

        return Response({"ok": True, "estado": sol.estado, "estado_label": ESTADO_SOL_LABEL.get(sol.estado)}, status=200)


# =========================
# HU03 - Listar Aprobaciones (RRHH)
# GET /api/rrhh/ausencias/aprobaciones/
# =========================
def aprobacion_to_row(ap: AprobacionAusencia):
    sol = ap.solicitud
    emp = sol.empleado if sol else None
    tipo = sol.tipo_ausencia if sol else None

    aprobador_nombre = "N/A"
    u = ap.aprobador
    u_emp = getattr(u, "empleado", None) if u else None
    if u_emp:
        aprobador_nombre = empleado_fullname(u_emp) or "N/A"

    return {
        "id": ap.id,
        "nombres": emp.nombres if emp else "",
        "apellidos": emp.apellidos if emp else "",
        "email": emp.email if emp else "",
        "tipo_ausencia": (tipo.nombre if tipo else "N/A"),
        "fecha_inicio": fmt_date(sol.fecha_inicio) if sol else None,
        "fecha_fin": fmt_date(sol.fecha_fin) if sol else None,
        "dias_habiles": sol.dias_habiles if sol else None,
        "motivo": sol.motivo if sol else None,

        "aprobador": aprobador_nombre,

        "accion": ap.accion,
        "accion_label": ACCION_APROB_LABEL.get(ap.accion, f"desconocido({ap.accion})"),
        "comentario": ap.comentario or "N/A",
        "fecha": fmt_dt(ap.fecha),
    }


class RRHHAprobacionesAusenciasAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        qs = (
            AprobacionAusencia.objects
            .select_related(
                "solicitud",
                "solicitud__empleado",
                "solicitud__tipo_ausencia",
                "aprobador",
                "aprobador__empleado",
            )
            .filter(solicitud__empresa_id=empresa_id)  # ✅ FIX
            .order_by("-fecha", "-id")
        )

        return Response([aprobacion_to_row(x) for x in qs], status=200)
