# apps/asistencia/views_manager_supervision.py
from datetime import datetime
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.usuarios.models import Usuario
from apps.asistencia.models import EventoAsistencia, JornadaCalculada
from apps.asistencia.serializers_manager_supervision import (
    EventoAsistenciaManagerSerializer,
    JornadaDiaManagerSerializer,
)


def _get_usuario_tt(request):
    auth_user = getattr(request, "user", None)
    if not auth_user or not getattr(auth_user, "is_authenticated", False):
        return None

    usuario_id = getattr(auth_user, "usuario_id", None)
    if not usuario_id:
        return None

    return Usuario.objects.select_related("empleado", "empresa").filter(id=usuario_id).first()


def _parse_date_yyyy_mm_dd(value):
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except Exception:
        return None


class ManagerEventosAsistenciaDiaAPIView(APIView):
    """
    GET /api/manager/supervision-asistencia/eventos/?fecha=YYYY-MM-DD   (OBLIGATORIO)
    """
    def get(self, request):
        u = _get_usuario_tt(request)
        if not u or not u.empresa_id or not u.empleado_id:
            return Response({"detail": "No autorizado."}, status=401)

        fecha_str = request.query_params.get("fecha")
        fecha = _parse_date_yyyy_mm_dd(fecha_str)
        if not fecha:
            return Response({"fecha": "fecha es obligatoria en formato YYYY-MM-DD."}, status=400)

        # Filtra por empresa y por empleados del equipo (empleado.manager_id = manager.empleado_id)
        qs = (
            EventoAsistencia.objects
            .select_related("empleado")
            .filter(
                empresa_id=u.empresa_id,
                empleado__manager_id=u.empleado_id,
                registrado_el__date=fecha
            )
            .order_by("registrado_el", "id")
        )

        return Response(
            {
                "fecha": fecha_str,
                "count": qs.count(),
                "results": EventoAsistenciaManagerSerializer(qs, many=True).data,
            },
            status=200,
        )


class ManagerJornadasDiaAPIView(APIView):
    """
    GET /api/manager/supervision-asistencia/jornadas/?fecha=YYYY-MM-DD   (OBLIGATORIO)
    """
    def get(self, request):
        u = _get_usuario_tt(request)
        if not u or not u.empresa_id or not u.empleado_id:
            return Response({"detail": "No autorizado."}, status=401)

        fecha_str = request.query_params.get("fecha")
        fecha = _parse_date_yyyy_mm_dd(fecha_str)
        if not fecha:
            return Response({"fecha": "fecha es obligatoria en formato YYYY-MM-DD."}, status=400)

        qs = (
            JornadaCalculada.objects
            .select_related("empleado")
            .filter(
                empresa_id=u.empresa_id,
                empleado__manager_id=u.empleado_id,
                fecha=fecha
            )
            .order_by("empleado__apellidos", "empleado__nombres", "id")
        )

        return Response(
            {
                "fecha": fecha_str,
                "count": qs.count(),
                "results": JornadaDiaManagerSerializer(qs, many=True).data,
            },
            status=200,
        )
