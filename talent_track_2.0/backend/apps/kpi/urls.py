# apps/kpi/urls.py
from django.urls import path
from .views import KPIListCreateAPIView, KPIDetailUpdateDeleteAPIView

urlpatterns = [
    path("kpis/", KPIListCreateAPIView.as_view(), name="kpi_list_create"),
    path("kpis/<int:pk>/", KPIDetailUpdateDeleteAPIView.as_view(), name="kpi_detail"),
]
