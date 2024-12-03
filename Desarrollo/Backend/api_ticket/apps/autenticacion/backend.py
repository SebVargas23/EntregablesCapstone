from django.contrib.auth.backends import ModelBackend
from .models import Usuario

class CustomAuthBackend(ModelBackend):
    def authenticate(self, request, correo=None, password=None, **kwargs):
        try:
            user = Usuario.objects.get(correo=correo)
        except Usuario.DoesNotExist:
            return None
        if not user.is_active:
            return None
        if user.check_password(password):
            return user
        return None
    def get_user(self, user_id):
        try:
            return Usuario.objects.get(pk=user_id)
        except Usuario.DoesNotExist:
            return None
