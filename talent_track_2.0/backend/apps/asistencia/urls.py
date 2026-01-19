# apps/asistencia/urls.py
from django.urls import path
from .views import (
    TurnoListAPIView,
    CrearTurnoAPIView,
    TurnoDetalleEliminarAPIView,
    ActualizarTurnoAPIView,
)

from .views import (
    ReglaAsistenciaListAPIView,
    CrearReglaAsistenciaAPIView,
    ActualizarReglaAsistenciaAPIView,
    ReglaAsistenciaDetalleEliminarAPIView,
)

from apps.asistencia.views_rrhh_turnos import (
    RRHHTurnosListCreateAPIView,
    RRHHTurnosDetailAPIView,
)

from apps.asistencia.views_rrhh_jornadas import RRHHJornadasCalculadasAPIView

from apps.asistencia.views import EmpleadoAsistenciaHoyAPIView, EmpleadoRegistrarAsistenciaAPIView

from apps.asistencia.views import EmpleadoJornadasMensualAPIView

urlpatterns = [
    path("turnos/", TurnoListAPIView.as_view(), name="turnos_list"),
    path("turnos/crear/", CrearTurnoAPIView.as_view(), name="turnos_crear"),
    path("turnos/<int:pk>/", TurnoDetalleEliminarAPIView.as_view(), name="turnos_detalle_eliminar"),
    path("turnos/<int:pk>/actualizar/", ActualizarTurnoAPIView.as_view(), name="turnos_actualizar"),

    path("reglas-asistencia/", ReglaAsistenciaListAPIView.as_view(), name="reglas_asistencia_list"),
    path("reglas-asistencia/crear/", CrearReglaAsistenciaAPIView.as_view(), name="reglas_asistencia_crear"),
    path("reglas-asistencia/<int:pk>/", ReglaAsistenciaDetalleEliminarAPIView.as_view(), name="reglas_asistencia_detalle_eliminar"),
    path("reglas-asistencia/<int:pk>/actualizar/", ActualizarReglaAsistenciaAPIView.as_view(), name="reglas_asistencia_actualizar"),

    path("rrhh/turnos/", RRHHTurnosListCreateAPIView.as_view(), name="rrhh_turnos_list_create"),
    path("rrhh/turnos/<int:pk>/", RRHHTurnosDetailAPIView.as_view(), name="rrhh_turnos_detail"),

    path("rrhh/jornadas-calculadas/", RRHHJornadasCalculadasAPIView.as_view(), name="rrhh_jornadas_calculadas"),

    path("empleado/asistencia/hoy/", EmpleadoAsistenciaHoyAPIView.as_view(), name="empleado_asistencia_hoy"),
    path("empleado/asistencia/registrar/", EmpleadoRegistrarAsistenciaAPIView.as_view(), name="empleado_asistencia_registrar"),

    path("empleado/jornadas/", EmpleadoJornadasMensualAPIView.as_view(), name="empleado_jornadas_mensual"),
]
