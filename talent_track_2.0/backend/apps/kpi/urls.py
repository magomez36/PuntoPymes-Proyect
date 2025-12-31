# apps/kpi/urls.py
from django.urls import path
from .views import KPIListCreateAPIView, KPIDetailUpdateDeleteAPIView
from apps.kpi.views import KPIsPorEmpresaHelperAPIView

from apps.kpi.views import (
    PlantillasKPIPorEmpresaAPIView,
    PlantillaKPICreateAPIView,
    PlantillaKPIDetalleAPIView,
)

urlpatterns = [
    path("kpis/", KPIListCreateAPIView.as_view(), name="kpi_list_create"),
    path("kpis/<int:pk>/", KPIDetailUpdateDeleteAPIView.as_view(), name="kpi_detail"),

    path("plantillas-kpi/", PlantillasKPIPorEmpresaAPIView.as_view(), name="plantillas_kpi_list"),
    path("plantillas-kpi/crear/", PlantillaKPICreateAPIView.as_view(), name="plantillas_kpi_create"),
    path("plantillas-kpi/<int:pk>/", PlantillaKPIDetalleAPIView.as_view(), name="plantillas_kpi_detail"),
    path("helpers/kpis-por-empresa/", KPIsPorEmpresaHelperAPIView.as_view(), name="helper_kpis_por_empresa"),
]
