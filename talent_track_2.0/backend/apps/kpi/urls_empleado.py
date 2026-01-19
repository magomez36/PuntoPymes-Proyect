# apps/kpi/urls_empleado.py
from django.urls import path
from .views_empleado import (
    MisKpisAsignadosView,
    MisResultadosKpiView,
    MisEvaluacionesView,
    MisKpisCatalogoView,
    MiEvolucionDesempenoView,
)

urlpatterns = [
    path("kpis/catalogo/", MisKpisCatalogoView.as_view()),
    path("kpis/asignados/", MisKpisAsignadosView.as_view()),
    path("kpis/resultados/", MisResultadosKpiView.as_view()),
    path("kpis/evaluaciones/", MisEvaluacionesView.as_view()),
    path("kpis/evolucion/", MiEvolucionDesempenoView.as_view()),
]
