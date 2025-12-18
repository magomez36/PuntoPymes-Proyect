from django.db import models

# Create your models here.
from django.db import models
from apps.core.models import Empresa
from apps.empleados.models import Empleado

class KPI(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.PROTECT)
    codigo = models.CharField(max_length=150)
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField()
    unidad = models.SmallIntegerField()
    origen_datos = models.SmallIntegerField()
    formula = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'kpi'


class PlantillaKPI(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.PROTECT)
    nombre = models.CharField(max_length=150)
    aplica_a = models.SmallIntegerField()
    objetivos = models.JSONField()

    class Meta:
        db_table = 'plantillakpi'


class AsignacionKPI(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.PROTECT)
    empleado = models.ForeignKey(Empleado, on_delete=models.PROTECT)
    plantilla = models.ForeignKey(PlantillaKPI, on_delete=models.PROTECT)
    desde = models.DateField()
    hasta = models.DateField(null=True, blank=True)
    ajustes_personalizados = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = 'asignacionkpi'


class ResultadoKPI(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.PROTECT)
    empleado = models.ForeignKey(Empleado, on_delete=models.PROTECT)
    kpi = models.ForeignKey(KPI, on_delete=models.PROTECT)
    periodo = models.CharField(max_length=150)
    valor = models.DecimalField(max_digits=5, decimal_places=2)
    cumplimiento_pct = models.DecimalField(max_digits=5, decimal_places=2)
    clasificacion = models.SmallIntegerField()
    calculado_el = models.DateTimeField()
    fuente = models.CharField(max_length=150)

    class Meta:
        db_table = 'resultadokpi'


class EvaluacionDesempeno(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.PROTECT)
    empleado = models.ForeignKey(Empleado, on_delete=models.PROTECT)
    evaluador = models.ForeignKey(
        Empleado,
        on_delete=models.PROTECT,
        related_name='evaluaciones_realizadas'
    )
    periodo = models.CharField(max_length=150)
    tipo = models.SmallIntegerField()
    instrumento = models.JSONField(null=True, blank=True)
    puntaje_total = models.DecimalField(max_digits=5, decimal_places=2)
    comentarios = models.TextField()
    fecha = models.DateTimeField()

    class Meta:
        db_table = 'evaluaciondesempeno'
