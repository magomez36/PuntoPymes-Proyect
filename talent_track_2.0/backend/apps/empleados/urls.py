# apps/empleados/urls.py
from django.urls import path
from apps.empleados.views import (
    EmpleadosEmpresaListCreateAPIView,
    EmpleadoEmpresaDetalleAPIView,
    EmpleadoToggleEstadoAPIView,
    UnidadesPorEmpresaAPIView,
    PuestosPorEmpresaAPIView,
)

urlpatterns = [
    # CRUD
    path("empleados-empresa/", EmpleadosEmpresaListCreateAPIView.as_view(), name="empleados_empresa_list_create"),
    path("empleados-empresa/<int:pk>/", EmpleadoEmpresaDetalleAPIView.as_view(), name="empleados_empresa_detail"),
    path("empleados-empresa/<int:pk>/toggle-estado/", EmpleadoToggleEstadoAPIView.as_view(), name="empleados_empresa_toggle_estado"),

    # Helpers
    path("helpers/unidades-por-empresa/", UnidadesPorEmpresaAPIView.as_view(), name="unidades_por_empresa"),
    path("helpers/puestos-por-empresa/", PuestosPorEmpresaAPIView.as_view(), name="puestos_por_empresa"),
]
