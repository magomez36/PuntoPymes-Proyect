# apps/ausencias/views_auditor_ausencias.py
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.usuarios.models import Usuario
from apps.ausencias.models import SolicitudAusencia, AprobacionAusencia, SaldoVacaciones
from apps.ausencias.serializers_auditor_ausencias import (
    AuditorSolicitudAusenciaSerializer,
    AuditorAprobacionAusenciaSerializer,
    AuditorSaldoVacacionesSerializer,
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


class AuditorSolicitudesAusenciasAPIView(APIView):
    # GET /api/auditor/ausencias/solicitudes/
    def get(self, request):
        auditor = _get_usuario_tt(request)
        if not auditor or not auditor.empresa_id:
            return Response({"detail": "No autorizado."}, status=401)

        qs = (
            SolicitudAusencia.objects
            .select_related("empleado", "tipo_ausencia")
            .filter(empresa_id=auditor.empresa_id)
            .order_by("-creada_el", "-id")
        )

        return Response(AuditorSolicitudAusenciaSerializer(qs, many=True).data, status=200)


class AuditorAprobacionesAusenciasAPIView(APIView):
    # GET /api/auditor/ausencias/aprobaciones/
    def get(self, request):
        auditor = _get_usuario_tt(request)
        if not auditor or not auditor.empresa_id:
            return Response({"detail": "No autorizado."}, status=401)

        # OJO: AprobacionAusencia NO tiene empresa; se filtra por solicitud__empresa_id
        qs = (
            AprobacionAusencia.objects
            .select_related(
                "solicitud",
                "solicitud__empleado",
                "solicitud__tipo_ausencia",
                "aprobador",
                "aprobador__empleado",
            )
            .filter(solicitud__empresa_id=auditor.empresa_id)
            .order_by("-fecha", "-id")
        )

        return Response(AuditorAprobacionAusenciaSerializer(qs, many=True).data, status=200)


class AuditorSaldosVacacionesAPIView(APIView):
    # GET /api/auditor/ausencias/saldos-vacaciones/
    def get(self, request):
        auditor = _get_usuario_tt(request)
        if not auditor or not auditor.empresa_id:
            return Response({"detail": "No autorizado."}, status=401)

        qs = (
            SaldoVacaciones.objects
            .select_related("empleado")
            .filter(empresa_id=auditor.empresa_id)
            .order_by("-periodo", "empleado__apellidos", "empleado__nombres", "-id")
        )

        return Response(AuditorSaldoVacacionesSerializer(qs, many=True).data, status=200)
