from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .auth_views import LoginView

from .auth_profile_views import MeView

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
]
