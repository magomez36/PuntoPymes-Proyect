# apps/kpi/urls_auditor_desempeno.py
from django.urls import path
from apps.kpi.views_auditor_desempeno import (
    AuditorAsignacionesKPIAPIView,
    AuditorPlantillasKPIAPIView,
    AuditorKPIsEmpresaAPIView,
    AuditorResultadosKPIAPIView,
    AuditorEvaluacionesDesempenoAPIView,
)

urlpatterns = [
    path("auditor/desempeno/asignaciones-kpi/", AuditorAsignacionesKPIAPIView.as_view()),
    path("auditor/desempeno/plantillas-kpi/", AuditorPlantillasKPIAPIView.as_view()),
    path("auditor/desempeno/kpis/", AuditorKPIsEmpresaAPIView.as_view()),
    path("auditor/desempeno/resultados-kpi/", AuditorResultadosKPIAPIView.as_view()),
    path("auditor/desempeno/evaluaciones/", AuditorEvaluacionesDesempenoAPIView.as_view()),
]
