# apps/empleados/urls_manager.py
from django.urls import path
from apps.empleados.views_manager_mi_equipo import (
    MiEquipoEmpleadosAPIView,
    MiEquipoEmpleadoDetalleAPIView,
    MiEquipoEmpleadoJornadasAPIView,
    MiEquipoEmpleadoCambiarEstadoAPIView,
)

urlpatterns = [
    path("manager/mi-equipo/empleados/", MiEquipoEmpleadosAPIView.as_view(), name="mgr_mi_equipo_empleados"),
    path("manager/mi-equipo/empleados/<int:pk>/", MiEquipoEmpleadoDetalleAPIView.as_view(), name="mgr_mi_equipo_empleado_detalle"),
    path("manager/mi-equipo/empleados/<int:pk>/jornadas/", MiEquipoEmpleadoJornadasAPIView.as_view(), name="mgr_mi_equipo_empleado_jornadas"),
    path("manager/mi-equipo/empleados/<int:pk>/estado/", MiEquipoEmpleadoCambiarEstadoAPIView.as_view(), name="mgr_mi_equipo_empleado_estado"),
]
