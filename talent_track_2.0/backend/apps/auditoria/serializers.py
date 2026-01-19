# apps/auditoria/serializers.py
from rest_framework import serializers
from apps.auditoria.models import LogAuditoria


class LogAuditoriaListSerializer(serializers.ModelSerializer):
    usuario = serializers.SerializerMethodField()
    fecha = serializers.SerializerMethodField()
    hora = serializers.SerializerMethodField()
    ip = serializers.SerializerMethodField()

    empresa_id = serializers.IntegerField(source="empresa.id", read_only=True)
    empresa_razon_social = serializers.CharField(source="empresa.razon_social", read_only=True)

    class Meta:
        model = LogAuditoria
        fields = [
            "id",
            "accion",
            "usuario",
            "entidad",
            "entidad_id",
            "fecha",
            "hora",
            "ip",
            "empresa_id",
            "empresa_razon_social",
        ]

    def get_usuario(self, obj):
        # email del usuario (si es null, devolvemos algo coherente)
        if obj.usuario and obj.usuario.email:
            return obj.usuario.email
        return "Usuario No Registrado"

    def get_fecha(self, obj):
        # yyyy-mm-dd
        if not obj.fecha:
            return None
        return obj.fecha.date().isoformat()

    def get_hora(self, obj):
        # hh:mm:ss
        if not obj.fecha:
            return None
        return obj.fecha.time().strftime("%H:%M:%S")

    def get_ip(self, obj):
        return obj.ip or "IP No Registrada"


class LogAuditoriaDetailSerializer(serializers.ModelSerializer):
    usuario_email = serializers.CharField(source="usuario.email", read_only=True, allow_null=True)
    empresa_razon_social = serializers.CharField(source="empresa.razon_social", read_only=True)

    class Meta:
        model = LogAuditoria
        fields = [
            "id",
            "empresa",
            "empresa_razon_social",
            "usuario",
            "usuario_email",
            "accion",
            "entidad",
            "entidad_id",
            "detalles",
            "fecha",
            "ip",
        ]
