# apps/core/urls.py
from django.urls import path

from .views import (
    EmpresaListAPIView,
    CrearEmpresaAPIView,
    ActualizarEmpresaAPIView,
    ToggleEstadoEmpresaAPIView,
    EmpresaDetalleEliminarAPIView,

    # NUEVO
    UnidadOrganizacionalListCreateAPIView,
    UnidadOrganizacionalDetailAPIView,
    ToggleEstadoUnidadOrganizacionalAPIView,
)

from .views import (
    EmpresaListAPIView, CrearEmpresaAPIView, ActualizarEmpresaAPIView,
    ToggleEstadoEmpresaAPIView, EmpresaDetalleEliminarAPIView,

    PuestoListAPIView, CrearPuestoAPIView, ActualizarPuestoAPIView, PuestoDetalleEliminarAPIView
)

from apps.core.views_rrhh_unidades_org import (
    RRHHUnidadesOrgListCreateAPIView,
    RRHHUnidadesOrgDetailAPIView,
)

from apps.core.views_rrhh_puestos import (
    RRHHPuestosListCreateAPIView,
    RRHHPuestosDetailAPIView,
)

from apps.core.dashboard_views import SuperAdminOverviewPlotlyAPIView, AdminRRHHOverviewPlotlyAPIView


urlpatterns = [
    # EMPRESAS
    path('listado-empresas/', EmpresaListAPIView.as_view(), name='listar_empresas'),
    path('crear-empresa/', CrearEmpresaAPIView.as_view(), name='crear_empresa'),
    path('actualizar-empresa/<int:pk>/', ActualizarEmpresaAPIView.as_view(),  name='actualizar_empresa'),
    path('empresas/<int:pk>/toggle-estado/', ToggleEstadoEmpresaAPIView.as_view(), name='toggle_estado_empresa'),
    path('empresas/<int:pk>/', EmpresaDetalleEliminarAPIView.as_view(), name='empresa_detalle_eliminar'),

    # UNIDADES ORGANIZACIONALES (NUEVO)
    path("unidades-organizacionales/", UnidadOrganizacionalListCreateAPIView.as_view(), name="uo_list_create"),
    path("unidades-organizacionales/<int:pk>/", UnidadOrganizacionalDetailAPIView.as_view(), name="uo_detail"),
    path("unidades-organizacionales/<int:pk>/toggle-estado/", ToggleEstadoUnidadOrganizacionalAPIView.as_view(), name="uo_toggle"),

     # PUESTOS
    path('listado-puestos/', PuestoListAPIView.as_view(), name='listar_puestos'),
    path('crear-puesto/', CrearPuestoAPIView.as_view(), name='crear_puesto'),
    path('actualizar-puesto/<int:pk>/', ActualizarPuestoAPIView.as_view(), name='actualizar_puesto'),
    path('puestos/<int:pk>/', PuestoDetalleEliminarAPIView.as_view(), name='puesto_detalle_eliminar'),

    path("rrhh/unidades-organizacionales/", RRHHUnidadesOrgListCreateAPIView.as_view(), name="rrhh_uo_list_create"),
    path("rrhh/unidades-organizacionales/<int:pk>/", RRHHUnidadesOrgDetailAPIView.as_view(), name="rrhh_uo_detail"),

    path("rrhh/puestos/", RRHHPuestosListCreateAPIView.as_view(), name="rrhh_puestos_list_create"),
    path("rrhh/puestos/<int:pk>/", RRHHPuestosDetailAPIView.as_view(), name="rrhh_puestos_detail"),

    path("dashboard/superadmin/overview-plotly/", SuperAdminOverviewPlotlyAPIView.as_view()),
    path("dashboard/adminrrhh/overview-plotly/", AdminRRHHOverviewPlotlyAPIView.as_view()),
]
