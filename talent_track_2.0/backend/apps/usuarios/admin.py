from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Usuario, Rol, UsuarioRol, Permiso

admin.site.register(Usuario)
admin.site.register(Rol)
admin.site.register(UsuarioRol)
admin.site.register(Permiso)
