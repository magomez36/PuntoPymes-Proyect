from rest_framework import serializers
from apps.kpi.models import AsignacionKPI, PlantillaKPI
from apps.empleados.models import Empleado


class AsignacionKPIListSerializer(serializers.ModelSerializer):
    empleado_nombres = serializers.CharField(source="empleado.nombres", read_only=True)
    empleado_apellidos = serializers.CharField(source="empleado.apellidos", read_only=True)
    empleado_email = serializers.CharField(source="empleado.email", read_only=True)
    plantilla_nombre = serializers.CharField(source="plantilla.nombre", read_only=True)

    class Meta:
        model = AsignacionKPI
        fields = [
            "id",
            "empleado",
            "empleado_nombres",
            "empleado_apellidos",
            "empleado_email",
            "plantilla",
            "plantilla_nombre",
            "desde",
            "hasta",
        ]


class AsignacionKPICreateSerializer(serializers.Serializer):
    empleado_id = serializers.IntegerField()
    plantilla_id = serializers.IntegerField()
    desde = serializers.DateField()
    hasta = serializers.DateField(required=False, allow_null=True)

    def validate(self, attrs):
        empresa_id = self.context.get("empresa_id")

        empleado_id = attrs.get("empleado_id")
        plantilla_id = attrs.get("plantilla_id")
        desde = attrs.get("desde")
        hasta = attrs.get("hasta")

        if hasta is not None and hasta < desde:
            raise serializers.ValidationError({"hasta": "La fecha 'hasta' no puede ser menor que 'desde'."})

        empleado = Empleado.objects.filter(id=empleado_id, empresa_id=empresa_id).first()
        if not empleado:
            raise serializers.ValidationError({"empleado_id": "Empleado no existe o no pertenece a su empresa."})

        plantilla = PlantillaKPI.objects.filter(id=plantilla_id, empresa_id=empresa_id).first()
        if not plantilla:
            raise serializers.ValidationError({"plantilla_id": "Plantilla KPI no existe o no pertenece a su empresa."})

        # Evitar duplicado exacto (coherencia mínima)
        if AsignacionKPI.objects.filter(
            empresa_id=empresa_id,
            empleado_id=empleado_id,
            plantilla_id=plantilla_id,
            desde=desde,
            hasta=hasta,
        ).exists():
            raise serializers.ValidationError({"detail": "Ya existe una asignación idéntica para ese empleado."})

        attrs["empleado_obj"] = empleado
        attrs["plantilla_obj"] = plantilla
        return attrs


class AsignacionKPIUpdateSerializer(serializers.Serializer):
    plantilla_id = serializers.IntegerField()
    desde = serializers.DateField()
    hasta = serializers.DateField(required=False, allow_null=True)

    def validate(self, attrs):
        empresa_id = self.context.get("empresa_id")
        desde = attrs.get("desde")
        hasta = attrs.get("hasta")

        if hasta is not None and hasta < desde:
            raise serializers.ValidationError({"hasta": "La fecha 'hasta' no puede ser menor que 'desde'."})

        plantilla_id = attrs.get("plantilla_id")
        plantilla = PlantillaKPI.objects.filter(id=plantilla_id, empresa_id=empresa_id).first()
        if not plantilla:
            raise serializers.ValidationError({"plantilla_id": "Plantilla KPI no existe o no pertenece a su empresa."})

        attrs["plantilla_obj"] = plantilla
        return attrs
