# apps/asistencia/models.py
from django.db import models
from apps.core.models import Empresa
from apps.empleados.models import Empleado

class Turno(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=150)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    dias_semana = models.JSONField()
    tolerancia_minutos = models.IntegerField()
    requiere_gps = models.BooleanField(default=False)
    requiere_foto = models.BooleanField(default=False)

    class Meta:
        db_table = 'turno'


class AsignacionTurno(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE)
    turno = models.ForeignKey(Turno, on_delete=models.CASCADE)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    es_rotativo = models.BooleanField(default=False)

    class Meta:
        db_table = 'asignacionturno'


class GeoCerca(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=150)
    tipo = models.SmallIntegerField()
    coordenadas = models.JSONField(null=True, blank=True)
    activo = models.BooleanField(default=False)

    class Meta:
        db_table = 'geocerca'


class ReglaAsistencia(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    geocerca = models.ForeignKey(GeoCerca, null=True, blank=True, on_delete=models.SET_NULL)
    considera_tardanza_desde_min = models.IntegerField()
    calculo_horas_extra = models.SmallIntegerField(default=0)
    ip_permitidas = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = 'reglaasistencia'


class DispositivoEmpleado(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE)
    tipo = models.SmallIntegerField()
    device_uid = models.CharField(max_length=150, null=True, blank=True)
    ultimo_uso_el = models.DateTimeField(null=True, blank=True)
    activo = models.BooleanField(default=False)

    class Meta:
        db_table = 'dispositivoempleado'


class EventoAsistencia(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE)
    tipo = models.SmallIntegerField()
    registrado_el = models.DateTimeField()
    fuente = models.SmallIntegerField()
    gps_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    gps_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    dentro_geocerca = models.BooleanField(default=False)
    foto_url = models.TextField(null=True, blank=True)
    ip = models.CharField(max_length=150, null=True, blank=True)
    observaciones = models.CharField(max_length=150, null=True, blank=True)

    class Meta:
        db_table = 'eventoasistencia'


class JornadaCalculada(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE)
    fecha = models.DateField()
    hora_primera_entrada = models.DateTimeField()
    hora_ultimo_salida = models.DateTimeField()
    minutos_trabajados = models.IntegerField()
    minutos_tardanza = models.IntegerField()
    minutos_extra = models.IntegerField()
    estado = models.SmallIntegerField()

    class Meta:
        db_table = 'jornadacalculada'
