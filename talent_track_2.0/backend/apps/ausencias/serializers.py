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
