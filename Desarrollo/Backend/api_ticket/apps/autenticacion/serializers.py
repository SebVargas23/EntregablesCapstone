from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Usuario, Cargo, Departamento

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = Usuario
        fields = ['rut_usuario', 'dv_rut_usuario', 'nom_usuario', 'correo', 'telefono', 'cargo', 'role', 'password', 'password_confirm']  # Incluye role aquí

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden.")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        role = validated_data.pop('role', 'usuario')  # Extrae role con valor predeterminado de 'usuario'
        user = Usuario.objects.create_user(
            role=role,  # Pasa role explícitamente aquí o en extra_fields si usas create_user(**validated_data)
            **validated_data
        )
        return user

class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Usuario"""

    class Meta:
        model = Usuario
        fields = ['rut_usuario', 'dv_rut_usuario', 'nom_usuario', 'correo', 'telefono', 'cargo', 'is_active', 'is_staff', 'is_superuser']
        read_only_fields = ['is_active', 'is_staff', 'is_superuser']

    def validate_rut_usuario(self, value):
        if len(str(value)) < 7 or len(str(value)) > 8:
            raise serializers.ValidationError("El RUT debe tener entre 7 y 8 dígitos.")
        return value

    def validate_dv_rut_usuario(self, value):
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

# Serializador Personalizado para Token JWT
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Agregar 'nom_usuario' al token
        token['nom_usuario'] = user.nom_usuario
        # Agregar rol al token
        token['role'] = user.role
        return token
