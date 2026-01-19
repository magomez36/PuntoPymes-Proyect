# apps/kpi/views_empleado.py
from decimal import Decimal
from django.db.models import Avg
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import AsignacionKPI, ResultadoKPI, EvaluacionDesempeno, KPI
from .serializers import (
    MiAsignacionKPISerializer,
    MiResultadoKPISerializer,
    MiEvaluacionDesempenoSerializer,
    MiKpiMiniSerializer,
)

def _ctx_empresa_empleado(request):
    """
    Asume tu esquema:
    - request.user es AuthUser (auth_user_tt) y tiene .usuario (tabla usuarios.Usuario)
    - usuarios.Usuario tiene empresa_id y empleado_id (FKs)
    """
    auth_user = request.user
    user_tt = getattr(auth_user, "usuario", None)
    if not user_tt:
        return None, None, "El usuario autenticado no está enlazado a usuarios.Usuario (auth_user_tt.usuario)."

    empresa_id = user_tt.empresa_id
    empleado_id = user_tt.empleado_id
    if not empresa_id or not empleado_id:
        return None, None, "No se pudo determinar empresa_id/empleado_id desde el usuario."

    return empresa_id, empleado_id, None


class MisKpisAsignadosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        empresa_id, empleado_id, err = _ctx_empresa_empleado(request)
        if err:
            return Response({"detail": err}, status=400)

        qs = (
            AsignacionKPI.objects
            .select_related("plantilla")
            .filter(empresa_id=empresa_id, empleado_id=empleado_id)
            .order_by("-desde")
        )
        return Response(MiAsignacionKPISerializer(qs, many=True).data, status=200)


class MisResultadosKpiView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        empresa_id, empleado_id, err = _ctx_empresa_empleado(request)
        if err:
            return Response({"detail": err}, status=400)

        kpi_id = request.query_params.get("kpi_id")
        periodo = request.query_params.get("periodo")
        desde = request.query_params.get("desde")  # string
        hasta = request.query_params.get("hasta")  # string

        qs = ResultadoKPI.objects.select_related("kpi").filter(
            empresa_id=empresa_id,
            empleado_id=empleado_id,
        )

        if kpi_id:
            qs = qs.filter(kpi_id=kpi_id)
        if periodo:
            qs = qs.filter(periodo=periodo)

        # Si manejas periodos tipo "2025-12" o "2025-Q4", esto sirve por orden lexicográfico.
        if desde:
            qs = qs.filter(periodo__gte=desde)
        if hasta:
            qs = qs.filter(periodo__lte=hasta)

        qs = qs.order_by("-periodo", "-calculado_el")

        return Response(MiResultadoKPISerializer(qs, many=True).data, status=200)


class MisEvaluacionesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        empresa_id, empleado_id, err = _ctx_empresa_empleado(request)
        if err:
            return Response({"detail": err}, status=400)

        periodo = request.query_params.get("periodo")
        desde = request.query_params.get("desde")
        hasta = request.query_params.get("hasta")

        qs = EvaluacionDesempeno.objects.select_related("evaluador").filter(
            empresa_id=empresa_id,
            empleado_id=empleado_id,
        )

        if periodo:
            qs = qs.filter(periodo=periodo)
        if desde:
            qs = qs.filter(periodo__gte=desde)
        if hasta:
            qs = qs.filter(periodo__lte=hasta)

        qs = qs.order_by("-periodo", "-fecha")
        return Response(MiEvaluacionDesempenoSerializer(qs, many=True).data, status=200)


class MisKpisCatalogoView(APIView):
    """
    Para llenar el combo de filtros (kpi_id) sin exponer otras empresas.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        empresa_id, _, err = _ctx_empresa_empleado(request)
        if err:
            return Response({"detail": err}, status=400)

        qs = KPI.objects.filter(empresa_id=empresa_id).order_by("nombre")
        return Response(MiKpiMiniSerializer(qs, many=True).data, status=200)


class MiEvolucionDesempenoView(APIView):
    """
    HU04: evolución por periodo (agregado).
    Devuelve:
      - kpi_avg: promedio cumplimiento_pct por periodo
      - eval_avg: promedio puntaje_total por periodo
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        empresa_id, empleado_id, err = _ctx_empresa_empleado(request)
        if err:
            return Response({"detail": err}, status=400)

        desde = request.query_params.get("desde")
        hasta = request.query_params.get("hasta")

        res_qs = ResultadoKPI.objects.filter(empresa_id=empresa_id, empleado_id=empleado_id)
        ev_qs = EvaluacionDesempeno.objects.filter(empresa_id=empresa_id, empleado_id=empleado_id)

        if desde:
            res_qs = res_qs.filter(periodo__gte=desde)
            ev_qs = ev_qs.filter(periodo__gte=desde)
        if hasta:
            res_qs = res_qs.filter(periodo__lte=hasta)
            ev_qs = ev_qs.filter(periodo__lte=hasta)

        kpi_avg = (
            res_qs.values("periodo")
            .annotate(avg_cumplimiento=Avg("cumplimiento_pct"))
            .order_by("periodo")
        )

        eval_avg = (
            ev_qs.values("periodo")
            .annotate(avg_puntaje=Avg("puntaje_total"))
            .order_by("periodo")
        )

        # normaliza Decimals
        def _norm(v):
            if isinstance(v, Decimal):
                return float(v)
            return v

        kpi_avg = [
            {"periodo": x["periodo"], "avg_cumplimiento": _norm(x["avg_cumplimiento"])}
            for x in kpi_avg
        ]
        eval_avg = [
            {"periodo": x["periodo"], "avg_puntaje": _norm(x["avg_puntaje"])}
            for x in eval_avg
        ]

        return Response({"kpi_avg": kpi_avg, "eval_avg": eval_avg}, status=200)
