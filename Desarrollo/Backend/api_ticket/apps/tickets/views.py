from rest_framework import generics
from .models import Categoria, Estado, Prioridad, Servicio, Ticket, DetalleUsuarioTicket, FechaTicket
from apps.autenticacion.models import Departamento, Cargo
from .serializers import (
    DepartamentoSerializer, CargoSerializer, CategoriaSerializer, 
    EstadoSerializer, PrioridadSerializer, ServicioSerializer, 
    TicketSerializer, DetalleUsuarioTicketSerializer, FechaTicketSerializer,CategoriaSerializer, 
    PrioridadSerializer, EstadoSerializer,TicketSerializer
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.generics import RetrieveAPIView
# Departamento Views
class DepartamentoListCreateView(generics.ListCreateAPIView):
    queryset = Departamento.objects.all()
    serializer_class = DepartamentoSerializer

class DepartamentoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Departamento.objects.all()
    serializer_class = DepartamentoSerializer

# Cargo Views
class CargoListCreateView(generics.ListCreateAPIView):
    queryset = Cargo.objects.all()
    serializer_class = CargoSerializer

class CargoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cargo.objects.all()
    serializer_class = CargoSerializer

# Categoria Views
class CategoriaListCreateView(generics.ListCreateAPIView):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class CategoriaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

# Estado Views
class EstadoListCreateView(generics.ListCreateAPIView):
    queryset = Estado.objects.all()
    serializer_class = EstadoSerializer

class EstadoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Estado.objects.all()
    serializer_class = EstadoSerializer

# Prioridad Views
class PrioridadListCreateView(generics.ListCreateAPIView):
    queryset = Prioridad.objects.all()
    serializer_class = PrioridadSerializer

class PrioridadDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Prioridad.objects.all()
    serializer_class = PrioridadSerializer

# Servicio Views
class ServicioListCreateView(generics.ListCreateAPIView):
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer

class ServicioDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer

# Ticket Views
class TicketListCreateView(generics.ListCreateAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer

class TicketDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer

# DetalleUsuarioTicket Views
class DetalleUsuarioTicketListCreateView(generics.ListCreateAPIView):
    queryset = DetalleUsuarioTicket.objects.all()
    serializer_class = DetalleUsuarioTicketSerializer

    def get(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error al obtener tickets: {e}")  # Verifica la traza del error
            return Response(
                {"error": "Error al obtener los tickets"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class DetalleUsuarioTicketDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DetalleUsuarioTicket.objects.all()
    serializer_class = DetalleUsuarioTicketSerializer

# FechaTicket Views
class FechaTicketListCreateView(generics.ListCreateAPIView):
    queryset = FechaTicket.objects.all()
    serializer_class = FechaTicketSerializer

class FechaTicketDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FechaTicket.objects.all()
    serializer_class = FechaTicketSerializer

# OpcionesTicket Views
class CategoriaList(generics.ListAPIView):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class PrioridadList(generics.ListAPIView):
    queryset = Prioridad.objects.all()
    serializer_class = PrioridadSerializer

class EstadoList(generics.ListAPIView):
    queryset = Estado.objects.all()
    serializer_class = EstadoSerializer

class ServicioListView(generics.ListAPIView):
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer

class TicketCreateView(generics.CreateAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    
    def create(self, request, *args, **kwargs):
        print("Datos recibidos:", request.data)  # Para verificar los datos que llegan
        return super().create(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        # Crear el ticket
        ticket = serializer.save()
        # Crear la fecha de creación asociada al ticket
        FechaTicket.objects.create(
            ticket=ticket,
            tipo_fecha='Creacion'
        )
class TicketListView(APIView):
    permission_classes = [IsAuthenticated]  # Opcional

    def get(self, request):
        tickets = Ticket.objects.all()
        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data)
    
class TicketDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer

class CategoriaListView(generics.ListAPIView):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class PrioridadListView(generics.ListAPIView):
    queryset = Prioridad.objects.all()
    serializer_class = PrioridadSerializer

class ServicioListView(generics.ListAPIView):
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer