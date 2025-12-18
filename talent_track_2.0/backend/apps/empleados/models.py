from django.db import models

# Create your models here.
from django.db import models
from apps.core.models import Empresa, UnidadOrganizacional, Puesto

class Empleado(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.PROTECT)
    unidad = models.ForeignKey(UnidadOrganizacional, on_delete=models.PROTECT)
    puesto = models.ForeignKey(Puesto, on_delete=models.PROTECT)
    manager = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    nombres = models.CharField(max_length=150)
    apellidos = models.CharField(max_length=150)
    documento = models.CharField(max_length=150, null=True, blank=True)
    email = models.CharField(max_length=150)
    telefono = models.CharField(max_length=150, null=True, blank=True)
    direccion = models.TextField(null=True, blank=True)
    fecha_nacimiento = models.DateField()
    fecha_ingreso = models.DateField()
    foto_url = models.CharField(max_length=150, null=True, blank=True)
    estado = models.SmallIntegerField()

    class Meta:
        db_table = 'empleado'


class Contrato(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.PROTECT)
    empleado = models.ForeignKey(Empleado, on_delete=models.PROTECT)
    turno_base = models.ForeignKey(
        'asistencia.Turno',
        null=True,
        blank=True,
        on_delete=models.PROTECT
    )
    tipo = models.SmallIntegerField()
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    salario_base = models.DecimalField(max_digits=12, decimal_places=2)
    jornada_semanal_horas = models.IntegerField()
    estado = models.SmallIntegerField()

    class Meta:
        db_table = 'contrato'


class DocumentoEmpleado(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.PROTECT)
    empleado = models.ForeignKey(Empleado, on_delete=models.PROTECT)
    tipo = models.SmallIntegerField()
    archivo_url = models.TextField(null=True, blank=True)
    observaciones = models.TextField(null=True, blank=True)
    cargado_el = models.DateTimeField()
    vigente = models.BooleanField()

    class Meta:
        db_table = 'documentoempleado'
