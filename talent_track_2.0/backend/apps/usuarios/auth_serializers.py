from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from apps.usuarios.models import UsuarioRol

ROLE_HOME = {
    "superadmin": "/superadmin/inicio",
    "rrhh": "/rrhh/inicio",
    "manager": "/manager/inicio",
    "empleado": "/empleado/inicio",
    "auditor": "/auditor/inicio",
}

PRIORIDAD = ["superadmin", "rrhh", "manager", "auditor", "empleado"]


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        usuario = user.usuario
        if usuario:
            roles = list(
                UsuarioRol.objects.filter(usuario_id=usuario.id)
                .select_related("rol")
                .values_list("rol__nombre", flat=True)
            )
            roles_lower = [r.lower() for r in roles]
            rol_principal = next((r for r in PRIORIDAD if r in roles_lower), None) or (roles_lower[0] if roles_lower else None)

            token["usuario_id"] = usuario.id
            token["empresa_id"] = usuario.empresa_id
            token["empleado_id"] = usuario.empleado_id
            token["roles"] = roles
            token["rol"] = rol_principal

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        auth_user = self.user
        usuario = auth_user.usuario

        if not usuario:
            raise serializers.ValidationError("Usuario no vinculado. Ejecuta sync_auth_users.")

        if usuario.estado != 1:
            raise serializers.ValidationError("Usuario bloqueado o inactivo.")

        roles = list(
            UsuarioRol.objects.filter(usuario_id=usuario.id)
            .select_related("rol")
            .values_list("rol__nombre", flat=True)
        )
        roles_lower = [r.lower() for r in roles]

        if not roles:
            raise serializers.ValidationError("El usuario no tiene roles asignados.")

        rol_principal = next((r for r in PRIORIDAD if r in roles_lower), None) or roles_lower[0]

        if rol_principal == "superadmin":
            if usuario.empresa_id is not None or usuario.empleado_id is not None:
                raise serializers.ValidationError("Superadmin no debe estar asociado a empresa ni empleado.")
        else:
            if usuario.empresa_id is None or usuario.empleado_id is None:
                raise serializers.ValidationError(f"Usuario con rol '{rol_principal}' debe tener empresa y empleado asociados.")

        data["context"] = {
            "usuario_id": usuario.id,
            "empresa_id": usuario.empresa_id,
            "empleado_id": usuario.empleado_id,
            "roles": roles,
            "rol": rol_principal,
            "redirect_to": ROLE_HOME.get(rol_principal, "/login"),
        }

        return data
