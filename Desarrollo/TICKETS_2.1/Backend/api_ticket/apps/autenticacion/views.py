from rest_framework import permissions
from knox.views import LoginView as KnoxLoginView
from django.contrib.auth import authenticate, login
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserCreateSerializer
from .serializers import UsuarioSerializer
from rest_framework import generics
from .models import Cargo
from .models import Usuario
from .serializers import CargoSerializer
from django.contrib.auth.models import User
from rest_framework.views import APIView


class LoginView(KnoxLoginView):
    permission_classes = (permissions.AllowAny,)
    def post(self, request, format=None):
        print(request.data)
        # Autenticación del usuario con correo y contraseña
        correo = request.data.get('correo')
        password = request.data.get('password')
        
        # Autenticación
        user = authenticate(request, correo=correo, password=password)
        if user is None:
            return Response({"error": "Credenciales no válidas"}, status=400)
        login(request,user)
        return super(LoginView, self).post(request, format=None)
    


class RegistroView(generics.CreateAPIView):
    serializer_class = UserCreateSerializer
    permission_classes = (permissions.AllowAny,)
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({"message": "Usuario creado exitosamente"}, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        serializer.save()

class CargoListAPIView(generics.ListAPIView):
    queryset = Cargo.objects.all()
    serializer_class = CargoSerializer
    permission_classes = (permissions.AllowAny,)

class UsuarioListView(APIView):
    """Vista para listar todos los usuarios"""
    def get(self, request):
        usuarios = Usuario.objects.all()
        serializer = UsuarioSerializer(usuarios, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
