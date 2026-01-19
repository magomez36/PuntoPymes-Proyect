# apps/ausencias/serializers.py
from rest_framework import serializers
from .models import TipoAusencia

class TipoAusenciaSerializer(serializers.ModelSerializer):
    empresa_nombre = serializers.SerializerMethodField()
    afecta_sueldo_txt = serializers.SerializerMethodField()
    requiere_soporte_txt = serializers.SerializerMethodField()

    class Meta:
        model = TipoAusencia
        fields = [
            "id",
            "empresa",
            "empresa_nombre",
            "nombre",
            "afecta_sueldo",
            "afecta_sueldo_txt",
            "requiere_soporte",
            "requiere_soporte_txt",
        ]

    def get_empresa_nombre(self, obj):
        # razon_social en Empresa
        return getattr(obj.empresa, "razon_social", None)

    def get_afecta_sueldo_txt(self, obj):
        return "Si" if bool(obj.afecta_sueldo) else "No"

    def get_requiere_soporte_txt(self, obj):
        return "Si" if bool(obj.requiere_soporte) else "No"


class TipoAusenciaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoAusencia
        fields = ["empresa", "nombre", "afecta_sueldo", "requiere_soporte"]


class TipoAusenciaUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoAusencia
        # NO permitimos cambiar empresa en update (según tu HU03)
        fields = ["nombre", "afecta_sueldo", "requiere_soporte"]


from rest_framework import serializers
from datetime import timedelta
from apps.ausencias.models import SolicitudAusencia, TipoAusencia

ESTADO_LABEL = {
    1: "pendiente",
    2: "aprobado",
    3: "rechazado",
    4: "cancelado",
}


class SolicitudAusenciaEmpleadoSerializer(serializers.ModelSerializer):
    estado_label = serializers.SerializerMethodField()
    tipo_ausencia_nombre = serializers.CharField(source="tipo_ausencia.nombre", read_only=True)

    class Meta:
        model = SolicitudAusencia
        fields = [
            "id",
            "fecha_inicio",
            "fecha_fin",
            "dias_habiles",
            "motivo",
            "estado",
            "estado_label",
            "flujo_actual",
            "tipo_ausencia",
            "tipo_ausencia_nombre",
            "creada_el",
        ]

    def get_estado_label(self, obj):
        return ESTADO_LABEL.get(obj.estado, f"estado({obj.estado})")


class CrearSolicitudAusenciaSerializer(serializers.Serializer):
    id_tipo_ausencia = serializers.IntegerField()
    fecha_inicio = serializers.DateField()
    fecha_fin = serializers.DateField(required=False, allow_null=True)
    motivo = serializers.CharField()

    def validate(self, attrs):
        fi = attrs["fecha_inicio"]
        ff = attrs.get("fecha_fin") or fi
        if ff < fi:
            raise serializers.ValidationError("fecha_fin no puede ser menor a fecha_inicio")

        attrs["dias_habiles"] = (ff - fi).days + 1
        return attrs
