from django.db import models

# Create your models here.
from django.db import models
from apps.core.models import Empresa
from apps.usuarios.models import Usuario

class LogAuditoria(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.PROTECT)
    usuario = models.ForeignKey(
        Usuario,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    accion = models.CharField(max_length=150)
    entidad = models.CharField(max_length=150)
    entidad_id = models.BigIntegerField()
    detalles = models.JSONField()
    fecha = models.DateTimeField()
    ip = models.CharField(max_length=150, null=True, blank=True)

    class Meta:
        db_table = 'logauditoria'
