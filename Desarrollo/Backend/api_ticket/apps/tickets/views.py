from datetime import datetime
from rest_framework import generics,status
from .models import Categoria, Estado, Prioridad, Servicio, Ticket, DetalleUsuarioTicket, FechaTicket,Usuario, Costo, PresupuestoTI, EvaluacionTicket
from apps.autenticacion.models import Departamento, Cargo
from apps.autenticacion.serializers import UsuarioSerializer
from .serializers import (
    DepartamentoSerializer, CargoSerializer, CategoriaSerializer, 
    EstadoSerializer, PresupuestoTISerializer, PrioridadSerializer, ServicioSerializer, 
    TicketSerializer, DetalleUsuarioTicketSerializer, FechaTicketSerializer, EvaluacionTicketSerializer
)
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.utils.timezone import now, localdate, localtime
import math
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from .models import Usuario, Ticket
from django.db.models import Count, F, Avg
from apps.tickets.tasks import calcular_presupuesto_gastado, update_sla_status, definir_costo
from api.logger import logger


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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        logger.info(f"on:get_queryset. Authenticated user: {user}, role: {user.role}")
        definir_costo()
        update_sla_status()
        # Return all tickets for admin, else only tickets created by the user
        if user.role == 'admin':
            logger.info("on:get_queryset. User is admin, returning all tickets.")
            return Ticket.objects.all()
        
        logger.info("on:get_queryset. User is not admin, returning tickets created by this user.")
        return Ticket.objects.filter(user=user)

    def perform_create(self, serializer):
        # Retrieve authenticated user
        usuario_autenticado = self.request.user
        logger.info(f"on: perform_create. Authenticated user for ticket creation: {usuario_autenticado}")

        # Ensure user is instance of custom Usuario model
        if isinstance(usuario_autenticado, Usuario):
            serializer.save(user=usuario_autenticado)
            logger.info(f"on: perform_create.isinstance. Ticket created successfully for user: {usuario_autenticado.nom_usuario}")
        else:
            logger.error("on: perform_create.isinstance. Authenticated user is not an instance of Usuario.")
            raise ValueError("on: perform_create.isinstance. El usuario autenticado no es una instancia de Usuario.")
        ticket = serializer.instance
        # Create 'Creacion' date in FechaTicket
        FechaTicket.objects.create(
            ticket=ticket,
            tipo_fecha='Creacion',
            fecha= localtime()
            )
        logger.info("on: perform_create. FechaTicket entry created for ticket creation date.")
        # Access the 'servicio' related field from the ticket
        definir_costo(ticket_id=ticket.id)
        update_sla_status(ticket_id=ticket.id)
        return Response(serializer.data, status=status.HTTP_200_OK)

        
        

class TicketDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer

    def retrieve(self, request, *args, **kwargs):
        ticket = self.get_object()
        logger.info(f"Retrieving ticket: {ticket.id}")


        # Serialize ticket data
        ticket_data = self.get_serializer(ticket).data

        # Retrieve the most recent 'Creacion' date for the ticket
        fecha_creacion = FechaTicket.objects.filter(ticket=ticket, tipo_fecha='Creacion').order_by('-fecha').first()
        if fecha_creacion:
            ticket_data['fecha_creacion'] = fecha_creacion.fecha
            logger.info(f"Fecha de creación found: {fecha_creacion.fecha}")
        else:
            logger.warning("No creation date found for the ticket.")

        return Response(ticket_data, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        logger.info(f"Updating ticket ID: {instance.id}")

        # Handle state update
        estado_id = request.data.get('estado')
        if estado_id:
            estado_obj = get_object_or_404(Estado, id=estado_id)
            request.data['estado'] = estado_obj.id
            logger.info(f"Estado updated to: {estado_obj.nom_estado}")

        # Handle user update
        user_id = request.data.get('user')
        if user_id:
            try:
                user = Usuario.objects.get(nom_usuario=user_id)
                request.data['user'] = user
                logger.info(f"Usuario updated to: {user.nom_usuario}")
            except Usuario.DoesNotExist:
                logger.error(f"User with ID {user_id} not found.")
                raise ValidationError({"user": "Usuario no encontrado"})
        
        # Remove empty dates if present
        if request.data.get('fecha_creacion') == '':
            logger.info("Removing empty 'fecha_creacion' from request data.")
            del request.data['fecha_creacion']
        if request.data.get('fecha_cierre_esperado') == '':
            logger.info("Removing empty 'fecha_cierre_esperado' from request data.")
            del request.data['fecha_cierre_esperado']
        if request.data.get('fecha_cierre') == '':
            logger.info("Removing empty 'fecha_cierre' from request data.")
            del request.data['fecha_cierre']

        # Serializar y actualizar el ticket
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if not serializer.is_valid():
            logger.error(f"Serializer validation errors: {serializer.errors}")
        else:
            logger.info(f"Validated data: {serializer.validated_data}")
        self.perform_update(serializer)
        logger.info(f"Ticket ID {instance.id} updated successfully.")
        definir_costo(ticket_id=instance.id)
        # Si el estado cambia a "Cerrado", crea o actualiza la fecha de cierre
        if estado_obj.nom_estado == "Cerrado":
            fecha_cierre, created = FechaTicket.objects.get_or_create(
                ticket=instance, tipo_fecha='Cierre',
                defaults={'fecha': localtime()}
            )
            if created:
                logger.info(f"FechaTicket entry for cierre created: {fecha_cierre.fecha}")
            else:
                fecha_cierre.fecha = localtime()
                fecha_cierre.save()
                logger.info(f"FechaTicket entry for cierre updated to: {fecha_cierre.fecha}")

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

class ClosedTicketListView(generics.ListAPIView):
    queryset = Ticket.objects.filter(estado__nom_estado='Cerrado')
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

class sla_presupuestoView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request=None):
        # Get the month and year from query parameters or default to the current month and year
        update_sla_status()
        fecha_request_str = request.data.get("fecha", None) # Expecting a date in "YYYY-MM-DD" format
        if fecha_request_str:
            # Step 2: Try to parse the provided date if it exists
            try:
                # Convert the date string to a date object
                fecha_request = datetime.strptime(fecha_request_str, "%Y-%m-%d").date()
            except ValueError:
                return Response({"error": "formato invalido de fecha, porfavor introducir fecha en el formato : 'YYYY-MM-DD'."}, status=400)
        else:
            # Default to the current date if 'date' is not provided
            fecha_request = localdate()
        
        # Step 3: Extract month and year from the date
        month = fecha_request.month
        year = fecha_request.year
        calcular_presupuesto_gastado(fecha_request)
        # Step 1: Retrieve `PresupuestoTI` for the specified month and year
        try:
            presupuesto_ti = PresupuestoTI.objects.get(
                fecha_presupuesto__year=year,
                fecha_presupuesto__month=month
            )
            presupuesto_data = PresupuestoTISerializer(presupuesto_ti).data
        except PresupuestoTI.DoesNotExist:
            return Response({"error": f"No budget information found for {month}/{year}."}, status=404)
        
        
        costos_filtered = Costo.objects.filter(
            fecha__year=year,
            fecha__month=month,
            cierre = False,  # Only open tickets
        ).select_related('ticket').order_by('-horas_atraso')[:10]
        worst_tickets_data = []
        if not costos_filtered:
            worst_tickets_data = []
        else:
            for costo in costos_filtered:
                ticket = costo.ticket
                creation_date = ticket.fechaticket_set.filter(tipo_fecha="Creacion").first()  # Adjust the filter logic
                if creation_date:
                    horas_abierto = (localtime() - creation_date.fecha).total_seconds() / 3600
                else:
                    horas_abierto = None
                # Collecting ticket data including title, sla_status, and cost
                ticket_data = {
                    "id": ticket.id,
                    "title": ticket.titulo,
                    "categoria": ticket.categoria.nom_categoria,
                    "sla_duracion": ticket.categoria.sla_horas,
                    "horas_atraso": costo.horas_atraso,
                    "horas_abierto": math.ceil(horas_abierto) if horas_abierto else "error",
                    "monto":costo.monto,
                    "monto_final": costo.monto_final,
                    "dates": [
                        {
                            "date": fecha.fecha.strftime("%Y-%m-%d"),
                            "type": fecha.tipo_fecha
                        } for fecha in ticket.fechaticket_set.all()
                    ]
                }
                worst_tickets_data.append(ticket_data)

        response_data = {
            "presupuesto": presupuesto_data,
            "worst_tickets": worst_tickets_data
        }

        return Response(response_data, status=status.HTTP_200_OK)


    

