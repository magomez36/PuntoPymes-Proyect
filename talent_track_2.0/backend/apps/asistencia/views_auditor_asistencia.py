# apps/asistencia/views_auditor_asistencia.py
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.usuarios.models import Usuario
from apps.asistencia.models import EventoAsistencia, JornadaCalculada, AsignacionTurno
from apps.asistencia.serializers_auditor_asistencia import (
    AuditorEventoAsistenciaSerializer,
    AuditorJornadaCalculadaSerializer,
    AuditorAsignacionTurnoSerializer,
)


def _get_usuario_tt(request):
    auth_user = getattr(request, "user", None)
    if not auth_user or not getattr(auth_user, "is_authenticated", False):
        return None
    usuario_id = getattr(auth_user, "usuario_id", None)
    if not usuario_id:
        return None
    return (
        Usuario.objects
        .select_related("empresa", "empleado")
        .filter(id=usuario_id)
        .first()
    )


class AuditorEventosAsistenciaAPIView(APIView):
    """
    GET /api/auditor/asistencia/eventos/?fecha=YYYY-MM-DD (opcional)
    """
    def get(self, request):
        auditor = _get_usuario_tt(request)
        if not auditor or not auditor.empresa_id:
            return Response({"detail": "No autorizado."}, status=401)

        qs = (
            EventoAsistencia.objects
            .select_related("empleado")
            .filter(empresa_id=auditor.empresa_id)
        )

        fecha = request.query_params.get("fecha")
        if fecha:
            try:
                # filtrar por día (date) en registrado_el
                dt = datetime.strptime(fecha, "%Y-%m-%d").date()
                qs = qs.filter(registrado_el__date=dt)
            except ValueError:
                return Response({"detail": "Formato de fecha inválido. Use YYYY-MM-DD."}, status=400)

        qs = qs.order_by("-registrado_el", "-id")
        return Response(AuditorEventoAsistenciaSerializer(qs, many=True).data, status=200)


class AuditorJornadasCalculadasAPIView(APIView):
    """
    GET /api/auditor/asistencia/jornadas/?fecha=YYYY-MM-DD (opcional)
    """
    def get(self, request):
        auditor = _get_usuario_tt(request)
        if not auditor or not auditor.empresa_id:
            return Response({"detail": "No autorizado."}, status=401)

        qs = (
            JornadaCalculada.objects
            .select_related("empleado")
            .filter(empresa_id=auditor.empresa_id)
        )

        fecha = request.query_params.get("fecha")
        if fecha:
            try:
                dt = datetime.strptime(fecha, "%Y-%m-%d").date()
                qs = qs.filter(fecha=dt)
            except ValueError:
                return Response({"detail": "Formato de fecha inválido. Use YYYY-MM-DD."}, status=400)

        qs = qs.order_by("-fecha", "-id")
        return Response(AuditorJornadaCalculadaSerializer(qs, many=True).data, status=200)


class AuditorTurnosEmpleadosAPIView(APIView):
    """
    GET /api/auditor/asistencia/turnos-empleados/
    """
    def get(self, request):
        auditor = _get_usuario_tt(request)
        if not auditor or not auditor.empresa_id:
            return Response({"detail": "No autorizado."}, status=401)

        qs = (
            AsignacionTurno.objects
            .select_related("empleado", "turno")
            .filter(empresa_id=auditor.empresa_id)
            .order_by("empleado_id", "-id")
        )
        return Response(AuditorAsignacionTurnoSerializer(qs, many=True).data, status=200)

