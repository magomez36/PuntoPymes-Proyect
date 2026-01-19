from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.usuarios.permissions import IsEmpleado
from apps.usuarios.scopes import get_scope
from apps.usuarios.models import UsuarioRol
from apps.notificaciones.models import Notificacion


class SoporteRRHHAdminsView(APIView):
    """
    GET /api/empleado/soporte/rrhh-admins/
    Devuelve lista de Admin RRHH (solo de MI empresa).
    """
    permission_classes = [IsAuthenticated, IsEmpleado]

    def get(self, request):
        scope = get_scope(request)
        empresa_id = scope["empresa_id"]

        qs = (
            UsuarioRol.objects
            .select_related("usuario", "usuario__empleado", "rol")
            .filter(
                rol__nombre__iexact="rrhh",
                usuario__empresa_id=empresa_id,
                usuario__empleado__isnull=False,
            )
        )

        data = []
        for ur in qs:
            u = ur.usuario
            e = u.empleado
            data.append({
                "usuario_id": u.id,
                "empleado_id": e.id,
                "nombres": e.nombres,
                "apellidos": e.apellidos,
                "email": u.email,
                "phone": u.phone,
            })

        return Response(data, status=200)


class SoporteEnviarNotificacionView(APIView):
    """
    POST /api/empleado/soporte/enviar/
    Crea notificaciones a uno o varios Admin RRHH seleccionados.
    Body:
    {
      "destinatarios_empleado_ids": [12, 15],
      "titulo": "Permiso / duda",
      "mensaje": "Hola, necesito ayuda con..."
    }
    """
    permission_classes = [IsAuthenticated, IsEmpleado]

    def post(self, request):
        scope = get_scope(request)
        empresa_id = scope["empresa_id"]

        destinatarios = request.data.get("destinatarios_empleado_ids") or []
        titulo = (request.data.get("titulo") or "").strip()
        mensaje = (request.data.get("mensaje") or "").strip()

        if not isinstance(destinatarios, list) or len(destinatarios) == 0:
            return Response({"detail": "Selecciona al menos 1 Admin RRHH."}, status=400)
        if not titulo:
            return Response({"detail": "El título/asunto es obligatorio."}, status=400)
        if not mensaje:
            return Response({"detail": "El mensaje es obligatorio."}, status=400)

        # Validar que esos empleados seleccionados realmente son RRHH de mi empresa
        rrhh_empleado_ids_validos = set(
            UsuarioRol.objects
            .filter(
                rol__nombre__iexact="rrhh",
                usuario__empresa_id=empresa_id,
                usuario__empleado_id__in=destinatarios,
            )
            .values_list("usuario__empleado_id", flat=True)
        )

        invalidos = [x for x in destinatarios if x not in rrhh_empleado_ids_validos]
        if invalidos:
            return Response(
                {"detail": f"Destinatarios inválidos/no RRHH en tu empresa: {invalidos}"},
                status=400
            )

        now = timezone.now()

        creadas = 0
        for emp_id in rrhh_empleado_ids_validos:
            Notificacion.objects.create(
                empresa_id=empresa_id,
                empleado_id=emp_id,
                canal=2,               # 2 = web (ajústalo si ya manejas enum)
                titulo=titulo,
                mensaje=mensaje,
                enviada_el=now,
                accion_url=None,
            )
            creadas += 1

        return Response({"ok": True, "creadas": creadas}, status=201)
