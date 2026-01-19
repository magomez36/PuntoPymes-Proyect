from django.urls import path
from .dashboard_views import SuperAdminDashboardView

from django.urls import path
from .views import (
    SuperAdminLogsAuditoriaAPIView,
    SuperAdminLogAuditoriaDetailAPIView,
    SuperAdminUsuariosToggleAPIView,
    AuditorLogsAuditoriaAPIView,
)


urlpatterns = [
    path("superadmin/dashboard/", SuperAdminDashboardView.as_view()),
    # SuperAdmin global
    path("auditoria/superadmin/logs/", SuperAdminLogsAuditoriaAPIView.as_view(), name="sa_logs_list"),
    path("auditoria/superadmin/logs/<int:pk>/", SuperAdminLogAuditoriaDetailAPIView.as_view(), name="sa_logs_detail"),
    path("auditoria/superadmin/helpers/usuarios/", SuperAdminUsuariosToggleAPIView.as_view(), name="sa_logs_users"),
]
