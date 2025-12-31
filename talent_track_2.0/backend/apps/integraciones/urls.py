from django.urls import path
from apps.integraciones.views import (
    ReporteProgramadoListCreateAPIView,
    ReporteProgramadoRetrieveUpdateDeleteAPIView,
    ToggleActivoReporteProgramadoAPIView,
)

urlpatterns = [
    path("reportes-programados/", ReporteProgramadoListCreateAPIView.as_view(), name="reporte_programado_list_create"),
    path("reportes-programados/<int:pk>/", ReporteProgramadoRetrieveUpdateDeleteAPIView.as_view(), name="reporte_programado_detail"),
    path("reportes-programados/<int:pk>/toggle-activo/", ToggleActivoReporteProgramadoAPIView.as_view(), name="reporte_programado_toggle_activo"),
]
