from django.core.management.base import BaseCommand
from apps.usuarios.models import Usuario
from apps.accounts.models import AuthUser


class Command(BaseCommand):
    help = "Crea/actualiza AuthUser a partir de usuarios.Usuario"

    def handle(self, *args, **options):
        created = 0
        updated = 0
        skipped = 0

        for u in Usuario.objects.all():
            email = (u.email or "").strip().lower()
            if not email:
                skipped += 1
                continue

            auth, is_created = AuthUser.objects.get_or_create(email=email)
            auth.usuario = u

            # Copiar hash ya existente (Django lo entiende)
            if u.hash_password and auth.password != u.hash_password:
                auth.password = u.hash_password

            # Regla: estado 1 = activo (puede entrar), 2 = bloqueado (no puede)
            auth.is_active = (u.estado == 1)

            auth.save()

            if is_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(self.style.SUCCESS(
            f"AuthUser creados: {created}, actualizados: {updated}, saltados: {skipped}"
        ))
