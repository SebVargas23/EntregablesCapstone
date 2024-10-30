from rest_framework import permissions
from knox.views import LoginView as KnoxLoginView
from django.contrib.auth import authenticate, login
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserCreateSerializer
from rest_framework import generics
from .models import Cargo
from .serializers import CargoSerializer

class LoginView(KnoxLoginView):
    permission_classes = (permissions.AllowAny,)
    def post(self, request, format=None):
        # Autenticación del usuario con correo y contraseña
        print("1- inicio request")
        correo = request.data.get('correo')
        password = request.data.get('password')

        # Debug: Imprimir los datos de inicio de sesión
        print(f"Correo: {correo}, Contraseña: {'*' * len(password) if password else 'No proporcionada'}")  # No imprimir contraseña
        
        print("2- Inicio de autenticación")
        # Autenticación
        user = authenticate(request, correo=correo, password=password)
        

        if user is None:
            print("err: credenciales no válidas")
            return Response({"error": "Credenciales no válidas"}, status=400)

        print(f"Usuario autenticado: {user.correo}")  # Debug: Imprimir el correo del usuario autenticado

        # Iniciar sesión
        login(request, user)
        print("Usuario ha iniciado sesión correctamente.")

        # Llama al método superior para crear el token
        response = super(LoginView, self).post(request, format=None)
        print("Token generado con éxito.")
        return response
    


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