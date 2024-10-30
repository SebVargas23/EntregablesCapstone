from django.contrib.auth.backends import ModelBackend
from .models import Usuario

class CustomAuthBackend(ModelBackend):
   def authenticate(self, request, correo, password, **kwargs):
    if correo is None or password is None:
        print("err: authenticate está fallando, correo o contraseña son None")
        return None

    try:
        user = Usuario.objects.get(correo=correo)
        print(f"Usuario encontrado: {user}")  # Debug: show the user object
    except Usuario.DoesNotExist:
        print(f"err: Usuario no encontrado para el correo {correo}")
        return None  # Si el usuario no existe, retorna None

    if user.is_active:
        print(f"Usuario está activo: {user}")  # Debug: confirm the user is active
        if user.check_password(password):  # Verifica que la contraseña sea válida
            print(f"Contraseña válida para el usuario: {correo}")
            return user

    print("err: Usuario inactivo o contraseña incorrecta")
    return None

    def get_user(self, user_id):
        try:
            return Usuario.objects.get(pk=user_id)
        except Usuario.DoesNotExist:
            return None
