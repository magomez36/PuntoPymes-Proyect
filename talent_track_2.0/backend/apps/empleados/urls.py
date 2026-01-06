# apps/empleados/urls.py
from django.urls import path
from apps.empleados.views import (
    EmpleadosEmpresaListCreateAPIView,
    EmpleadoEmpresaDetalleAPIView,
    EmpleadoToggleEstadoAPIView,
    UnidadesPorEmpresaAPIView,
    PuestosPorEmpresaAPIView,
)

from apps.empleados.views_rrhh_empleados import (
    RRHHEmpleadosListCreateAPIView,
    RRHHEmpleadosDetailAPIView,
    RRHHEmpleadosMinHelperAPIView,
)

from apps.empleados.views_rrhh_contratos import (
    RRHHContratosListCreateAPIView,
    RRHHContratosDetailAPIView,
    RRHHEmpleadosSinContratoHelperAPIView,
    RRHHTurnosMinHelperAPIView,
)

urlpatterns = [
    # CRUD
    path("empleados-empresa/", EmpleadosEmpresaListCreateAPIView.as_view(), name="empleados_empresa_list_create"),
    path("empleados-empresa/<int:pk>/", EmpleadoEmpresaDetalleAPIView.as_view(), name="empleados_empresa_detail"),
    path("empleados-empresa/<int:pk>/toggle-estado/", EmpleadoToggleEstadoAPIView.as_view(), name="empleados_empresa_toggle_estado"),

    # Helpers
    path("helpers/unidades-por-empresa/", UnidadesPorEmpresaAPIView.as_view(), name="unidades_por_empresa"),
    path("helpers/puestos-por-empresa/", PuestosPorEmpresaAPIView.as_view(), name="puestos_por_empresa"),

    path("rrhh/empleados/", RRHHEmpleadosListCreateAPIView.as_view(), name="rrhh_empleados_list_create"),
    path("rrhh/empleados/<int:pk>/", RRHHEmpleadosDetailAPIView.as_view(), name="rrhh_empleados_detail"),
    path("rrhh/helpers/empleados-min/", RRHHEmpleadosMinHelperAPIView.as_view(), name="rrhh_empleados_min"),

    path("rrhh/contratos/", RRHHContratosListCreateAPIView.as_view(), name="rrhh_contratos_list_create"),
    path("rrhh/contratos/<int:pk>/", RRHHContratosDetailAPIView.as_view(), name="rrhh_contratos_detail"),

    path("rrhh/helpers/empleados-sin-contrato/", RRHHEmpleadosSinContratoHelperAPIView.as_view(), name="rrhh_empleados_sin_contrato"),
    path("rrhh/helpers/turnos-min/", RRHHTurnosMinHelperAPIView.as_view(), name="rrhh_turnos_min"),
]
