from rest_framework import serializers
from .models import Empresa

PAISES = {
    1: "Argentina",
    2: "Bolivia",
    3: "Chile",
    4: "Colombia",
    5: "Costa Rica",
    6: "Cuba",
    7: "República Dominicana",
    8: "Ecuador",
    9: "El Salvador",
    10: "España",
    11: "Guatemala",
    12: "Honduras",
    13: "México",
    14: "Nicaragua",
    15: "Panamá",
    16: "Paraguay",
    17: "Perú",
    18: "Uruguay",
    19: "Venezuela",
}

MONEDAS = {
    1: "Peso argentino (ARS)",
    2: "Boliviano (BOB)",
    3: "Peso chileno (CLP)",
    4: "Peso colombiano (COP)",
    5: "Colón costarricense (CRC)",
    6: "Peso cubano (CUP)",
    7: "Peso dominicano (DOP)",
    8: "Dólar estadounidense (USD)",
    9: "Dólar estadounidense (USD)",
    10: "Euro (EUR)",
    11: "Quetzal (GTQ)",
    12: "Lempira (HNL)",
    13: "Peso mexicano (MXN)",
    14: "Córdoba nicaragüense (NIO)",
    15: "Balboa (PAB) / USD",
    16: "Guaraní paraguayo (PYG)",
    17: "Sol peruano (PEN)",
    18: "Peso uruguayo (UYU)",
    19: "Bolívar venezolano (VES)",
}

ESTADOS = {
    1: "activo",
    2: "inactivo",
}

class EmpresaSerializer(serializers.ModelSerializer):
    pais_nombre = serializers.SerializerMethodField()
    moneda_nombre = serializers.SerializerMethodField()
    estado_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Empresa
        fields = [
            'id',
            'razon_social',
            'nombre_comercial',
            'ruc_nit',
            'pais',
            'pais_nombre',
            'moneda',
            'moneda_nombre',
            'logo_url',
            'estado',
            'estado_nombre',
            'creada_el'
        ]

    def get_pais_nombre(self, obj):
        return PAISES.get(obj.pais, "Desconocido")

    def get_moneda_nombre(self, obj):
        return MONEDAS.get(obj.moneda, "Desconocida")

    def get_estado_nombre(self, obj):
        return ESTADOS.get(obj.estado, "Desconocido")
