from decimal import Decimal
from rest_framework import serializers
from apps.ausencias.models import SaldoVacaciones
from apps.empleados.models import Empleado


class SaldoVacacionesListSerializer(serializers.ModelSerializer):
    empleado_nombres = serializers.CharField(source="empleado.nombres", read_only=True)
    empleado_apellidos = serializers.CharField(source="empleado.apellidos", read_only=True)
    empleado_email = serializers.CharField(source="empleado.email", read_only=True)

    class Meta:
        model = SaldoVacaciones
        fields = [
            "id",
            "empleado",
            "empleado_nombres",
            "empleado_apellidos",
            "empleado_email",
            "periodo",
            "dias_asignados",
            "dias_tomados",
            "dias_disponibles",
        ]


class SaldoVacacionesCreateSerializer(serializers.Serializer):
    empleado_id = serializers.IntegerField()
    periodo = serializers.CharField(max_length=150)
    dias_asignados = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=Decimal("0.00"))

    def validate(self, attrs):
        empresa_id = self.context.get("empresa_id")

        empleado_id = attrs.get("empleado_id")
        periodo = (attrs.get("periodo") or "").strip()

        if not periodo:
            raise serializers.ValidationError({"periodo": "Periodo es obligatorio."})

        empleado = Empleado.objects.filter(id=empleado_id, empresa_id=empresa_id).first()
        if not empleado:
            raise serializers.ValidationError({"empleado_id": "Empleado no existe o no pertenece a su empresa."})

        # RESTRICCIÓN OBLIGATORIA: no duplicar periodo por empleado
        if SaldoVacaciones.objects.filter(empresa_id=empresa_id, empleado_id=empleado_id, periodo=periodo).exists():
            raise serializers.ValidationError({"periodo": "Ese periodo ya existe para este empleado."})

        attrs["periodo"] = periodo
        attrs["empleado_obj"] = empleado
        return attrs


class SaldoVacacionesPatchPeriodoSerializer(serializers.Serializer):
    periodo = serializers.CharField(max_length=150)

    def validate(self, attrs):
        periodo = (attrs.get("periodo") or "").strip()
        if not periodo:
            raise serializers.ValidationError({"periodo": "Periodo es obligatorio."})
        attrs["periodo"] = periodo
        return attrs
