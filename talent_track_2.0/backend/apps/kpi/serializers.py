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



# apps/kpi/serializers.py
from rest_framework import serializers
from apps.kpi.models import PlantillaKPI, KPI
from apps.core.models import Empresa


APLICA_A_MAP = {
    1: "puesto",
    2: "unidad",
    3: "empleado",
}


class PlantillaKPIListSerializer(serializers.ModelSerializer):
    empresa_id = serializers.IntegerField(source="empresa.id", read_only=True)
    empresa_razon_social = serializers.CharField(source="empresa.razon_social", read_only=True)
    aplica_a_label = serializers.SerializerMethodField()
    objetivos_resumen = serializers.SerializerMethodField()

    class Meta:
        model = PlantillaKPI
        fields = [
            "id",
            "empresa_id",
            "empresa_razon_social",
            "nombre",
            "aplica_a",
            "aplica_a_label",
            "objetivos",
            "objetivos_resumen",
        ]

    def get_aplica_a_label(self, obj):
        return APLICA_A_MAP.get(obj.aplica_a, f"desconocido({obj.aplica_a})")

    def get_objetivos_resumen(self, obj):
        """
        Nunca devolvemos el JSON en crudo en el front (aunque aquí salga en 'objetivos').
        Pero el front NO lo va a mostrar. Devolvemos un resumen legible:
        - "KPI: COD - Nombre | meta=90 | rojo=70 | amarillo=85"
        """
        objetivos = obj.objetivos or []
        if not isinstance(objetivos, list) or len(objetivos) == 0:
            return []

        # Traer todos los KPI implicados de una vez
        kpi_ids = [o.get("kpi_id") for o in objetivos if isinstance(o, dict) and o.get("kpi_id")]
        kpis = KPI.objects.filter(id__in=kpi_ids).only("id", "codigo", "nombre")
        kpi_map = {k.id: f"{k.codigo} - {k.nombre}" for k in kpis}

        resumen = []
        for o in objetivos:
            if not isinstance(o, dict):
                continue
            kid = o.get("kpi_id")
            label = kpi_map.get(kid, f"KPI #{kid}")
            resumen.append(
                {
                    "kpi_id": kid,
                    "kpi_label": label,
                    "meta": o.get("meta"),
                    "umbral_rojo": o.get("umbral_rojo"),
                    "umbral_amarillo": o.get("umbral_amarillo"),
                }
            )
        return resumen


class ObjetivoItemSerializer(serializers.Serializer):
    kpi_id = serializers.IntegerField()
    meta = serializers.IntegerField(min_value=0)
    umbral_rojo = serializers.IntegerField(min_value=0)
    umbral_amarillo = serializers.IntegerField(min_value=0)

    def validate(self, attrs):
        # regla de negocio opcional: rojo <= amarillo <= meta (si lo deseas)
        # Si no quieres esta regla, comenta esto.
        rojo = attrs["umbral_rojo"]
        amarillo = attrs["umbral_amarillo"]
        meta = attrs["meta"]

        if rojo > amarillo:
            raise serializers.ValidationError("umbral_rojo no puede ser mayor que umbral_amarillo.")
        if amarillo > meta:
            raise serializers.ValidationError("umbral_amarillo no puede ser mayor que meta.")
        return attrs


class PlantillaKPICreateSerializer(serializers.Serializer):
    empresa_id = serializers.IntegerField()
    nombre = serializers.CharField()
    aplica_a = serializers.IntegerField()
    objetivos = ObjetivoItemSerializer(many=True)

    def validate(self, attrs):
        empresa_id = attrs["empresa_id"]
        nombre = (attrs["nombre"] or "").strip()
        aplica_a = attrs["aplica_a"]
        objetivos = attrs.get("objetivos") or []

        if not nombre:
            raise serializers.ValidationError({"nombre": "Nombre es obligatorio."})

        if aplica_a not in (1, 2, 3):
            raise serializers.ValidationError({"aplica_a": "Valor inválido (1 puesto, 2 unidad, 3 empleado)."})

        if not Empresa.objects.filter(id=empresa_id).exists():
            raise serializers.ValidationError({"empresa_id": "Empresa no existe."})

        if not isinstance(objetivos, list) or len(objetivos) == 0:
            raise serializers.ValidationError({"objetivos": "Debe registrar al menos 1 objetivo."})

        # validar que cada kpi_id pertenezca a la empresa
        kpi_ids = [o["kpi_id"] for o in objetivos]
        existentes = set(KPI.objects.filter(empresa_id=empresa_id, id__in=kpi_ids).values_list("id", flat=True))
        faltantes = [kid for kid in kpi_ids if kid not in existentes]
        if faltantes:
            raise serializers.ValidationError({"objetivos": f"Estos kpi_id no pertenecen a la empresa: {faltantes}"})

        # evitar kpi repetidos dentro de objetivos
        if len(set(kpi_ids)) != len(kpi_ids):
            raise serializers.ValidationError({"objetivos": "No se permite repetir el mismo KPI en objetivos."})

        attrs["nombre"] = nombre
        return attrs

    def create(self, validated_data):
        return PlantillaKPI.objects.create(
            empresa_id=validated_data["empresa_id"],
            nombre=validated_data["nombre"],
            aplica_a=validated_data["aplica_a"],
            objetivos=validated_data["objetivos"],
        )


class PlantillaKPIUpdateSerializer(serializers.Serializer):
    # empresa NO se edita
    nombre = serializers.CharField()
    aplica_a = serializers.IntegerField()
    objetivos = ObjetivoItemSerializer(many=True)

    def validate(self, attrs):
        nombre = (attrs["nombre"] or "").strip()
        aplica_a = attrs["aplica_a"]
        objetivos = attrs.get("objetivos") or []

        if not nombre:
            raise serializers.ValidationError({"nombre": "Nombre es obligatorio."})
        if aplica_a not in (1, 2, 3):
            raise serializers.ValidationError({"aplica_a": "Valor inválido (1 puesto, 2 unidad, 3 empleado)."})
        if not isinstance(objetivos, list) or len(objetivos) == 0:
            raise serializers.ValidationError({"objetivos": "Debe registrar al menos 1 objetivo."})

        attrs["nombre"] = nombre
        return attrs
