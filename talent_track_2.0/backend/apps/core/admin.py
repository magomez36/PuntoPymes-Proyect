from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Empresa, UnidadOrganizacional, Puesto

admin.site.register(Empresa)
admin.site.register(UnidadOrganizacional)
admin.site.register(Puesto)
