from rest_framework import generics,status
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from .models import Categoria, Estado, Prioridad, Servicio, Ticket, DetalleUsuarioTicket, FechaTicket
from apps.autenticacion.models import Departamento, Cargo
from .serializers import (
    DepartamentoSerializer, CargoSerializer, CategoriaSerializer, 
    EstadoSerializer, PrioridadSerializer, ServicioSerializer, 
    TicketSerializer, DetalleUsuarioTicketSerializer, FechaTicketSerializer
)
from rest_framework.response import Response
from rest_framework import permissions

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
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Crear el ticket
        ticket = serializer.save()

        # Crear la fecha de creación en FechaTicket
        FechaTicket.objects.create(ticket=ticket, tipo_fecha='Creacion')
        DetalleUsuarioTicket.objects.create(
            ticket=ticket,
            usuario=self.request.user,  # Usuario autenticado
            relacion_ticket='Creador'   # Tipo de relación: Creador
        )

class TicketDetailView(generics.RetrieveAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def retrieve(self, request, *args, **kwargs):
        # Obtener el objeto del ticket
        ticket = self.get_object()

        # Serializar el ticket
        ticket_data = self.get_serializer(ticket).data

        # Obtener la fecha de creación del ticket desde FechaTicket
        fecha_creacion = FechaTicket.objects.filter(ticket=ticket, tipo_fecha='Creacion').first()

        # Agregar la fecha de creación a los datos serializados
        ticket_data['fecha_creacion'] = fecha_creacion.fecha if fecha_creacion else None

        return Response(ticket_data, status=status.HTTP_200_OK)
    
    def patch(self, request, *args, **kwargs):
    # Obtener el objeto del ticket y el estado anterior
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Imprimir el ticket que se va a actualizar
        print(f'Actualizando el ticket: {instance.id}, Titulo: {instance.titulo}')

        previous_estado = instance.estado.nom_estado  # Estado anterior
        print(f'Estado anterior: {previous_estado}')
        print("datos mandados", request.data)
        # Serializar y actualizar el ticket
        print("serializar datos")
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        print("actualizar el ticket")
        serializer.is_valid(raise_exception=True)
        
        # Imprimir los datos validados
        print(f'Datos validados: {serializer.validated_data}')
        
        self.perform_update(serializer)

        # Verificar si el estado cambió a "Cerrado"
        if previous_estado != 5 and instance.estado.nom_estado == 5:
            # Crear la fecha de cierre en FechaTicket
            FechaTicket.objects.create(ticket=instance, tipo_fecha='Cierre', fecha=timezone.now())
            DetalleUsuarioTicket.objects.update_or_create(
                ticket=instance,
                relacion_ticket='Cerrador',
                defaults={'usuario': request.user}  # Usuario que cierra el ticket
            )
            print(f'Ticket cerrado por: {request.user}')
            # no funciona !!!pendiente!!!
        return Response(serializer.data, status=status.HTTP_200_OK)

# DetalleUsuarioTicket Views
class DetalleUsuarioTicketListCreateView(generics.ListCreateAPIView):
    queryset = DetalleUsuarioTicket.objects.all()
    serializer_class = DetalleUsuarioTicketSerializer

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

#vistas personalizadas

class CombinedDataView(APIView):
    def get(self, request):
        # Obtiene los datos de cada modelo
        categorias = Categoria.objects.all()
        prioridades = Prioridad.objects.all()
        servicios = Servicio.objects.all()
        estados = Estado.objects.all()

        # Estructura de la respuesta
        resultado = {
            'categorias': CategoriaSerializer(categorias, many=True).data,
            'prioridades': PrioridadSerializer(prioridades, many=True).data,
            'servicios': ServicioSerializer(servicios, many=True).data,
            'estados': EstadoSerializer(estados, many=True).data,
        }

        return Response(resultado)
    
class listaUsuariosTicketsView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # Solo usuarios autenticados

    def get(self, request):
        try:
            # Obtener todos los usuarios de la base de datos 
            User = get_user_model()
            usuarios = User.objects.all()
            print(f'Número de usuarios encontrados: {usuarios.count()}')

            # Prepara la lista de resultados
            resultado = []
            
            for usuario in usuarios:
                # Obtener los tickets creados por cada usuario
                tickets_creados = DetalleUsuarioTicket.objects.filter(
                    usuario=usuario, relacion_ticket="Creador"
                ).values("ticket__id", "ticket__titulo")
                
                print(f'Usuario: {usuario.nom_usuario}, Tickets encontrados: {tickets_creados.count()}')

                # Formato para cada usuario
                tickets_limpios = [
                    {"id": ticket["ticket__id"], "titulo": ticket["ticket__titulo"]}
                    for ticket in tickets_creados
                ]

                resultado.append({
                    "id": usuario.id,
                    "nombre": usuario.nom_usuario,
                    "tickets": tickets_limpios
                })
            return Response(resultado, status=status.HTTP_200_OK)
        
        except Exception as e:
            # Manejo de errores
            print(f'Error: {str(e)}')
            return Response({"error": "Ocurrió un error al procesar la solicitud."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    