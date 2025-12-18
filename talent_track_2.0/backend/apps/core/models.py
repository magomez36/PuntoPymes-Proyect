from django.db import models

# Create your models here.
from django.db import models

class Empresa(models.Model):
    id = models.BigAutoField(primary_key=True)
    razon_social = models.CharField(max_length=150)
    nombre_comercial = models.CharField(max_length=150)
    ruc_nit = models.CharField(max_length=150)
    pais = models.SmallIntegerField()
    moneda = models.SmallIntegerField()
    logo_url = models.TextField(null=True, blank=True)
    estado = models.SmallIntegerField()
    creada_el = models.DateTimeField()

    class Meta:
        db_table = 'empresa'


class UnidadOrganizacional(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.PROTECT)
    unidad_padre = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    nombre = models.CharField(max_length=150)
    tipo = models.SmallIntegerField()
    ubicacion = models.CharField(max_length=150)
    estado = models.SmallIntegerField()
    creada_el = models.DateTimeField()

    class Meta:
        db_table = 'unidadorganizacional'


class Puesto(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.PROTECT)
    unidad = models.ForeignKey(UnidadOrganizacional, on_delete=models.PROTECT)
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(null=True, blank=True)
    nivel = models.CharField(max_length=150)
    salario_referencial = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'puesto'
