from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Empleado, Contrato, DocumentoEmpleado

admin.site.register(Empleado)
admin.site.register(Contrato)
admin.site.register(DocumentoEmpleado)
