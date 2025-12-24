# apps/usuarios/models.py
from django.db import models
from apps.core.models import Empresa
from apps.empleados.models import Empleado

class Usuario(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, null=True, blank=True, on_delete=models.CASCADE)
    empleado = models.ForeignKey(Empleado, null=True, blank=True, on_delete=models.SET_NULL)
    email = models.CharField(max_length=150)
    phone = models.CharField(max_length=150, null=True, blank=True)
    hash_password = models.CharField(max_length=150)
    mfa_habilitado = models.BooleanField(default=False)
    estado = models.SmallIntegerField()
    ultimo_acceso = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'usuario'


class Rol(models.Model):
    id = models.BigAutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, null=True, blank=True, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'rol'


class UsuarioRol(models.Model):
    id = models.BigAutoField(primary_key=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE)

    class Meta:
        db_table = 'usuariorol'


class Permiso(models.Model):
    id = models.BigAutoField(primary_key=True)
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE)
    codigo = models.CharField(max_length=150)
    descripcion = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'permiso'
