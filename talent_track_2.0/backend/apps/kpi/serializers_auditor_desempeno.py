# apps/kpi/serializers_auditor_desempeno.py
from rest_framework import serializers
from apps.kpi.models import AsignacionKPI, PlantillaKPI, KPI, ResultadoKPI, EvaluacionDesempeno

APLICA_A = {1: "puesto", 2: "unidad", 3: "empleado"}
KPI_UNIDAD = {1: "%", 2: "puntos", 3: "minutos", 4: "horas"}
KPI_ORIGEN = {1: "asistencia", 2: "evaluacion", 3: "mixto"}
RESULT_CLASIF = {1: "verde", 2: "amarillo", 3: "rojo"}
EVAL_TIPO = {1: "auto", 2: "manager", 3: "360"}


class AuditorAsignacionKPISerializer(serializers.ModelSerializer):
    nombres = serializers.CharField(source="empleado.nombres", read_only=True)
    apellidos = serializers.CharField(source="empleado.apellidos", read_only=True)
    email = serializers.CharField(source="empleado.email", read_only=True)
    plantilla_nombre = serializers.CharField(source="plantilla.nombre", read_only=True)

    class Meta:
        model = AsignacionKPI
        fields = [
            "id",
            "nombres",
            "apellidos",
            "email",
            "plantilla_nombre",
            "desde",
            "hasta",
        ]


class AuditorPlantillaKPISerializer(serializers.ModelSerializer):
    aplica_a_label = serializers.SerializerMethodField()
    objetivos_humanos = serializers.SerializerMethodField()

    class Meta:
        model = PlantillaKPI
        fields = ["id", "nombre", "aplica_a_label", "objetivos_humanos"]

    def get_aplica_a_label(self, obj):
        return APLICA_A.get(obj.aplica_a, f"desconocido({obj.aplica_a})")

    def get_objetivos_humanos(self, obj):
        """
        obj.objetivos es JSONField con lista de dicts:
        [{meta, kpi_id, umbral_rojo, umbral_amarillo}, ...]
        Lo devolvemos "ordenado" y sin mostrar JSON crudo.
        """
        if not obj.objetivos:
            return []

        # Traer KPIs para mapear kpi_id -> codigo/nombre
        kpi_ids = [o.get("kpi_id") for o in obj.objetivos if isinstance(o, dict) and o.get("kpi_id")]
        kpis = {k.id: k for k in KPI.objects.filter(id__in=kpi_ids)}

        out = []
        for o in obj.objetivos:
            if not isinstance(o, dict):
                continue
            kpi_id = o.get("kpi_id")
            kpi = kpis.get(kpi_id)
            out.append(
                {
                    "kpi": (f"{kpi.codigo} - {kpi.nombre}" if kpi else f"KPI #{kpi_id}"),
                    "meta": o.get("meta"),
                    "umbral_rojo": o.get("umbral_rojo"),
                    "umbral_amarillo": o.get("umbral_amarillo"),
                }
            )
        return out


class AuditorKPISerializer(serializers.ModelSerializer):
    unidad_label = serializers.SerializerMethodField()
    origen_label = serializers.SerializerMethodField()

    class Meta:
        model = KPI
        fields = ["id", "codigo", "nombre", "descripcion", "unidad_label", "origen_label"]

    def get_unidad_label(self, obj):
        return KPI_UNIDAD.get(obj.unidad, f"desconocido({obj.unidad})")

    def get_origen_label(self, obj):
        return KPI_ORIGEN.get(obj.origen_datos, f"desconocido({obj.origen_datos})")


class AuditorResultadoKPISerializer(serializers.ModelSerializer):
    nombres = serializers.CharField(source="empleado.nombres", read_only=True)
    apellidos = serializers.CharField(source="empleado.apellidos", read_only=True)
    email = serializers.CharField(source="empleado.email", read_only=True)

    kpi_codigo = serializers.CharField(source="kpi.codigo", read_only=True)
    kpi_nombre = serializers.CharField(source="kpi.nombre", read_only=True)

    clasificacion_label = serializers.SerializerMethodField()

    class Meta:
        model = ResultadoKPI
        fields = [
            "id",
            "nombres",
            "apellidos",
            "email",
            "kpi_codigo",
            "kpi_nombre",
            "periodo",
            "valor",
            "cumplimiento_pct",
            "clasificacion_label",
            "calculado_el",
            "fuente",
        ]

    def get_clasificacion_label(self, obj):
        return RESULT_CLASIF.get(obj.clasificacion, f"desconocido({obj.clasificacion})")


class AuditorEvaluacionDesempenoSerializer(serializers.ModelSerializer):
    nombres = serializers.CharField(source="empleado.nombres", read_only=True)
    apellidos = serializers.CharField(source="empleado.apellidos", read_only=True)
    email = serializers.CharField(source="empleado.email", read_only=True)

    evaluador_nombre = serializers.SerializerMethodField()
    tipo_label = serializers.SerializerMethodField()
    instrumento_items = serializers.SerializerMethodField()

    class Meta:
        model = EvaluacionDesempeno
        fields = [
            "id",
            "nombres",
            "apellidos",
            "email",
            "evaluador_nombre",
            "periodo",
            "tipo_label",
            "instrumento_items",
            "puntaje_total",
            "comentarios",
            "fecha",
        ]

    def get_evaluador_nombre(self, obj):
        # evaluador es Empleado (FK) en tu modelo
        if not obj.evaluador_id or not obj.evaluador:
            return "N/A"
        return f"{obj.evaluador.nombres} {obj.evaluador.apellidos}".strip()

    def get_tipo_label(self, obj):
        return EVAL_TIPO.get(obj.tipo, f"desconocido({obj.tipo})")

    def get_instrumento_items(self, obj):
        """
        instrumento JSON:
        [{peso: 0.3, competencia: 'Trabajo en equipo'}, ...]
        lo devolvemos como lista simple sin mostrar JSON crudo.
        """
        if not obj.instrumento:
            return []
        out = []
        for it in obj.instrumento:
            if isinstance(it, dict):
                out.append(
                    {
                        "competencia": it.get("competencia", "N/A"),
                        "peso": it.get("peso", 0),
                    }
                )
        return out
