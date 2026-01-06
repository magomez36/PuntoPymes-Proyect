# apps/asistencia/serializers_auditor_asistencia.py
from rest_framework import serializers
from apps.asistencia.models import EventoAsistencia, JornadaCalculada, AsignacionTurno

EVENTO_TIPO = {1: "check_in", 2: "check_out", 3: "pausa_in", 4: "pausa_out"}
EVENTO_FUENTE = {1: "app", 2: "web", 3: "lector"}
JORNADA_ESTADO = {1: "completo", 2: "incompleto", 3: "sin_registros"}


def _dias_semana_humano(dias_json):
    """
    dias_json ejemplo:
    [{"num":1,"nombre":"lunes"}, ...]
    Salida: "Lun, Mar, Mié, Jue, Vie" (ordenado por num)
    """
    if not dias_json:
        return "N/A"
    if not isinstance(dias_json, list):
        return "N/A"

    items = []
    for d in dias_json:
        if isinstance(d, dict) and "num" in d and "nombre" in d:
            items.append((d.get("num"), d.get("nombre")))
    items.sort(key=lambda x: x[0] if x[0] is not None else 999)

    abrev = {
        "lunes": "Lun",
        "martes": "Mar",
        "miércoles": "Mié",
        "miercoles": "Mié",
        "jueves": "Jue",
        "viernes": "Vie",
        "sábado": "Sáb",
        "sabado": "Sáb",
        "domingo": "Dom",
    }

    out = []
    for _, nombre in items:
        n = (nombre or "").strip().lower()
        out.append(abrev.get(n, nombre))
    return ", ".join(out) if out else "N/A"


class AuditorEventoAsistenciaSerializer(serializers.ModelSerializer):
    nombres = serializers.CharField(source="empleado.nombres", read_only=True)
    apellidos = serializers.CharField(source="empleado.apellidos", read_only=True)
    email = serializers.CharField(source="empleado.email", read_only=True)

    tipo_label = serializers.SerializerMethodField()
    fuente_label = serializers.SerializerMethodField()

    class Meta:
        model = EventoAsistencia
        fields = [
            "id",
            "nombres",
            "apellidos",
            "email",
            "tipo_label",
            "registrado_el",
            "fuente_label",
            "ip",
            "observaciones",
        ]

    def get_tipo_label(self, obj):
        return EVENTO_TIPO.get(obj.tipo, f"desconocido({obj.tipo})")

    def get_fuente_label(self, obj):
        return EVENTO_FUENTE.get(obj.fuente, f"desconocido({obj.fuente})")


class AuditorJornadaCalculadaSerializer(serializers.ModelSerializer):
    nombres = serializers.CharField(source="empleado.nombres", read_only=True)
    apellidos = serializers.CharField(source="empleado.apellidos", read_only=True)
    email = serializers.CharField(source="empleado.email", read_only=True)
    estado_label = serializers.SerializerMethodField()

    class Meta:
        model = JornadaCalculada
        fields = [
            "id",
            "nombres",
            "apellidos",
            "email",
            "fecha",
            "hora_primera_entrada",
            "hora_ultimo_salida",
            "minutos_trabajados",
            "minutos_tardanza",
            "minutos_extra",
            "estado_label",
        ]

    def get_estado_label(self, obj):
        return JORNADA_ESTADO.get(obj.estado, f"desconocido({obj.estado})")


class AuditorAsignacionTurnoSerializer(serializers.ModelSerializer):
    nombres = serializers.CharField(source="empleado.nombres", read_only=True)
    apellidos = serializers.CharField(source="empleado.apellidos", read_only=True)
    email = serializers.CharField(source="empleado.email", read_only=True)

    turno_nombre = serializers.CharField(source="turno.nombre", read_only=True)
    dias_semana_label = serializers.SerializerMethodField()
    es_rotativo_label = serializers.SerializerMethodField()

    class Meta:
        model = AsignacionTurno
        fields = [
            "id",
            "nombres",
            "apellidos",
            "email",
            "hora_inicio",
            "hora_fin",
            "turno_nombre",
            "dias_semana_label",
            "es_rotativo_label",
        ]

    def get_dias_semana_label(self, obj):
        dias = getattr(obj.turno, "dias_semana", None)
        return _dias_semana_humano(dias)

    def get_es_rotativo_label(self, obj):
        return "Si" if obj.es_rotativo else "No"
