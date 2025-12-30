# backend/apps/usuarios/models.py
from django.db import models


class Usuario(models.Model):
    id = models.BigAutoField(primary_key=True)

    # Usar string refs para evitar import circular
    empresa = models.ForeignKey(
        "core.Empresa",
        null=True,
        blank=True,
        on_delete=models.CASCADE
    )
    empleado = models.ForeignKey(
        "empleados.Empleado",
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    email = models.CharField(max_length=150)
    phone = models.CharField(max_length=150, null=True, blank=True)

    # Hash tipo Django: pbkdf2_sha256$...
    hash_password = models.CharField(max_length=150)

    mfa_habilitado = models.BooleanField(default=False)

    # 1 activo, 2 bloqueado
    estado = models.SmallIntegerField()

    ultimo_acceso = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "usuario"

    def __str__(self):
        return self.email


class Rol(models.Model):
    id = models.BigAutoField(primary_key=True)

    # superadmin: empresa = NULL (rol global)
    empresa = models.ForeignKey(
        "core.Empresa",
        null=True,
        blank=True,
        on_delete=models.CASCADE
    )

    # superadmin/rrhh/manager/empleado/auditor
    nombre = models.CharField(max_length=150)

    descripcion = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "rol"

    def __str__(self):
        return self.nombre


class UsuarioRol(models.Model):
    id = models.BigAutoField(primary_key=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE)

    class Meta:
        db_table = "usuariorol"
        unique_together = ("usuario", "rol")  # evita duplicados

    def __str__(self):
        return f"UsuarioRol(usuario_id={self.usuario_id}, rol_id={self.rol_id})"


class Permiso(models.Model):
    id = models.BigAutoField(primary_key=True)
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE)
    codigo = models.CharField(max_length=150)
    descripcion = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "permiso"

    def __str__(self):
        return self.codigo
