from django.contrib.auth.backends import ModelBackend
from apps.accounts.models import AuthUser


class EmailBackend(ModelBackend):
    """
    Permite authenticate(email=..., password=...)
    Funciona con tu AUTH_USER_MODEL (AuthUser).
    """

    def authenticate(self, request, username=None, password=None, email=None, **kwargs):
        # SimpleJWT nos mandará email=...
        identifier = email or username
        if not identifier or not password:
            return None

        try:
            user = AuthUser.objects.get(email__iexact=identifier.strip().lower())
        except AuthUser.DoesNotExist:
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user

        return None
