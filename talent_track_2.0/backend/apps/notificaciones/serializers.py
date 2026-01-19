from rest_framework import serializers
from apps.notificaciones.models import Notificacion


CANAL_LABEL = {
    1: "app",
    2: "email",
    3: "whatsapp",
    4: "webhook",
}


class NotificacionEmpleadoSerializer(serializers.ModelSerializer):
    canal_label = serializers.SerializerMethodField()

    class Meta:
        model = Notificacion
        fields = [
            "id",
            "canal",
            "canal_label",
            "titulo",
            "mensaje",
            "enviada_el",
            "leida_el",
            "accion_url",
        ]

    def get_canal_label(self, obj):
        return CANAL_LABEL.get(obj.canal, f"canal({obj.canal})")
