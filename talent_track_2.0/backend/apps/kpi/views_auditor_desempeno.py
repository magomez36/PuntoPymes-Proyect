# apps/kpi/views_auditor_desempeno.py
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.usuarios.models import Usuario
from apps.kpi.models import AsignacionKPI, PlantillaKPI, KPI, ResultadoKPI, EvaluacionDesempeno
from apps.kpi.serializers_auditor_desempeno import (
    AuditorAsignacionKPISerializer,
    AuditorPlantillaKPISerializer,
    AuditorKPISerializer,
    AuditorResultadoKPISerializer,
    AuditorEvaluacionDesempenoSerializer,
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


class AuditorAsignacionesKPIAPIView(APIView):
    # GET /api/auditor/desempeno/asignaciones-kpi/
    def get(self, request):
        auditor = _get_usuario_tt(request)
        if not auditor or not auditor.empresa_id:
            return Response({"detail": "No autorizado."}, status=401)

        qs = (
            AsignacionKPI.objects
            .select_related("empleado", "plantilla")
            .filter(empresa_id=auditor.empresa_id)
            .order_by("-desde", "-id")
        )
        return Response(AuditorAsignacionKPISerializer(qs, many=True).data, status=200)


class AuditorPlantillasKPIAPIView(APIView):
    # GET /api/auditor/desempeno/plantillas-kpi/
    def get(self, request):
        auditor = _get_usuario_tt(request)
        if not auditor or not auditor.empresa_id:
            return Response({"detail": "No autorizado."}, status=401)

        qs = (
            PlantillaKPI.objects
            .filter(empresa_id=auditor.empresa_id)
            .order_by("nombre", "id")
        )
        return Response(AuditorPlantillaKPISerializer(qs, many=True).data, status=200)


class AuditorKPIsEmpresaAPIView(APIView):
    # GET /api/auditor/desempeno/kpis/
    def get(self, request):
        auditor = _get_usuario_tt(request)
        if not auditor or not auditor.empresa_id:
            return Response({"detail": "No autorizado."}, status=401)

        qs = (
            KPI.objects
            .filter(empresa_id=auditor.empresa_id)
            .order_by("codigo", "id")
        )
        return Response(AuditorKPISerializer(qs, many=True).data, status=200)


class AuditorResultadosKPIAPIView(APIView):
    # GET /api/auditor/desempeno/resultados-kpi/
    def get(self, request):
        auditor = _get_usuario_tt(request)
        if not auditor or not auditor.empresa_id:
            return Response({"detail": "No autorizado."}, status=401)

        qs = (
            ResultadoKPI.objects
            .select_related("empleado", "kpi")
            .filter(empresa_id=auditor.empresa_id)
            .order_by("-calculado_el", "-id")
        )
        return Response(AuditorResultadoKPISerializer(qs, many=True).data, status=200)


class AuditorEvaluacionesDesempenoAPIView(APIView):
    # GET /api/auditor/desempeno/evaluaciones/
    def get(self, request):
        auditor = _get_usuario_tt(request)
        if not auditor or not auditor.empresa_id:
            return Response({"detail": "No autorizado."}, status=401)

        qs = (
            EvaluacionDesempeno.objects
            .select_related("empleado", "evaluador")
            .filter(empresa_id=auditor.empresa_id)
            .order_by("-fecha", "-id")
        )
        return Response(AuditorEvaluacionDesempenoSerializer(qs, many=True).data, status=200)
