from django.db import models

# Create your models here.
from django.db import models
from apps.core.models import Empresa
from apps.empleados.models import Empleado
from apps.usuarios.models import Usuario

class TipoAusencia(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.PROTECT)
    nombre = models.CharField(max_length=150)
    afecta_sueldo = models.BooleanField()
    requiere_soporte = models.BooleanField()

    class Meta:
        db_table = 'tipoausencia'


class SolicitudAusencia(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.PROTECT)
    empleado = models.ForeignKey(Empleado, on_delete=models.PROTECT)
    tipo_ausencia = models.ForeignKey(TipoAusencia, on_delete=models.PROTECT)
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
    solicitud = models.ForeignKey(SolicitudAusencia, on_delete=models.PROTECT)
    aprobador = models.ForeignKey(Usuario, on_delete=models.PROTECT)
    accion = models.SmallIntegerField()
    comentario = models.TextField()
    fecha = models.DateTimeField()

    class Meta:
        db_table = 'aprobacionausencia'


class SaldoVacaciones(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.PROTECT)
    empleado = models.ForeignKey(Empleado, on_delete=models.PROTECT)
    periodo = models.CharField(max_length=150)
    dias_asignados = models.DecimalField(max_digits=5, decimal_places=2)
    dias_tomados = models.DecimalField(max_digits=5, decimal_places=2)
    dias_disponibles = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        db_table = 'saldovacaciones'
