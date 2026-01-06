# apps/usuarios/serializers_auditor_accesos.py
from rest_framework import serializers
from apps.usuarios.models import Usuario, Rol, Permiso

ESTADO_USUARIO = {
    1: "activo",
    2: "bloqueado",
}


class AuditorUsuarioSerializer(serializers.ModelSerializer):
    empleado = serializers.SerializerMethodField()
    empresa = serializers.CharField(source="empresa.razon_social", read_only=True)

    roles_asignados = serializers.SerializerMethodField()
    mfa_habilitado_label = serializers.SerializerMethodField()
    estado_label = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            "id",
            "email",
            "empleado",
            "empresa",
            "roles_asignados",
            "phone",
            "mfa_habilitado_label",
            "estado_label",
            "ultimo_acceso",
        ]

    def get_empleado(self, obj):
        if not obj.empleado:
            return "N/A"
        full = f"{(obj.empleado.nombres or '').strip()} {(obj.empleado.apellidos or '').strip()}".strip()
        return full or "N/A"

    def get_roles_asignados(self, obj):
        # devuelve descripciones (o nombre si descripcion es null)
        roles = obj.usuariorol_set.select_related("rol").all()
        out = []
        for ur in roles:
            if not ur.rol:
                continue
            out.append((ur.rol.descripcion or ur.rol.nombre or "").strip())
        out = [x for x in out if x]
        return ", ".join(out) if out else "N/A"

    def get_mfa_habilitado_label(self, obj):
        return "Si" if obj.mfa_habilitado else "No"

    def get_estado_label(self, obj):
        return ESTADO_USUARIO.get(obj.estado, f"desconocido({obj.estado})")


class AuditorRolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ["id", "nombre", "descripcion"]


class AuditorPermisoSerializer(serializers.ModelSerializer):
    rol = serializers.CharField(source="rol.descripcion", read_only=True)

    class Meta:
        model = Permiso
        fields = ["id", "codigo", "descripcion", "rol"]
