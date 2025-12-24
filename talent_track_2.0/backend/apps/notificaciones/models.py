# apps/notificaciones/models.py
from django.db import models
from apps.core.models import Empresa
from apps.empleados.models import Empleado

class Notificacion(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE)
    canal = models.SmallIntegerField()
    titulo = models.CharField(max_length=150)
    mensaje = models.TextField()
    enviada_el = models.DateTimeField()
    leida_el = models.DateTimeField(null=True, blank=True)
    accion_url = models.CharField(max_length=150, null=True, blank=True)

    class Meta:
        db_table = 'notificacion'
