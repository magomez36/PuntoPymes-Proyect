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

urlpatterns = [
    path("turnos/", TurnoListAPIView.as_view(), name="turnos_list"),
    path("turnos/crear/", CrearTurnoAPIView.as_view(), name="turnos_crear"),
    path("turnos/<int:pk>/", TurnoDetalleEliminarAPIView.as_view(), name="turnos_detalle_eliminar"),
    path("turnos/<int:pk>/actualizar/", ActualizarTurnoAPIView.as_view(), name="turnos_actualizar"),

    path("reglas-asistencia/", ReglaAsistenciaListAPIView.as_view(), name="reglas_asistencia_list"),
    path("reglas-asistencia/crear/", CrearReglaAsistenciaAPIView.as_view(), name="reglas_asistencia_crear"),
    path("reglas-asistencia/<int:pk>/", ReglaAsistenciaDetalleEliminarAPIView.as_view(), name="reglas_asistencia_detalle_eliminar"),
    path("reglas-asistencia/<int:pk>/actualizar/", ActualizarReglaAsistenciaAPIView.as_view(), name="reglas_asistencia_actualizar"),
]
