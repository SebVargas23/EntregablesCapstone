from rest_framework import serializers
from .models import *
from apps.autenticacion.models import Cargo, Departamento

class DepartamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model= Departamento
        fields = ['id','nom_departamento']
class CargoSerializer(serializers.ModelSerializer):
    class Meta:
        model=Cargo
        fields=['id','nom_cargo','departamento']
    
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model= Categoria
        fields = ['id','nom_categoria']

class EstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estado
        fields = ['id','nom_estado']

class PrioridadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prioridad
        fields = ['id','num_prioridad']

class ServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicio
        fields = ['id','titulo_servicio','costo']

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = [
            'titulo',
            'comentario_resolucion',
            'categoria',
            'prioridad',
            'servicio',
            'estado'
        ]

class DetalleUsuarioTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleUsuarioTicket
        fields = ['ticket','usuario','relacion_ticket']

'''class DetalleServicioSerializer(serializers.ModelSerializer):
    model = DetalleServicio
    fields = ['id','ticket','servicio']''' 

class FechaTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = FechaTicket
        fields = ['id','fecha','tipo_fecha']