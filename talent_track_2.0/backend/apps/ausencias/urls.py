# apps/ausencias/urls.py
from django.urls import path
from .views import TipoAusenciaListCreateAPIView, TipoAusenciaDetailUpdateDeleteAPIView

from apps.ausencias.views_rrhh_tipos_ausencias import (
    RRHHTiposAusenciasListCreateAPIView,
    RRHHTiposAusenciasDetailAPIView,
)

from apps.ausencias.views_rrhh_ausencias import (
    RRHHSolicitudesAusenciasPendientesAPIView,
    RRHHSolicitudAusenciaDetalleAPIView,
    RRHHSolicitudAusenciaDecidirAPIView,
    RRHHAprobacionesAusenciasAPIView,
)

from apps.ausencias.views_rrhh_saldo_vacaciones import (
    RRHHSaldosVacacionesListCreateAPIView,
    RRHHSaldosVacacionesPatchDeleteAPIView,
    RRHHEmpleadosEmpresaVacacionesHelperAPIView,
)

urlpatterns = [
    path("tipos-ausencias/", TipoAusenciaListCreateAPIView.as_view(), name="tipos_ausencias_list_create"),
    path("tipos-ausencias/<int:pk>/", TipoAusenciaDetailUpdateDeleteAPIView.as_view(), name="tipos_ausencias_detail"),

    path("rrhh/tipos-ausencias/", RRHHTiposAusenciasListCreateAPIView.as_view(), name="rrhh_tipos_ausencias_list_create"),
    path("rrhh/tipos-ausencias/<int:pk>/", RRHHTiposAusenciasDetailAPIView.as_view(), name="rrhh_tipos_ausencias_detail"),

    path("rrhh/ausencias/solicitudes/", RRHHSolicitudesAusenciasPendientesAPIView.as_view()),
    path("rrhh/ausencias/solicitudes/<int:pk>/", RRHHSolicitudAusenciaDetalleAPIView.as_view()),
    path("rrhh/ausencias/solicitudes/<int:pk>/decidir/", RRHHSolicitudAusenciaDecidirAPIView.as_view()),
    path("rrhh/ausencias/aprobaciones/", RRHHAprobacionesAusenciasAPIView.as_view()),

    path("rrhh/vacaciones/saldos/", RRHHSaldosVacacionesListCreateAPIView.as_view(), name="rrhh_saldos_vacaciones"),
    path("rrhh/vacaciones/saldos/<int:pk>/", RRHHSaldosVacacionesPatchDeleteAPIView.as_view(), name="rrhh_saldo_vacaciones_patch_delete"),
    path("rrhh/vacaciones/helpers/empleados/", RRHHEmpleadosEmpresaVacacionesHelperAPIView.as_view(), name="rrhh_vacaciones_helpers_empleados"),
]
