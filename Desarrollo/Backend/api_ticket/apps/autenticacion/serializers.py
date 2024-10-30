from rest_framework import serializers
from rest_framework import generics
from .models import Usuario
from .models import Cargo, Departamento


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = Usuario  
        fields = ['rut_usuario', 'dv_rut_usuario', 'nom_usuario', 'correo', 'telefono', 'cargo', 'password', 'password_confirm']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden.")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        rut_usuario = validated_data.pop('rut_usuario')
        dv_rut_usuario = validated_data.pop('dv_rut_usuario')
        correo = validated_data.pop('correo')
        password = validated_data.pop('password')
        user = Usuario.objects.create_user(
            rut_usuario=rut_usuario,
            dv_rut_usuario=dv_rut_usuario,
            correo=correo,
            password=password,
            **validated_data 
        )
        return user
    
class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Usuario"""

    class Meta:
        model = Usuario
        fields = ['rut_usuario', 'dv_rut_usuario', 'nom_usuario', 'correo', 'telefono', 'tipo_de_usuario', 'cargo', 'is_active', 'is_staff', 'is_superuser']
        read_only_fields = ['is_active', 'is_staff', 'is_superuser']  # Campos de solo lectura

    def validate_rut_usuario(self, value):
        # Validación para el RUT
        if len(str(value)) < 7 or len(str(value)) > 8:
            raise serializers.ValidationError("El RUT debe tener entre 7 y 8 dígitos.")
        return value

    def validate_dv_rut_usuario(self, value):
        # Validación para el dígito verificador
        if not (value.isdigit() or value.lower() == 'k'):
            raise serializers.ValidationError("El dígito verificador debe ser un número o 'K'.")
        return value


class CargoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cargo
        fields = ['id', 'nom_cargo', 'departamento']

class DepartamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departamento
        fields = ['id', 'nom_departamento']
"""
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Agregar el RUT al token si es necesario
        token['rut_usuario'] = user.rut_usuario
        return token

    def validate(self, attrs):
        # Ajustar para autenticar con el correo y rut_usuario
        correo = attrs.get('correo')
        password = attrs.get('password')

        try:
            user = Usuario.objects.get(correo=correo)
        except Usuario.DoesNotExist:
            raise serializers.ValidationError('Credenciales inválidas.')

        if not user.check_password(password):
            raise serializers.ValidationError('Credenciales inválidas.')

        return super().validate(attrs)
"""