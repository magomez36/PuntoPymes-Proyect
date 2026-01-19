from rest_framework import serializers
from apps.usuarios.models import Rol

ROL_ID_TO_NAME = {
    1: "superadmin",
    2: "rrhh",
    3: "manager",
    4: "empleado",
    5: "auditor",
}
ROL_NAME_TO_ID = {v: k for k, v in ROL_ID_TO_NAME.items()}


class RolReadSerializer(serializers.ModelSerializer):
    empresa_razon_social = serializers.CharField(source="empresa.razon_social", read_only=True)
    nombre_id = serializers.SerializerMethodField()
    nombre_texto = serializers.CharField(source="nombre", read_only=True)

    class Meta:
        model = Rol
        fields = ["id", "empresa", "empresa_razon_social", "nombre_id", "nombre_texto", "descripcion"]

    def get_nombre_id(self, obj):
        return ROL_NAME_TO_ID.get((obj.nombre or "").lower())


class RolCreateSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField()

    class Meta:
        model = Rol
        fields = ["empresa", "nombre", "descripcion"]

    def validate_nombre(self, value):
        if isinstance(value, str) and value.strip().isdigit():
            n = int(value.strip())
            if n not in ROL_ID_TO_NAME:
                raise serializers.ValidationError("Rol inválido. Use 1..5.")
            return ROL_ID_TO_NAME[n]

        name = (value or "").strip().lower()
        if name not in ROL_NAME_TO_ID:
            raise serializers.ValidationError("Rol inválido.")
        return name


class RolUpdateSerializer(serializers.ModelSerializer):
    """
    IMPORTANTE: empresa NO se actualiza aquí.
    """
    nombre = serializers.CharField()

    class Meta:
        model = Rol
        fields = ["nombre", "descripcion"]  # <- sin empresa

    def validate_nombre(self, value):
        if isinstance(value, str) and value.strip().isdigit():
            n = int(value.strip())
            if n not in ROL_ID_TO_NAME:
                raise serializers.ValidationError("Rol inválido. Use 1..5.")
            return ROL_ID_TO_NAME[n]

        name = (value or "").strip().lower()
        if name not in ROL_NAME_TO_ID:
            raise serializers.ValidationError("Rol inválido.")
        return name


# apps/usuarios/serializers.py
from django.utils import timezone
from django.contrib.auth.hashers import make_password
from rest_framework import serializers

from apps.usuarios.models import Usuario, Rol, UsuarioRol
from apps.core.models import Empresa
from apps.empleados.models import Empleado
from apps.accounts.models import AuthUser


class UsuarioListSerializer(serializers.ModelSerializer):
    empresa_id = serializers.IntegerField(source="empresa.id", read_only=True)
    empresa_razon_social = serializers.CharField(source="empresa.razon_social", read_only=True)

    empleado_id = serializers.IntegerField(source="empleado.id", read_only=True)
    empleado_nombres = serializers.CharField(source="empleado.nombres", read_only=True)
    empleado_apellidos = serializers.CharField(source="empleado.apellidos", read_only=True)

    rol_id = serializers.SerializerMethodField()
    rol_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            "id",
            "email",
            "empleado_nombres",
            "empleado_apellidos",
            "rol_nombre",
            "empresa_razon_social",
            "phone",
            "mfa_habilitado",
            "estado",
            "ultimo_acceso",
            # extras útiles para editar:
            "empresa_id",
            "empleado_id",
            "rol_id",
        ]

    def _get_first_rol(self, obj):
        # viene prefetched (ideal), pero si no, igual funciona
        rels = getattr(obj, "roles_prefetch", None)
        if rels is not None:
            return rels[0].rol if rels else None

        ur = obj.usuariorol_set.select_related("rol").first()
        return ur.rol if ur else None

    def get_rol_id(self, obj):
        rol = self._get_first_rol(obj)
        return rol.id if rol else None

    def get_rol_nombre(self, obj):
        rol = self._get_first_rol(obj)
        return rol.nombre if rol else None


