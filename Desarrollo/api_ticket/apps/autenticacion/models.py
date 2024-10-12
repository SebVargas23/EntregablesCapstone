
# Create your models here.
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.core.exceptions import ValidationError
import re

def validar_rut(rut):
    """Valida que el RUT tenga entre 7 y 8 dígitos"""
    if not (7 <= len(str(rut)) <= 8):
        raise ValidationError('El RUT debe tener entre 7 y 8 dígitos.')

def validar_dv(dv):
    """Valida que el dígito verificador sea un número o la letra 'k'"""
    if not re.match(r'^[0-9kK]{1}$', dv):
        raise ValidationError("El dígito verificador debe ser un número entre 0 y 9 o 'k'.")

class Departamento(models.Model):
    nom_departamento = models.CharField(max_length=255)

    def __str__(self):
        return self.nom_departamento    
      
class Cargo(models.Model):
    nom_cargo = models.CharField(max_length=255)
    departamento = models.ForeignKey(Departamento, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.nom_cargo} ({self.departamento})"

class UsuarioManager(BaseUserManager):
    """Gestor de usuarios personalizado"""
    
    def create_user(self, rut_usuario, dv_rut_usuario, correo, password=None, **extra_fields):
        if not correo:
            raise ValueError('El correo es obligatorio')
        if not rut_usuario:
            raise ValueError('El RUT es obligatorio')
        if not dv_rut_usuario:
            raise ValueError('El digito validador es obligatorio')

        correo = self.normalize_email(correo)
        user = self.model(rut_usuario=rut_usuario, dv_rut_usuario=dv_rut_usuario, correo=correo, **extra_fields)
        if password is None:
            raise ValueError('La contraseña es obligatoria')
        user.set_password(password)

        try:
            user.full_clean()  # Llama a los validadores antes de guardar
        except ValidationError as e:
            raise ValidationError(f'Error en la validación de los datos del usuario: {e}')

        user.save(using=self._db)
        return user
    
    def create_staff(self, rut_usuario, dv_rut_usuario, correo, password=None, **extra_fields):
        """Crea un usuario de tipo staff"""
        extra_fields.setdefault('is_staff', True)  
        extra_fields.setdefault('is_superuser', False) 

        return self.create_user(rut_usuario, dv_rut_usuario, correo, password, **extra_fields)

    def create_superuser(self, rut_usuario, dv_rut_usuario, correo, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)



        return self.create_user(rut_usuario, dv_rut_usuario, correo, password, **extra_fields)

class Usuario(AbstractBaseUser, PermissionsMixin):
    """Modelo personalizado de usuario"""
    
    rut_usuario = models.IntegerField(unique=True, primary_key=True, validators=[validar_rut])
    dv_rut_usuario = models.CharField(max_length=1, validators=[validar_dv])
    nom_usuario = models.CharField(max_length=255)
    correo = models.EmailField(unique=True, max_length=255)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    cargo = models.ForeignKey(Cargo, on_delete=models.SET_NULL, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # Indica si puede acceder al panel de administración
    is_superuser = models.BooleanField(default=False)  # Bandera para superusuario
    
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UsuarioManager()

    USERNAME_FIELD = 'correo'
    REQUIRED_FIELDS = ['rut_usuario', 'dv_rut_usuario', 'nom_usuario']

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return self.nom_usuario