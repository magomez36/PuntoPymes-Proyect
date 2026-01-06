"""
URL configuration for talent_track project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.core.urls')),
    path("api/", include("apps.usuarios.urls")), 
    path("api/", include("apps.asistencia.urls")),
    path("api/", include("apps.ausencias.urls")),  
    path("api/", include("apps.kpi.urls")),
    path("api/", include("apps.integraciones.urls")),
    path("api/", include("apps.empleados.urls")),
    path("api/", include("apps.empleados.urls_manager")),
    path("api/", include("apps.kpi.urls_manager")),
    path("api/", include("apps.asistencia.urls_manager")),
    path("api/", include("apps.ausencias.urls_manager")),
    path("api/", include("apps.usuarios.urls_auditor_accesos")),
    path("api/", include("apps.auditoria.urls_auditor_trazabilidad")),
    path("api/", include("apps.empleados.urls_auditor_expedientes")),
    path("api/", include("apps.ausencias.urls_auditor_ausencias")),
    path("api/", include("apps.kpi.urls_auditor_desempeno")),
    path("api/", include("apps.asistencia.urls_auditor_asistencia")),
]
