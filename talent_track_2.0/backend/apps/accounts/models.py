from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager


class AuthUserManager(BaseUserManager):
    def create_user(self, email, password=None, usuario=None, **extra_fields):
        if not email:
            raise ValueError("El email es obligatorio")
        email = self.normalize_email(email).lower()

        u = self.model(email=email, **extra_fields)
        if password:
            u.set_password(password)
        else:
            u.set_unusable_password()

        if usuario:
            u.usuario = usuario

        u.save(using=self._db)
        return u

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        return self.create_user(email=email, password=password, **extra_fields)


class AuthUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)

    # enlaza con tu tabla negocio usuarios.Usuario
    usuario = models.OneToOneField(
        "usuarios.Usuario",
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = AuthUserManager()

    class Meta:
        db_table = "auth_user_tt"

    def __str__(self):
        return self.email
