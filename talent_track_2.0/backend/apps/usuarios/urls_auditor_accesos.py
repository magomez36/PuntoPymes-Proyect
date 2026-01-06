# apps/usuarios/urls_auditor_accesos.py
from django.urls import path
from apps.usuarios.views_auditor_accesos import (
    AuditorUsuariosEmpresaAPIView,
    AuditorRolesEmpresaAPIView,
    AuditorPermisosEmpresaAPIView,
)

urlpatterns = [
    path("auditor/accesos/usuarios/", AuditorUsuariosEmpresaAPIView.as_view()),
    path("auditor/accesos/roles/", AuditorRolesEmpresaAPIView.as_view()),
    path("auditor/accesos/permisos/", AuditorPermisosEmpresaAPIView.as_view()),
]
