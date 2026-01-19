from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from apps.usuarios.models import Rol
from apps.usuarios.permissions import IsSuperAdmin

from .serializers import RolReadSerializer, RolCreateSerializer, RolUpdateSerializer


class RolListCreateAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        qs = Rol.objects.select_related("empresa").all().order_by("id")
        return Response(RolReadSerializer(qs, many=True).data)

    def post(self, request):
        ser = RolCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        obj = ser.save()
        return Response(RolReadSerializer(obj).data, status=status.HTTP_201_CREATED)


class RolRetrieveUpdateDeleteAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request, pk):
        obj = get_object_or_404(Rol, pk=pk)
        return Response(RolReadSerializer(obj).data)

    def put(self, request, pk):
        obj = get_object_or_404(Rol, pk=pk)

        # 👇 empresa NO se toca porque el serializer no la incluye
        ser = RolUpdateSerializer(obj, data=request.data)
        ser.is_valid(raise_exception=True)
        obj = ser.save()

        return Response(RolReadSerializer(obj).data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        obj = get_object_or_404(Rol, pk=pk)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# apps/usuarios/views.py
from django.db.models import Prefetch
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.usuarios.models import Usuario, Rol, UsuarioRol
from apps.empleados.models import Empleado
from apps.accounts.models import AuthUser

from .serializers import (
    UsuarioListSerializer,
    UsuarioCreateSerializer,
    UsuarioUpdateSerializer,
)

# ---------------------------
# Helpers (para selects)
# ---------------------------

class EmpleadosPorEmpresaAPIView(APIView):
    def get(self, request):
        empresa_id = request.query_params.get("empresa_id")
        if not empresa_id:
            return Response([], status=200)

        qs = Empleado.objects.filter(empresa_id=empresa_id).order_by("id")
        data = [
            {
                "id": e.id,
                "email": e.email,
                "nombres": e.nombres,
                "apellidos": e.apellidos,
            }
            for e in qs
        ]
        return Response(data, status=200)


class RolesPorEmpresaAPIView(APIView):
    def get(self, request):
        empresa_id = request.query_params.get("empresa_id")
        if not empresa_id:
            return Response([], status=200)

        qs = Rol.objects.filter(empresa_id=empresa_id).exclude(nombre__iexact="superadmin").order_by("id")
        data = [{"id": r.id, "nombre": r.nombre, "descripcion": r.descripcion} for r in qs]
        return Response(data, status=200)


# ---------------------------
# CRUD Usuarios Empresa
# ---------------------------

class UsuariosEmpresaListCreateAPIView(APIView):
    def get(self, request):
        # EXCLUIR superadmin
        qs = (
            Usuario.objects
            .exclude(usuariorol__rol__nombre__iexact="superadmin")
            .select_related("empresa", "empleado")
            .prefetch_related(
                Prefetch(
                    "usuariorol_set",
                    queryset=UsuarioRol.objects.select_related("rol"),
                    to_attr="roles_prefetch",
                )
            )
            .order_by("id")
            .distinct()
        )
        return Response(UsuarioListSerializer(qs, many=True).data, status=200)

    def post(self, request):
        ser = UsuarioCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        u = ser.save()

        # devolver formato listado
        u_qs = (
            Usuario.objects
            .filter(id=u.id)
            .select_related("empresa", "empleado")
            .prefetch_related(
                Prefetch(
                    "usuariorol_set",
                    queryset=UsuarioRol.objects.select_related("rol"),
                    to_attr="roles_prefetch",
                )
            )
            .first()
        )
        return Response(UsuarioListSerializer(u_qs).data, status=status.HTTP_201_CREATED)


class UsuarioEmpresaDetalleAPIView(APIView):
    def get(self, request, pk):
        u = (
            Usuario.objects
            .select_related("empresa", "empleado")
            .prefetch_related(
                Prefetch(
                    "usuariorol_set",
                    queryset=UsuarioRol.objects.select_related("rol"),
                    to_attr="roles_prefetch",
                )
            )
            .filter(id=pk)
            .first()
        )
        if not u:
            return Response({"detail": "No encontrado."}, status=404)

        # NO permitir ver superadmin desde aquí (coherencia)
        if u.usuariorol_set.filter(rol__nombre__iexact="superadmin").exists():
            return Response({"detail": "No encontrado."}, status=404)

        return Response(UsuarioListSerializer(u).data, status=200)

    def put(self, request, pk):
        u = Usuario.objects.filter(id=pk).first()
        if not u:
            return Response({"detail": "No encontrado."}, status=404)

        if u.usuariorol_set.filter(rol__nombre__iexact="superadmin").exists():
            return Response({"detail": "No permitido."}, status=403)

        ser = UsuarioUpdateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        u = ser.update(u, ser.validated_data)

        u = (
            Usuario.objects
            .select_related("empresa", "empleado")
            .prefetch_related(
                Prefetch(
                    "usuariorol_set",
                    queryset=UsuarioRol.objects.select_related("rol"),
                    to_attr="roles_prefetch",
                )
            )
            .filter(id=u.id)
            .first()
        )
        return Response(UsuarioListSerializer(u).data, status=200)

    def delete(self, request, pk):
        u = Usuario.objects.filter(id=pk).first()
        if not u:
            return Response({"detail": "No encontrado."}, status=404)

        if u.usuariorol_set.filter(rol__nombre__iexact="superadmin").exists():
            return Response({"detail": "No permitido."}, status=403)

        # borrar auth_user_tt ligado
        AuthUser.objects.filter(usuario=u).delete()

        # usuario_rol cae por cascade, pero igual ok
        u.delete()
        return Response(status=204)


class UsuarioEmpresaToggleEstadoAPIView(APIView):
    def patch(self, request, pk):
        u = Usuario.objects.filter(id=pk).first()
        if not u:
            return Response({"detail": "No encontrado."}, status=404)

        if u.usuariorol_set.filter(rol__nombre__iexact="superadmin").exists():
            return Response({"detail": "No permitido."}, status=403)

        u.estado = 2 if u.estado == 1 else 1
        u.save()

        auth = AuthUser.objects.filter(usuario=u).first()
        if auth:
            auth.is_active = (u.estado == 1)
            auth.save()

        return Response({"estado": u.estado}, status=200)



# apps/usuarios/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.usuarios.models import Permiso, Rol
from .serializers import (
    PermisoListSerializer,
    PermisoCreateSerializer,
    PermisoUpdateSerializer,
)


class PermisosPorEmpresaAPIView(APIView):
    """
    GET /api/permisos-por-empresa/?empresa_id=1
    Lista permisos cuyos roles pertenecen a esa empresa.
    """
    def get(self, request):
        empresa_id = request.query_params.get("empresa_id")
        if not empresa_id:
            return Response([], status=200)

        qs = (
            Permiso.objects
            .select_related("rol", "rol__empresa")
            .filter(rol__empresa_id=empresa_id)
            .order_by("id")
        )
        return Response(PermisoListSerializer(qs, many=True).data, status=200)


class PermisoCreateAPIView(APIView):
    """
    POST /api/permisos/
    """
    def post(self, request):
        ser = PermisoCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        p = ser.save()

        p = Permiso.objects.select_related("rol", "rol__empresa").get(id=p.id)
        return Response(PermisoListSerializer(p).data, status=status.HTTP_201_CREATED)


class PermisoDetalleAPIView(APIView):
    """
    GET /api/permisos/<id>/
    PUT /api/permisos/<id>/
    DELETE /api/permisos/<id>/
    """
    def get(self, request, pk):
        p = (
            Permiso.objects
            .select_related("rol", "rol__empresa")
            .filter(id=pk)
            .first()
        )
        if not p:
            return Response({"detail": "No encontrado."}, status=404)
        return Response(PermisoListSerializer(p).data, status=200)

    def put(self, request, pk):
        p = Permiso.objects.filter(id=pk).first()
        if not p:
            return Response({"detail": "No encontrado."}, status=404)

        ser = PermisoUpdateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        # evitar duplicado en el nuevo rol (excluyendo a sí mismo)
        if Permiso.objects.filter(rol_id=data["rol_id"], codigo__iexact=data["codigo"]).exclude(id=p.id).exists():
            return Response({"codigo": ["Ya existe un permiso con ese código para este rol."]}, status=400)

        p.rol = data["rol_obj"]
        p.codigo = data["codigo"]
        p.descripcion = (data.get("descripcion") or "").strip()
        p.save()

        p = Permiso.objects.select_related("rol", "rol__empresa").get(id=p.id)
        return Response(PermisoListSerializer(p).data, status=200)

    def delete(self, request, pk):
        p = Permiso.objects.filter(id=pk).first()
        if not p:
            return Response({"detail": "No encontrado."}, status=404)
        p.delete()
        return Response(status=204)


from django.contrib.auth.hashers import make_password
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.usuarios.models import Usuario, UsuarioRol
from .serializers import MiUsuarioSerializer, MiUsuarioUpdateSerializer


def _ctx(request):
    u = request.user.usuario
    return u.empresa_id, u.empleado_id, u.id


def _require_empleado(request):
    return UsuarioRol.objects.filter(
        usuario_id=request.user.usuario.id,
        rol__nombre="empleado"
    ).exists()


class MiCuentaUsuarioAPIView(APIView):
    """
    GET /api/empleado/cuenta/
    PUT /api/empleado/cuenta/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not _require_empleado(request):
            return Response({"detail": "No autorizado."}, status=401)

        empresa_id, empleado_id, usuario_id = _ctx(request)

        obj = Usuario.objects.filter(id=usuario_id, empresa_id=empresa_id, empleado_id=empleado_id).first()
        if not obj:
            return Response({"detail": "Usuario no encontrado."}, status=404)

        return Response(MiUsuarioSerializer(obj).data, status=200)

    def put(self, request):
        if not _require_empleado(request):
            return Response({"detail": "No autorizado."}, status=401)

        empresa_id, empleado_id, usuario_id = _ctx(request)

        obj = Usuario.objects.filter(id=usuario_id, empresa_id=empresa_id, empleado_id=empleado_id).first()
        if not obj:
            return Response({"detail": "Usuario no encontrado."}, status=404)

        ser = MiUsuarioUpdateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        # actualizar email/phone
        if "email" in data:
            new_email = data["email"].strip().lower()
            # evitar duplicados en Usuario
            exists = Usuario.objects.filter(email=new_email).exclude(id=obj.id).exists()
            if exists:
                return Response({"email": "Ya existe un usuario con ese email."}, status=400)

            obj.email = new_email

            # reflejar en auth_user_tt (request.user)
            # (en tu sistema el autenticado es el que mapea a auth_user_tt)
            if hasattr(request.user, "email"):
                request.user.email = new_email
            if hasattr(request.user, "username"):
                # si username se usa como email, sincroniza
                request.user.username = new_email
            request.user.save()

        if "phone" in data:
            obj.phone = data.get("phone")

        # cambio de contraseña (si viene)
        if data.get("new_password_1"):
            new_pass = data["new_password_1"]

            # ✅ 1) auth_user_tt
            request.user.set_password(new_pass)
            request.user.save()

            # ✅ 2) Usuario.hash_password (tu tabla Usuario)
            obj.hash_password = make_password(new_pass)

        obj.save()

        return Response(MiUsuarioSerializer(obj).data, status=200)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.hashers import check_password, make_password

from apps.usuarios.models import Usuario
from apps.usuarios.scopes import get_scope
from .serializers import CambiarPasswordSerializer

class MiUsuarioCambiarPasswordAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        scope = get_scope(request)
        usuario_id = scope.get("usuario_id")
        empresa_id = scope.get("empresa_id")

        if not usuario_id or not empresa_id:
            return Response({"detail": "Token inválido (sin usuario/empresa)."}, status=401)

        user_tt = Usuario.objects.filter(id=usuario_id, empresa_id=empresa_id).first()
        if not user_tt:
            return Response({"detail": "Usuario no encontrado."}, status=404)

        ser = CambiarPasswordSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        # 1) validar password actual contra Usuario.hash_password
        if not check_password(data["password_actual"], user_tt.hash_password):
            return Response({"password_actual": "La contraseña actual es incorrecta."}, status=400)

        # 2) actualizar Usuario.hash_password
        new_hash = make_password(data["password_nueva"])
        user_tt.hash_password = new_hash
        user_tt.save()

        # 3) actualizar auth_user_tt.password (si existe relación)
        # En tu login usas AuthUser custom, aquí lo obtenemos desde request.user directamente:
        try:
            request.user.set_password(data["password_nueva"])
            request.user.save()
        except Exception:
            # si por alguna razón tu auth_user no se puede guardar, igual ya cambió en Usuario,
            # pero idealmente esto no debe fallar
            return Response({"detail": "Contraseña cambiada en Usuario pero falló en auth_user_tt."}, status=500)

        return Response({"detail": "Contraseña actualizada correctamente."}, status=200)
