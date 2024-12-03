from rest_framework import permissions
from knox.views import LoginView as KnoxLoginView
from django.contrib.auth import authenticate, login
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserCreateSerializer
from rest_framework import generics
from .models import Cargo
from .serializers import CargoSerializer, CustomTokenObtainPairSerializer, UsuarioSerializer
from rest_framework_simplejwt.views import TokenObtainPairView # type: ignore
from django.contrib.auth import get_user_model
from api.logger import logger
from rest_framework.decorators import api_view
from .models import Usuario
from apps.tickets.models import Ticket

class LoginView(KnoxLoginView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        # Registro del intento de inicio de sesión
        logger.info("Intento de inicio de sesión con correo: %s", request.data.get('correo'))

        # Autenticación del usuario con correo y contraseña
        correo = request.data.get('correo')
        password = request.data.get('password')

        try:
            # Autenticación
            user = authenticate(request, correo=correo, password=password)
            if user is None:
                logger.warning("Inicio de sesión fallido para correo: %s", correo)
                return Response({"error": "Credenciales no válidas"}, status=400)
            
            # Usuario autenticado correctamente
            login(request, user)
            logger.info("Inicio de sesión exitoso para correo: %s", correo)
            return super(LoginView, self).post(request, format=None)

        except Exception as e:
            # Manejo de errores y registro
            logger.error("Error durante el inicio de sesión para correo %s: %s", correo, str(e))
            return Response({"error": "Ocurrió un error inesperado"}, status=500)
    


class RegistroView(generics.CreateAPIView):
    serializer_class = UserCreateSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        logger.info("Intentando crear un usuario.")
        serializer = self.get_serializer(data=request.data, context={'request': request})
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            logger.info("Usuario creado exitosamente: %s", serializer.data.get('email'))
            return Response({"message": "Usuario creado exitosamente"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error("Error al crear usuario: %s", str(e))
            return Response({"error": "Error al crear usuario"}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        user = self.request.user  # Usuario autenticado
        if not user.is_authenticated or user.role != 'admin':
            logger.warning("Usuario no autenticado o no administrador. Asignando rol 'usuario'.")
            serializer.save(role='usuario')
        else:
            logger.info("Usuario administrador creando un nuevo usuario.")
            serializer.save()


class UsuarioListAPIView(generics.ListAPIView):
    User = get_user_model()
    queryset = User.objects.all()
    serializer_class = UsuarioSerializer
    #permission_classes = (permissions.IsAuthenticated)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

@api_view(['GET'])
def obtener_usuario(request, id):
    try:
        usuario = Usuario.objects.get(pk=id)
        tickets_creados = Ticket.objects.filter(user=usuario).count()
        data = {
            'nom_usuario': usuario.nom_usuario,
            'correo': usuario.correo,
            'telefono': usuario.telefono,
            'cargo': {
                'nom_cargo': usuario.cargo.nom_cargo if usuario.cargo else None,
                'departamento': usuario.cargo.departamento.nom_departamento if usuario.cargo and usuario.cargo.departamento else None
            } if usuario.cargo else None,
            'tickets_creados': tickets_creados,
        }
        return Response(data)
    except Usuario.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=404)