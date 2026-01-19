from django.urls import path
from .views import NotificacionesEmpleadoAPIView, MarcarNotificacionLeidaAPIView

urlpatterns = [
    path("empleado/notificaciones/", NotificacionesEmpleadoAPIView.as_view(), name="empleado_notificaciones"),
    path("empleado/notificaciones/<int:pk>/leida/", MarcarNotificacionLeidaAPIView.as_view(), name="empleado_notificacion_leida"),
]
