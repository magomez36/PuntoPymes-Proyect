# apps/kpi/serializers.py
from rest_framework import serializers
from .models import KPI

UNIDADES = {
    1: "%",
    2: "puntos",
    3: "minutos",
    4: "horas",
}

ORIGEN_DATOS = {
    1: "asistencia",
    2: "evaluacion",
    3: "mixto",
}

class KPISerializer(serializers.ModelSerializer):
    empresa_nombre = serializers.SerializerMethodField()
    unidad_txt = serializers.SerializerMethodField()
    origen_datos_txt = serializers.SerializerMethodField()

    class Meta:
        model = KPI
        fields = [
            "id",
            "empresa",
            "empresa_nombre",
            "codigo",
            "nombre",
            "descripcion",
            "unidad",
            "unidad_txt",
            "origen_datos",
            "origen_datos_txt",
            "formula",
        ]

    def get_empresa_nombre(self, obj):
        return getattr(obj.empresa, "razon_social", None)

    def get_unidad_txt(self, obj):
        return UNIDADES.get(obj.unidad, "Desconocido")

    def get_origen_datos_txt(self, obj):
        return ORIGEN_DATOS.get(obj.origen_datos, "Desconocido")


class KPICreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = KPI
        # formula se fuerza NULL desde el back
        fields = ["empresa", "codigo", "nombre", "descripcion", "unidad", "origen_datos"]

    def create(self, validated_data):
        validated_data["formula"] = None
        return super().create(validated_data)


class KPIUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = KPI
        # No se cambia empresa ni formula
        fields = ["codigo", "nombre", "descripcion", "unidad", "origen_datos"]
