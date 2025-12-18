from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Turno, AsignacionTurno, ReglaAsistencia, GeoCerca, DispositivoEmpleado, EventoAsistencia, JornadaCalculada

admin.site.register(Turno)
admin.site.register(AsignacionTurno)
admin.site.register(ReglaAsistencia)
admin.site.register(GeoCerca)
admin.site.register(DispositivoEmpleado)
admin.site.register(EventoAsistencia)
admin.site.register(JornadaCalculada)
