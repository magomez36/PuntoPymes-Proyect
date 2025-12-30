# apps/asistencia/serializers.py
from rest_framework import serializers
from .models import Turno


class TurnoSerializer(serializers.ModelSerializer):
    empresa_razon_social = serializers.CharField(source="empresa.razon_social", read_only=True)
    dias_semana_texto = serializers.SerializerMethodField()

    class Meta:
        model = Turno
        fields = [
            "id",
            "empresa",
            "empresa_razon_social",
            "nombre",
            "hora_inicio",
            "hora_fin",
            "dias_semana",
            "dias_semana_texto",
            "tolerancia_minutos",
            "requiere_gps",
            "requiere_foto",
        ]

    def get_dias_semana_texto(self, obj):
        """
        Convierte jsonb a string bonito: "Lun, Mar, Mié..."
        Espera formato:
        [
          {"num":1,"nombre":"lunes"},
          ...
        ]
        """
        if not obj.dias_semana:
            return ""
        try:
            nombres = [d.get("nombre", "") for d in obj.dias_semana if isinstance(d, dict)]
            nombres = [n for n in nombres if n]
            # Capitaliza primera letra
            nombres = [n[:1].upper() + n[1:] for n in nombres]
            return ", ".join(nombres)
        except Exception:
            return ""


class TurnoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turno
        fields = [
            "empresa",
            "nombre",
            "hora_inicio",
            "hora_fin",
            "dias_semana",
            "tolerancia_minutos",
            "requiere_gps",
            "requiere_foto",
        ]

    def validate_tolerancia_minutos(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("tolerancia_minutos no puede ser negativo.")
        return value


class TurnoUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turno
        fields = [
            "nombre",
            "hora_inicio",
            "hora_fin",
            "dias_semana",
            "tolerancia_minutos",
            "requiere_gps",
            "requiere_foto",
        ]

    def validate_tolerancia_minutos(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("tolerancia_minutos no puede ser negativo.")
        return value
    

# apps/asistencia/serializers.py
from rest_framework import serializers
from .models import ReglaAsistencia

CALCULO_HORAS_EXTRA = {
    1: "Tope diario",
    2: "Tope semanal",
}

class ReglaAsistenciaListSerializer(serializers.ModelSerializer):
    empresa_razon_social = serializers.CharField(source="empresa.razon_social", read_only=True)
    calculo_horas_extra_nombre = serializers.SerializerMethodField()

    class Meta:
        model = ReglaAsistencia
        fields = [
            "id",
            "empresa",
            "empresa_razon_social",
            "considera_tardanza_desde_min",
            "calculo_horas_extra",
            "calculo_horas_extra_nombre",
        ]

    def get_calculo_horas_extra_nombre(self, obj):
        return CALCULO_HORAS_EXTRA.get(obj.calculo_horas_extra, "Desconocido")


class ReglaAsistenciaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReglaAsistencia
        fields = ["empresa", "considera_tardanza_desde_min", "calculo_horas_extra"]

    def validate_considera_tardanza_desde_min(self, value):
        if value is None:
            return value
        if int(value) < 0:
            raise serializers.ValidationError("No se permiten números negativos.")
        return value

    def create(self, validated_data):
        # forzamos NULL en geocerca e ip_permitidas (como pediste)
        validated_data["geocerca"] = None
        validated_data["ip_permitidas"] = None
        return super().create(validated_data)


class ReglaAsistenciaUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReglaAsistencia
        fields = ["considera_tardanza_desde_min", "calculo_horas_extra"]

    def validate_considera_tardanza_desde_min(self, value):
        if value is None:
            return value
        if int(value) < 0:
            raise serializers.ValidationError("No se permiten números negativos.")
        return value

