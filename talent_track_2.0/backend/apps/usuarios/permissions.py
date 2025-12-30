from rest_framework.permissions import BasePermission


def _get_role(request):
    # SimpleJWT guarda claims en request.auth (token decodificado)
    token = getattr(request, "auth", None)
    if not token:
        return None
    return token.get("rol") or token.get("role")


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return _get_role(request) == "superadmin"


class IsRRHH(BasePermission):
    def has_permission(self, request, view):
        return _get_role(request) == "rrhh"


class IsManager(BasePermission):
    def has_permission(self, request, view):
        return _get_role(request) == "manager"


class IsEmpleado(BasePermission):
    def has_permission(self, request, view):
        return _get_role(request) == "empleado"


class IsAuditor(BasePermission):
    def has_permission(self, request, view):
        return _get_role(request) == "auditor"
