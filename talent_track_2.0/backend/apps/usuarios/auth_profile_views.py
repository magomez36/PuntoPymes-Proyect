from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.empleados.models import Empleado

ROLE_HOME = {
    "superadmin": "/superadmin/inicio",
    "rrhh": "/rrhh/inicio",
    "manager": "/manager/inicio",
    "empleado": "/empleado/inicio",
    "auditor": "/auditor/inicio",
}


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        token = request.auth or {}

        rol = (token.get("rol") or "").lower()
        empleado_id = token.get("empleado_id")
        usuario_id = token.get("usuario_id")
        empresa_id = token.get("empresa_id")

        full_name = None

        # Para todos menos superadmin
        if rol != "superadmin" and empleado_id:
            emp = Empleado.objects.filter(id=empleado_id).first()
            if emp:
                full_name = f"{emp.nombres} {emp.apellidos}".strip() or None

        return Response({
            "usuario_id": usuario_id,
            "empresa_id": empresa_id,
            "empleado_id": empleado_id,
            "rol": rol,
            "redirect_to": ROLE_HOME.get(rol, "/login"),
            "full_name": full_name,
        })
