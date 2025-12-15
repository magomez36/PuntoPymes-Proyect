from django.shortcuts import render

from django.shortcuts import render

# Vista para login
def login_view(request):
    return render(request, 'usuarios/login.html')

# Dashboard Empleado
def dashboard_empleado(request):
    return render(request, 'usuarios/empleado/InicioEmpleado.html')

# Dashboard SuperAdmin
def superadmin_dashboard(request):
    return render(request, 'usuarios/superAdmin/inicioSuperAdmin.html')
