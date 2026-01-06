# apps/kpi/urls_manager.py
from django.urls import path
from apps.kpi.views_manager_evaluaciones import (
    ManagerMiEquipoEmpleadosHelperAPIView,
    ManagerEvaluacionesListCreateAPIView,
    ManagerEvaluacionDetalleAPIView,
)

urlpatterns = [
    path("manager/helpers/mi-equipo/empleados/", ManagerMiEquipoEmpleadosHelperAPIView.as_view()),
    path("manager/evaluaciones/", ManagerEvaluacionesListCreateAPIView.as_view()),
    path("manager/evaluaciones/crear/", ManagerEvaluacionesListCreateAPIView.as_view()),
    path("manager/evaluaciones/<int:pk>/", ManagerEvaluacionDetalleAPIView.as_view()),
]
