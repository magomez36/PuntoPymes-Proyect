# apps/kpi/urls.py
from django.urls import path
from .views import KPIListCreateAPIView, KPIDetailUpdateDeleteAPIView
from apps.kpi.views import KPIsPorEmpresaHelperAPIView
from apps.kpi.views_rrhh_kpis import RRHHKPIListCreateAPIView, RRHHKPIDetailAPIView

from apps.kpi.views import (
    PlantillasKPIPorEmpresaAPIView,
    PlantillaKPICreateAPIView,
    PlantillaKPIDetalleAPIView,
)

from apps.kpi.views_rrhh_asignaciones import (
    RRHHAsignacionKPIListCreateAPIView,
    RRHHAsignacionKPIDetailAPIView,
    RRHHEmpleadosEmpresaAPIView,
    RRHHPlantillasKPIEmpresaAPIView,
)


urlpatterns = [
    path("kpis/", KPIListCreateAPIView.as_view(), name="kpi_list_create"),
    path("kpis/<int:pk>/", KPIDetailUpdateDeleteAPIView.as_view(), name="kpi_detail"),

    path("plantillas-kpi/", PlantillasKPIPorEmpresaAPIView.as_view(), name="plantillas_kpi_list"),
    path("plantillas-kpi/crear/", PlantillaKPICreateAPIView.as_view(), name="plantillas_kpi_create"),
    path("plantillas-kpi/<int:pk>/", PlantillaKPIDetalleAPIView.as_view(), name="plantillas_kpi_detail"),
    path("helpers/kpis-por-empresa/", KPIsPorEmpresaHelperAPIView.as_view(), name="helper_kpis_por_empresa"),

    path("rrhh/kpis/", RRHHKPIListCreateAPIView.as_view(), name="rrhh_kpis_list_create"),
    path("rrhh/kpis/<int:pk>/", RRHHKPIDetailAPIView.as_view(), name="rrhh_kpis_detail"),

    path("rrhh/kpi/asignaciones/", RRHHAsignacionKPIListCreateAPIView.as_view(), name="rrhh_asignacionkpi_list_create"),
    path("rrhh/kpi/asignaciones/<int:pk>/", RRHHAsignacionKPIDetailAPIView.as_view(), name="rrhh_asignacionkpi_detail"),
    path("rrhh/kpi/helpers/empleados/", RRHHEmpleadosEmpresaAPIView.as_view(), name="rrhh_kpi_helpers_empleados"),
    path("rrhh/kpi/helpers/plantillas/", RRHHPlantillasKPIEmpresaAPIView.as_view(), name="rrhh_kpi_helpers_plantillas"),
]