@api_view(['GET'])
def dashboard_stats(request):
    # Estadísticas generales
    usuarios_totales = Usuario.objects.count()
    tickets_totales = Ticket.objects.count()
    tickets_abiertos = Ticket.objects.filter(estado__nom_estado="Abierto").count()
    tickets_cerrados = Ticket.objects.filter(estado__nom_estado="Cerrado").count()
    tickets_asignados = Ticket.objects.filter(estado__nom_estado="Asignado").count()
    tickets_reabiertos = Ticket.objects.filter(estado__nom_estado="Reabierto").count()

    # Tickets por Departamento
    tickets_por_departamento = Ticket.objects.values('user__cargo__departamento__nom_departamento').annotate(
        total=Count('id')
    ).order_by('-total')


    # Tickets por Categoría
    tickets_por_categoria = Ticket.objects.values('categoria__nom_categoria').annotate(
        total=Count('id')
    ).order_by('-total')

    # Calcular el tiempo de cierre
    tiempos_cierre = []
    tickets_cerrados_qs = Ticket.objects.filter(estado__nom_estado="Cerrado")

    for ticket in tickets_cerrados_qs:
        fecha_creacion = FechaTicket.objects.filter(ticket=ticket, tipo_fecha="Creacion").first()
        fecha_cierre = FechaTicket.objects.filter(ticket=ticket, tipo_fecha="Cierre").first()
        
        if fecha_creacion and fecha_cierre:
            tiempo_cierre = (fecha_cierre.fecha - fecha_creacion.fecha).days
            tiempos_cierre.append({
                "ticket_id": ticket.id,
                "dias_cierre": tiempo_cierre
            })
        
        # Tiempo promedio en cada estado
    tiempos_promedio_por_estado = (
        FechaTicket.objects.filter(tipo_fecha="Cierre")  # Filtro para tickets con fecha de cierre
        .values('ticket__estado__nom_estado')           # Agrupar por estado
        .annotate(promedio_dias=Avg(F('fecha') - F('ticket__fechaticket_set__fecha')))  # Promedio de días
    )

    # Convertir timedelta en días (para que sea más legible en el frontend)
    tiempos_promedio_por_estado = [
        {
            'estado': entry['ticket__estado__nom_estado'],
            'promedio_dias': entry['promedio_dias'].days if entry['promedio_dias'] else 0
        }
        for entry in tiempos_promedio_por_estado
    ]
    # Construir la respuesta
    data = {
        "usuarios_totales": usuarios_totales,
        "tickets_totales": tickets_totales,
        "tickets_abiertos": tickets_abiertos,
        "tickets_cerrados": tickets_cerrados,
        "tickets_asignados": tickets_asignados,
        "tickets_reabiertos": tickets_reabiertos,
        "tiempos_cierre": tiempos_cierre,
        "tickets_por_departamento": list(tickets_por_departamento),  # Convertir a lista
        "tickets_por_categoria": list(tickets_por_categoria),  # Convertir a lista
        "tiempos_promedio_por_estado": tiempos_promedio_por_estado,
    }

    return Response(data)


@api_view(['GET'])
def list_usuarios(request):
    usuarios = Usuario.objects.all()
    serializer = UsuarioSerializer(usuarios, many=True)
    return Response(serializer.data)


class retrieve_feedback(generics.RetrieveUpdateAPIView):
    queryset = EvaluacionTicket.objects.all()
    serializer_class = EvaluacionTicketSerializer
    lookup_field = "ticket_id"
 