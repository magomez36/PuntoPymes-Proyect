# apps/ausencias/models.py
from django.db import models
from apps.core.models import Empresa
from apps.empleados.models import Empleado

class TipoAusencia(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=150)
    afecta_sueldo = models.BooleanField()
    requiere_soporte = models.BooleanField()

    class Meta:
        db_table = 'tipoausencia'


class SolicitudAusencia(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE)
    tipo_ausencia = models.ForeignKey(TipoAusencia, on_delete=models.CASCADE)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    dias_habiles = models.IntegerField()
    motivo = models.TextField()
    estado = models.SmallIntegerField()
    flujo_actual = models.IntegerField()
    adjunto_url = models.TextField(null=True, blank=True)
    creada_el = models.DateTimeField()

    class Meta:
        db_table = 'solicitudausencia'


class AprobacionAusencia(models.Model):
    id = models.BigAutoField(primary_key=True)
    solicitud = models.ForeignKey(SolicitudAusencia, on_delete=models.CASCADE)
    aprobador = models.ForeignKey('usuarios.Usuario', on_delete=models.SET_NULL, null=True, blank=True)
    accion = models.SmallIntegerField()
    comentario = models.TextField()
    fecha = models.DateTimeField()

    class Meta:
        db_table = 'aprobacionausencia'


class SaldoVacaciones(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE)
    periodo = models.CharField(max_length=150)
    dias_asignados = models.DecimalField(max_digits=5, decimal_places=2)
    dias_tomados = models.DecimalField(max_digits=5, decimal_places=2)
    dias_disponibles = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        db_table = 'saldovacaciones'
