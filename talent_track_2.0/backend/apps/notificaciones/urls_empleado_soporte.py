from django.urls import path
from .views_empleado_soporte import SoporteRRHHAdminsView, SoporteEnviarNotificacionView

urlpatterns = [
    path("empleado/soporte/rrhh-admins/", SoporteRRHHAdminsView.as_view()),
    path("empleado/soporte/enviar/", SoporteEnviarNotificacionView.as_view()),
]