class UsuarioCreateSerializer(serializers.Serializer):
    empresa_id = serializers.IntegerField()
    empleado_id = serializers.IntegerField()
    rol_id = serializers.IntegerField()

    email = serializers.EmailField()
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    mfa_habilitado = serializers.BooleanField(default=False)
    estado = serializers.IntegerField(default=1)  # 1 activo, 2 bloqueado

    def validate(self, attrs):
        email = (attrs.get("email") or "").strip().lower()
        attrs["email"] = email

        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Las contraseñas no coinciden."})

        if attrs["estado"] not in (1, 2):
            raise serializers.ValidationError({"estado": "Estado inválido. Use 1=activo, 2=bloqueado."})

        # Email no debe repetirse (aunque no sea unique en DB)
        if Usuario.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({"email": "Ya existe un usuario con ese email."})
        if AuthUser.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({"email": "Ya existe un auth_user_tt con ese email."})

        # FK coherencia
        try:
            empresa = Empresa.objects.get(id=attrs["empresa_id"])
        except Empresa.DoesNotExist:
            raise serializers.ValidationError({"empresa_id": "Empresa no existe."})

        try:
            empleado = Empleado.objects.get(id=attrs["empleado_id"], empresa_id=empresa.id)
        except Empleado.DoesNotExist:
            raise serializers.ValidationError({"empleado_id": "Empleado no existe o no pertenece a la empresa."})

        try:
            rol = Rol.objects.get(id=attrs["rol_id"], empresa_id=empresa.id)
        except Rol.DoesNotExist:
            raise serializers.ValidationError({"rol_id": "Rol no existe o no pertenece a la empresa."})

        if (rol.nombre or "").strip().lower() == "superadmin":
            raise serializers.ValidationError({"rol_id": "No se puede asignar rol superadmin aquí."})

        attrs["empresa_obj"] = empresa
        attrs["empleado_obj"] = empleado
        attrs["rol_obj"] = rol
        return attrs

    def create(self, validated_data):
        empresa = validated_data["empresa_obj"]
        empleado = validated_data["empleado_obj"]
        rol = validated_data["rol_obj"]

        email = validated_data["email"]
        phone = validated_data.get("phone") or None
        password = validated_data["password"]
        mfa = validated_data.get("mfa_habilitado", False)
        estado = validated_data.get("estado", 1)

        # 1) Usuario (negocio)
        u = Usuario.objects.create(
            empresa=empresa,
            empleado=empleado,
            email=email,
            phone=phone,
            hash_password=make_password(password),  # coherencia con lo que guardas en usuario
            mfa_habilitado=mfa,
            estado=estado,
            ultimo_acceso=None,  # lo maneja auth/me
        )

        # 2) AuthUser (auth_user_tt)
        auth = AuthUser.objects.create_user(
            email=email,
            password=password,
            usuario=u,
            is_active=(estado == 1),
            is_staff=False,
            is_superuser=False,
        )

        # 3) UsuarioRol
        UsuarioRol.objects.create(usuario=u, rol=rol)

        return u


