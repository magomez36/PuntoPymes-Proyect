# apps/empleados/views_manager_mi_equipo.py
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.empleados.models import Empleado, Contrato
from apps.asistencia.models import JornadaCalculada


ESTADO_EMPLEADO = {
    1: "activo",
    2: "suspendido",
    3: "baja",
}

ESTADO_JORNADA = {
    1: "completo",
    2: "incompleto",
    3: "sin_registros",
}


def get_usuario_tt(request):
    """
    Asume que estás autenticando con AuthUser (accounts.AuthUser)
    y que request.user.usuario apunta a usuarios.Usuario.
    """
    u = getattr(request, "user", None)
    if not u or not getattr(u, "is_authenticated", False):
        return None
    return getattr(u, "usuario", None)


def get_context_manager(request):
    """
    Devuelve (empresa_id, empleado_manager_id) desde el token.
    - empresa_id: la empresa del usuario negocio (usuarios.Usuario.empresa_id)
    - empleado_manager_id: el empleado asociado al usuario (usuarios.Usuario.empleado_id)
    """
    usuario_tt = get_usuario_tt(request)
    if not usuario_tt:
        return (None, None)

    empresa_id = usuario_tt.empresa_id
    manager_empleado_id = usuario_tt.empleado_id
    return (empresa_id, manager_empleado_id)


class MiEquipoEmpleadosAPIView(APIView):
    """
    GET /api/manager/mi-equipo/empleados/
    Lista SOLO empleados donde:
      - empleado.empresa_id == empresa del token
      - empleado.manager_id == empleado_id del usuario manager
    """

    def get(self, request):
        empresa_id, manager_empleado_id = get_context_manager(request)
        if not empresa_id or not manager_empleado_id:
            return Response(
                {"detail": "Usuario no tiene empresa o no tiene empleado asociado."},
                status=400,
            )

        qs = (
            Empleado.objects
            .select_related("unidad", "puesto")
            .filter(empresa_id=empresa_id, manager_id=manager_empleado_id)
            .order_by("id")
        )

        data = []
        for e in qs:
            data.append({
                "id": e.id,
                "nombres": e.nombres,
                "apellidos": e.apellidos,
                "unidad_organizacional": e.unidad.nombre if e.unidad_id else "N/A",
                "puesto": e.puesto.nombre if e.puesto_id else "N/A",
                "email": e.email,
                "direccion": e.direccion or "N/A",
                "estado": e.estado,
                "estado_label": ESTADO_EMPLEADO.get(e.estado, f"desconocido({e.estado})"),
            })

        return Response(data, status=200)


class MiEquipoEmpleadoDetalleAPIView(APIView):
    """
    GET /api/manager/mi-equipo/empleados/<id>/
    Detalle SOLO si pertenece al equipo del manager.
    """

    def get(self, request, pk):
        empresa_id, manager_empleado_id = get_context_manager(request)
        if not empresa_id or not manager_empleado_id:
            return Response(
                {"detail": "Usuario no tiene empresa o no tiene empleado asociado."},
                status=400,
            )

        e = (
            Empleado.objects
            .select_related("unidad", "puesto", "manager")
            .filter(id=pk, empresa_id=empresa_id, manager_id=manager_empleado_id)
            .first()
        )
        if not e:
            return Response({"detail": "Empleado no encontrado en tu equipo."}, status=404)

        manager_label = "N/A"
        if e.manager_id:
            manager_label = f"{e.manager.nombres} {e.manager.apellidos}".strip()

        out = {
            "id": e.id,
            "nombres": e.nombres,
            "apellidos": e.apellidos,
            "unidad_organizacional": e.unidad.nombre if e.unidad_id else "N/A",
            "manager": manager_label,
            "puesto": e.puesto.nombre if e.puesto_id else "N/A",
            "email": e.email,
            "telefono": e.telefono or "N/A",
            "direccion": e.direccion or "N/A",
            "fecha_nacimiento": e.fecha_nacimiento.isoformat() if e.fecha_nacimiento else None,
            "fecha_ingreso": e.fecha_ingreso.isoformat() if e.fecha_ingreso else None,
            "estado": e.estado,
            "estado_label": ESTADO_EMPLEADO.get(e.estado, f"desconocido({e.estado})"),
        }
        return Response(out, status=200)


