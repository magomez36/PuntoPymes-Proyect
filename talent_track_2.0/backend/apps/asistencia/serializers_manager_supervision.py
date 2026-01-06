# apps/asistencia/serializers_manager_supervision.py
from rest_framework import serializers
from apps.asistencia.models import EventoAsistencia, JornadaCalculada

TIPO_EVENTO = {
    1: "check_in",
    2: "check_out",
    3: "pausa_in",
    4: "pausa_out",
}

FUENTE_MAP = {
    1: "app",
    2: "web",
    3: "lector",
}

ESTADO_JORNADA = {
    1: "completo",
    2: "incompleto",
    3: "sin_registros",
}


class EventoAsistenciaManagerSerializer(serializers.ModelSerializer):
    nombres = serializers.CharField(source="empleado.nombres", read_only=True)
    apellidos = serializers.CharField(source="empleado.apellidos", read_only=True)
    email = serializers.CharField(source="empleado.email", read_only=True)

    tipo_label = serializers.SerializerMethodField()
    fuente_label = serializers.SerializerMethodField()

    class Meta:
        model = EventoAsistencia
        fields = [
            "id",
            "empleado_id",
            "nombres",
            "apellidos",
            "email",
            "tipo",
            "tipo_label",
            "registrado_el",
            "fuente",
            "fuente_label",
        ]

    def get_tipo_label(self, obj):
        return TIPO_EVENTO.get(obj.tipo, f"desconocido({obj.tipo})")

    def get_fuente_label(self, obj):
        return FUENTE_MAP.get(obj.fuente, f"desconocido({obj.fuente})")


class JornadaDiaManagerSerializer(serializers.ModelSerializer):
    nombres = serializers.CharField(source="empleado.nombres", read_only=True)
    apellidos = serializers.CharField(source="empleado.apellidos", read_only=True)
    email = serializers.CharField(source="empleado.email", read_only=True)

    estado_label = serializers.SerializerMethodField()

    class Meta:
        model = JornadaCalculada
        fields = [
            "id",
            "empleado_id",
            "nombres",
            "apellidos",
            "email",
            "fecha",
            "hora_primera_entrada",
            "hora_ultimo_salida",
            "minutos_trabajados",
            "minutos_tardanza",
            "minutos_extra",
            "estado",
            "estado_label",
        ]

    def get_estado_label(self, obj):
        return ESTADO_JORNADA.get(obj.estado, f"desconocido({obj.estado})")