class UsuarioUpdateSerializer(serializers.Serializer):
    empleado_id = serializers.IntegerField()
    email = serializers.EmailField()
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    mfa_habilitado = serializers.BooleanField(default=False)
    estado = serializers.IntegerField(default=1)

    old_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    new_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    new_password2 = serializers.CharField(write_only=True, required=False, allow_blank=True)

    def validate(self, attrs):
        email = (attrs.get("email") or "").strip().lower()
        attrs["email"] = email

        if attrs["estado"] not in (1, 2):
            raise serializers.ValidationError({"estado": "Estado inválido. Use 1=activo, 2=bloqueado."})

        # Password change (si envía uno, debe enviar los 3)
        op = attrs.get("old_password") or ""
        np = attrs.get("new_password") or ""
        np2 = attrs.get("new_password2") or ""

        any_pw = bool(op or np or np2)
        if any_pw:
            if not (op and np and np2):
                raise serializers.ValidationError({"new_password2": "Para cambiar password envía: antigua, nueva y confirmación."})
            if np != np2:
                raise serializers.ValidationError({"new_password2": "La nueva contraseña no coincide."})

        return attrs

    def update(self, instance, validated_data):
        email = validated_data["email"]
        phone = validated_data.get("phone") or None
        mfa = validated_data.get("mfa_habilitado", False)
        estado = validated_data.get("estado", 1)
        empleado_id = validated_data["empleado_id"]

        # empleado debe pertenecer a la MISMA empresa del usuario
        if instance.empresa_id is None:
            raise serializers.ValidationError({"empresa": "Este usuario no tiene empresa asociada."})

        try:
            empleado = Empleado.objects.get(id=empleado_id, empresa_id=instance.empresa_id)
        except Empleado.DoesNotExist:
            raise serializers.ValidationError({"empleado_id": "Empleado no existe o no pertenece a la empresa."})

        # email uniqueness (excluyendo este usuario)
        if Usuario.objects.filter(email__iexact=email).exclude(id=instance.id).exists():
            raise serializers.ValidationError({"email": "Ya existe otro usuario con ese email."})

        # AuthUser ligado
        auth = AuthUser.objects.filter(usuario=instance).first()
        if not auth:
            raise serializers.ValidationError({"detail": "No existe auth_user_tt ligado a este usuario."})

        if AuthUser.objects.filter(email__iexact=email).exclude(id=auth.id).exists():
            raise serializers.ValidationError({"email": "Ya existe otro auth_user_tt con ese email."})

        # update campos
        instance.empleado = empleado
        instance.email = email
        instance.phone = phone
        instance.mfa_habilitado = mfa
        instance.estado = estado
        instance.save()

        auth.email = email
        auth.is_active = (estado == 1)

        # Cambio password si aplica
        op = validated_data.get("old_password") or ""
        np = validated_data.get("new_password") or ""
        if op and np:
            if not auth.check_password(op):
                raise serializers.ValidationError({"old_password": "Contraseña antigua incorrecta."})
            auth.set_password(np)
            instance.hash_password = make_password(np)
            instance.save()

        auth.save()
        return instance



# apps/usuarios/serializers.py
from rest_framework import serializers
from apps.usuarios.models import Permiso, Rol
from apps.core.models import Empresa


class PermisoListSerializer(serializers.ModelSerializer):
    rol_id = serializers.IntegerField(source="rol.id", read_only=True)
    rol_nombre = serializers.CharField(source="rol.nombre", read_only=True)

    empresa_id = serializers.IntegerField(source="rol.empresa.id", read_only=True)
    empresa_razon_social = serializers.CharField(source="rol.empresa.razon_social", read_only=True)

    class Meta:
        model = Permiso
        fields = [
            "id",
            "codigo",
            "descripcion",
            "rol_id",
            "rol_nombre",
            "empresa_id",
            "empresa_razon_social",
        ]


