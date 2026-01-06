# apps/ausencias/urls_manager.py
from django.urls import path
from apps.ausencias.views_manager_ausencias import (
    ManagerSolicitudesPendientesAPIView,
    ManagerSolicitudDetalleAPIView,
    ManagerSolicitudDecidirAPIView,
    ManagerAprobacionesHechasAPIView,
)

urlpatterns = [
    path("manager/ausencias/solicitudes/", ManagerSolicitudesPendientesAPIView.as_view()),
    path("manager/ausencias/solicitudes/<int:pk>/", ManagerSolicitudDetalleAPIView.as_view()),
    path("manager/ausencias/solicitudes/<int:pk>/decidir/", ManagerSolicitudDecidirAPIView.as_view()),
    path("manager/ausencias/aprobaciones/", ManagerAprobacionesHechasAPIView.as_view()),
]
