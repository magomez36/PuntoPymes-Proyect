from rest_framework.exceptions import PermissionDenied


def get_scope(request):
    """
    Devuelve contexto desde el token:
    - rol
    - empresa_id
    - empleado_id
    """
    token = getattr(request, "auth", None)
    if not token:
        raise PermissionDenied("Token inválido o ausente.")

    return {
        "rol": token.get("rol"),
        "empresa_id": token.get("empresa_id"),
        "empleado_id": token.get("empleado_id"),
        "usuario_id": token.get("usuario_id"),
    }
