# apps/auditoria/serializers_auditor_trazabilidad.py
from rest_framework import serializers
from apps.auditoria.models import LogAuditoria


class AuditorLogAuditoriaSerializer(serializers.ModelSerializer):
    usuario_email = serializers.CharField(source="usuario.email", read_only=True)
    fecha_solo = serializers.SerializerMethodField()
    hora_solo = serializers.SerializerMethodField()
    ip_label = serializers.SerializerMethodField()

    class Meta:
        model = LogAuditoria
        fields = [
            "id",
            "accion",
            "usuario_email",
            "entidad",
            "entidad_id",
            "fecha_solo",
            "hora_solo",
            "ip_label",
            "detalles",   # para HU02: ver detalle (modal)
        ]

    def get_fecha_solo(self, obj):
        # YYYY-MM-DD
        if not obj.fecha:
            return None
        return obj.fecha.date().isoformat()

    def get_hora_solo(self, obj):
        # HH:MM:SS (local del servidor; si quieres, luego lo formateamos en front)
        if not obj.fecha:
            return None
        return obj.fecha.time().strftime("%H:%M:%S")

    def get_ip_label(self, obj):
        return obj.ip if obj.ip else "IP No Registrada"