class PermisoCreateSerializer(serializers.Serializer):
    empresa_id = serializers.IntegerField()  # solo para validar/filtrar roles (NO existe en permiso)
    rol_id = serializers.IntegerField()
    codigo = serializers.CharField()
    descripcion = serializers.CharField(allow_blank=True, required=False)

    def validate(self, attrs):
        empresa_id = attrs["empresa_id"]
        rol_id = attrs["rol_id"]
        codigo = (attrs["codigo"] or "").strip()

        if not codigo:
            raise serializers.ValidationError({"codigo": "Código es obligatorio."})

        # validar empresa existe
        if not Empresa.objects.filter(id=empresa_id).exists():
            raise serializers.ValidationError({"empresa_id": "Empresa no existe."})

        # validar rol pertenece a empresa (y no es global)
        try:
            rol = Rol.objects.get(id=rol_id, empresa_id=empresa_id)
        except Rol.DoesNotExist:
            raise serializers.ValidationError({"rol_id": "Rol no existe o no pertenece a la empresa."})

        # (opcional) evitar duplicados por rol
        if Permiso.objects.filter(rol_id=rol_id, codigo__iexact=codigo).exists():
            raise serializers.ValidationError({"codigo": "Ya existe un permiso con ese código para este rol."})

        attrs["codigo"] = codigo
        attrs["rol_obj"] = rol
        return attrs

    def create(self, validated_data):
        return Permiso.objects.create(
            rol=validated_data["rol_obj"],
            codigo=validated_data["codigo"],
            descripcion=(validated_data.get("descripcion") or "").strip(),
        )


class PermisoUpdateSerializer(serializers.Serializer):
    empresa_id = serializers.IntegerField()  # para validar el nuevo rol
    rol_id = serializers.IntegerField()
    codigo = serializers.CharField()
    descripcion = serializers.CharField(allow_blank=True, required=False)

    def validate(self, attrs):
        empresa_id = attrs["empresa_id"]
        rol_id = attrs["rol_id"]
        codigo = (attrs["codigo"] or "").strip()

        if not codigo:
            raise serializers.ValidationError({"codigo": "Código es obligatorio."})

        if not Empresa.objects.filter(id=empresa_id).exists():
            raise serializers.ValidationError({"empresa_id": "Empresa no existe."})

        try:
            rol = Rol.objects.get(id=rol_id, empresa_id=empresa_id)
        except Rol.DoesNotExist:
            raise serializers.ValidationError({"rol_id": "Rol no existe o no pertenece a la empresa."})

        attrs["codigo"] = codigo
        attrs["rol_obj"] = rol
        return attrs


from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from apps.usuarios.models import Usuario


class MiUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            "id",
            "empresa_id",
            "empleado_id",
            "email",
            "phone",
            "mfa_habilitado",
            "estado",
            "ultimo_acceso",
        ]
        read_only_fields = [
            "id",
            "empresa_id",
            "empleado_id",
            "mfa_habilitado",
            "estado",
            "ultimo_acceso",
        ]


class MiUsuarioUpdateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    # password triple (opcional)
    new_password_1 = serializers.CharField(required=False, allow_blank=False)
    new_password_2 = serializers.CharField(required=False, allow_blank=False)
    new_password_3 = serializers.CharField(required=False, allow_blank=False)

    def validate(self, attrs):
        # Si llega cualquiera de los 3, exigimos los 3
        p1 = attrs.get("new_password_1")
        p2 = attrs.get("new_password_2")
        p3 = attrs.get("new_password_3")

        any_pass = any(x is not None for x in [p1, p2, p3])
        if any_pass:
            if not (p1 and p2 and p3):
                raise serializers.ValidationError("Para cambiar contraseña debes llenar las 3 repeticiones.")
            if not (p1 == p2 == p3):
                raise serializers.ValidationError("Las 3 contraseñas deben ser idénticas.")

            # valida reglas de Django (longitud, comunes, etc.)
            validate_password(p1)

        if "phone" in attrs and attrs["phone"] is not None:
            attrs["phone"] = str(attrs["phone"]).strip()

        return attrs


from rest_framework import serializers

class CambiarPasswordSerializer(serializers.Serializer):
    password_actual = serializers.CharField(write_only=True)
    password_nueva = serializers.CharField(write_only=True)
    password_nueva_repetir = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["password_nueva"] != attrs["password_nueva_repetir"]:
            raise serializers.ValidationError({"password_nueva_repetir": "La nueva contraseña no coincide."})
        if len(attrs["password_nueva"]) < 6:
            raise serializers.ValidationError({"password_nueva": "La nueva contraseña debe tener al menos 6 caracteres."})
        return attrs
