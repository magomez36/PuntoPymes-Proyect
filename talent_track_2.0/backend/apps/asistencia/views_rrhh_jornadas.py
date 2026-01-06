# apps/asistencia/views_rrhh_jornadas.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from apps.asistencia.models import JornadaCalculada


def get_scope(request):
    token = getattr(request, "auth", None)
    if not token:
        raise PermissionDenied("Token inválido o ausente.")
    return {
        "rol": token.get("rol"),
        "empresa_id": token.get("empresa_id"),
        "usuario_id": token.get("usuario_id"),
        "empleado_id": token.get("empleado_id"),
    }


def require_rrhh(request):
    scope = get_scope(request)
    if scope.get("rol") != "rrhh":
        raise PermissionDenied("No autorizado (solo rrhh).")
    if not scope.get("empresa_id"):
        raise PermissionDenied("Token sin empresa_id.")
    return scope


ESTADO_JORNADA_LABEL = {
    1: "completo",
    2: "incompleto",
    3: "sin_registros",
}


def fmt_date(d):
    return d.isoformat() if d else None


def fmt_dt(dt):
    return dt.isoformat() if dt else None


class RRHHJornadasCalculadasAPIView(APIView):
    """
    HU04 - Ver Jornadas Calculadas de empleados de la empresa
    GET /api/rrhh/jornadas-calculadas/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        scope = require_rrhh(request)
        empresa_id = scope["empresa_id"]

        qs = (
            JornadaCalculada.objects
            .select_related("empleado")
            .filter(empresa_id=empresa_id)
            .order_by("-fecha", "-id")
        )

        data = []
        for j in qs:
            emp = j.empleado
            data.append(
                {
                    "id": j.id,
                    "nombres": emp.nombres if emp else "",
                    "apellidos": emp.apellidos if emp else "",
                    "email": emp.email if emp else "",
                    "fecha": fmt_date(j.fecha),
                    "hora_primera_entrada": fmt_dt(j.hora_primera_entrada),
                    "hora_ultimo_salida": fmt_dt(j.hora_ultimo_salida),
                    "minutos_trabajados": j.minutos_trabajados,
                    "minutos_tardanza": j.minutos_tardanza,
                    "minutos_extra": j.minutos_extra,
                    "estado": j.estado,
                    "estado_label": ESTADO_JORNADA_LABEL.get(j.estado, f"desconocido({j.estado})"),
                }
            )

        return Response(data, status=200)
