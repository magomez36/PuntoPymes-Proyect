from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('empleado/', views.dashboard_empleado, name='dashboard_empleado'),
    path('superadmin/', views.superadmin_dashboard, name='superadmin_dashboard'),
]
