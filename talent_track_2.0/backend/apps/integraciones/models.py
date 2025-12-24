# apps/integraciones/models.py
from django.db import models
from apps.core.models import Empresa

class ReporteProgramado(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=150)
    tipo = models.SmallIntegerField()
    parametros = models.JSONField(null=True, blank=True)
    frecuencia_cron = models.CharField(max_length=150)
    formato = models.SmallIntegerField()
    destinatarios = models.JSONField(null=True, blank=True)
    activo = models.BooleanField(default=False)

    class Meta:
        db_table = 'reporteprogramado'


class IntegracionERP(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    erp_nombre = models.CharField(max_length=150)
    tipo = models.SmallIntegerField()
    metodo = models.SmallIntegerField()
    endpoint = models.CharField(max_length=150)
    credenciales = models.JSONField(null=True, blank=True)
    mapeos = models.JSONField(null=True, blank=True)
    activo = models.BooleanField(default=False)

    class Meta:
        db_table = 'integracionerp'


class Webhook(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    evento = models.SmallIntegerField()
    url = models.TextField()
    secreto = models.CharField(max_length=150)
    activo = models.BooleanField()
    reintentos_max = models.IntegerField()
    ultimo_envio_el = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'webhook'


class ExportacionNomina(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    periodo = models.CharField(max_length=150)
    total_horas = models.DecimalField(max_digits=7, decimal_places=2)
    total_extras = models.DecimalField(max_digits=7, decimal_places=2)
    observaciones = models.TextField(null=True, blank=True)
    archivo_url = models.TextField()
    generado_el = models.DateTimeField()
    estado = models.SmallIntegerField()

    class Meta:
        db_table = 'exportacionnomina'