class MiEquipoEmpleadoCambiarEstadoAPIView(APIView):
    """
    PATCH /api/manager/mi-equipo/empleados/<id>/estado/
    body: {"estado": 1|2|3}
    """

    def patch(self, request, pk):
        empresa_id, manager_empleado_id = get_context_manager(request)
        if not empresa_id or not manager_empleado_id:
            return Response(
                {"detail": "Usuario no tiene empresa o no tiene empleado asociado."},
                status=400,
            )

        e = Empleado.objects.filter(
            id=pk, empresa_id=empresa_id, manager_id=manager_empleado_id
        ).first()
        if not e:
            return Response({"detail": "Empleado no encontrado en tu equipo."}, status=404)

        estado = request.data.get("estado")
        try:
            estado = int(estado)
        except Exception:
            return Response({"estado": "estado debe ser 1, 2 o 3."}, status=400)

        if estado not in (1, 2, 3):
            return Response({"estado": "estado debe ser 1 (activo), 2 (suspendido) o 3 (baja)."}, status=400)

        e.estado = estado
        e.save(update_fields=["estado"])

        return Response({
            "id": e.id,
            "estado": e.estado,
            "estado_label": ESTADO_EMPLEADO.get(e.estado),
        }, status=200)


class MiEquipoEmpleadoJornadasAPIView(APIView):
    """
    GET /api/manager/mi-equipo/empleados/<id>/jornadas/
    Retorna jornadas calculadas del empleado (solo si es de tu equipo)
    + un encabezado con info del contrato (si existe)
    """

    def get(self, request, pk):
        empresa_id, manager_empleado_id = get_context_manager(request)
        if not empresa_id or not manager_empleado_id:
            return Response(
                {"detail": "Usuario no tiene empresa o no tiene empleado asociado."},
                status=400,
            )

        e = Empleado.objects.filter(
            id=pk, empresa_id=empresa_id, manager_id=manager_empleado_id
        ).first()
        if not e:
            return Response({"detail": "Empleado no encontrado en tu equipo."}, status=404)

        contrato = (
            Contrato.objects
            .select_related("turno_base")
            .filter(empresa_id=empresa_id, empleado_id=e.id)
            .order_by("-id")
            .first()
        )

        contrato_resumen = {
            "existe": bool(contrato),
            "tipo": contrato.tipo if contrato else None,
            "fecha_inicio": contrato.fecha_inicio.isoformat() if contrato else None,
            "fecha_fin": contrato.fecha_fin.isoformat() if contrato and contrato.fecha_fin else None,
            "salario_base": str(contrato.salario_base) if contrato else None,
            "jornada_semanal_horas": contrato.jornada_semanal_horas if contrato else None,
            "turno_base": contrato.turno_base.nombre if contrato and contrato.turno_base_id else "N/A",
            "estado": contrato.estado if contrato else None,
        }

        qs = (
            JornadaCalculada.objects
            .filter(empresa_id=empresa_id, empleado_id=e.id)
            .order_by("-fecha", "-id")
        )

        rows = []
        for j in qs:
            rows.append({
                "id": j.id,
                "fecha": j.fecha.isoformat() if j.fecha else None,
                "hora_primera_entrada": j.hora_primera_entrada.isoformat() if j.hora_primera_entrada else None,
                "hora_ultimo_salida": j.hora_ultimo_salida.isoformat() if j.hora_ultimo_salida else None,
                "minutos_trabajados": j.minutos_trabajados,
                "minutos_tardanza": j.minutos_tardanza,
                "minutos_extra": j.minutos_extra,
                "estado": j.estado,
                "estado_label": ESTADO_JORNADA.get(j.estado, f"desconocido({j.estado})"),
            })

        return Response({
            "empleado": {
                "id": e.id,
                "nombres": e.nombres,
                "apellidos": e.apellidos,
                "email": e.email,
            },
            "contrato": contrato_resumen,
            "jornadas": rows,
        }, status=200)
