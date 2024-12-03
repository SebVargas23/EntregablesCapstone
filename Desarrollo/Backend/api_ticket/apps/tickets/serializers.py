from rest_framework import serializers
from .models import *
from apps.autenticacion.models import Cargo, Departamento
from django.utils.timezone import localtime
from .tasks import update_sla_status
from api.logger import logger

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
        fields = ['id','nom_categoria','sla_horas']
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
        fields = ['id','titulo_servicio','costo', 'categoria_id']

class TicketSerializer(serializers.ModelSerializer):
    fecha_creacion = serializers.SerializerMethodField()
    fecha_cierre_esperado = serializers.SerializerMethodField()
    fecha_cierre = serializers.SerializerMethodField()
    user = serializers.SlugRelatedField(
        slug_field='nom_usuario',
        queryset=Usuario.objects.all(),
        required=False
    )
    estado = serializers.PrimaryKeyRelatedField(queryset=Estado.objects.all())  # Ajuste aquí
    class Meta:
        model = Ticket
        fields = [
            'id', 'titulo', 'comentario', 'categoria',
            'prioridad', 'servicio', 'estado', 'user',
            'fecha_creacion','fecha_cierre_esperado', 'fecha_cierre','sla_status', 'resolucion'
        ]

    def get_fecha_creacion(self, obj):
        fecha_creacion = FechaTicket.objects.filter(ticket=obj, tipo_fecha='Creacion').first()
        if fecha_creacion:
            logger.debug(f"on: get_fecha_creacion. Fetching fecha_creacion for ticket {obj.id}: {fecha_creacion.fecha}")
            return localtime(fecha_creacion.fecha).strftime('%Y-%m-%d %H:%M:%S')  # Formato ajustado
        logger.warning(f"on: get_fecha_creacion. Fecha de creación not found for ticket {obj.id}")
        return None
    def get_fecha_cierre_esperado(self, obj):
        fecha_creacion = FechaTicket.objects.filter(ticket=obj, tipo_fecha='cierre_esperado').first()
        if fecha_creacion:
            logger.debug(f"on: get_fecha_cierre_esperado. Fetching fecha_cierre_esperado for ticket {obj.id}: {fecha_creacion.fecha}")
            return localtime(fecha_creacion.fecha).strftime('%Y-%m-%d %H:%M:%S')  # Formato ajustado
        logger.warning(f"on: get_fecha_cierre_esperado. Fecha de cierre esperado not found for ticket {obj.id}")
        return None
    def get_fecha_cierre(self, obj):
        # Obtener la fecha de cierre del modelo FechaTicket
        fecha_cierre = FechaTicket.objects.filter(ticket=obj, tipo_fecha='Cierre').first()
        if fecha_cierre:
            logger.debug(f"on: get_fecha_cierre. Fetching fecha_cierre for ticket {obj.id}: {fecha_cierre.fecha}")
            return localtime(fecha_cierre.fecha).strftime('%Y-%m-%d %H:%M:%S')
        logger.warning(f"on: get_fecha_cierre. Fecha de cierre not found for ticket {obj.id}")
        return None

    def get_user(self, obj):
        nom_user= obj.user.nom_usuario if obj.user else None
        if nom_user:
            logger.debug(f"on: get_userUser.  for ticket {obj.id}: {nom_user}")
        else:
            logger.warning(f"on: get_userUser. User not assigned for ticket {obj.id}")
        return nom_user # Ajusta 'nom_usuario' al campo correcto en tu modelo de usuario
        

    def update(self, instance, validated_data):
        # Actualizar el ticket con datos validados
        logger.debug(f"on:Ticket update. Updating ticket {instance.id}: {validated_data}")
        instance.titulo = validated_data.get('titulo', instance.titulo)
        instance.comentario = validated_data.get('comentario', instance.comentario)
        instance.categoria = validated_data.get('categoria', instance.categoria)
        instance.prioridad = validated_data.get('prioridad', instance.prioridad)
        instance.servicio = validated_data.get('servicio', instance.servicio)
        instance.estado = validated_data.get('estado', instance.estado)
        instance.save()
        logger.info(f"on:Ticket update. Ticket {instance.id} updated successfully.")
        # Manejar la fecha de cierre
        fecha_cierre = validated_data.get('fecha_cierre', None)
        if fecha_cierre:
            logger.debug(f"on:Ticket update. Setting cierre fecha for ticket {instance.id}: {fecha_cierre}")
            FechaTicket.objects.update_or_create(
                ticket=instance,
                tipo_fecha='Cierre',
                defaults={'fecha': fecha_cierre}
            )
        else:
            logger.info(f"on:Ticket update. No fecha_cierre provided for ticket {instance.id}.")
        update_sla_status(ticket_id=instance.id)
        logger.info(f"on:Ticket update. SLA status for ticket {instance.id} updated.")
        return instance
    
class DetalleUsuarioTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleUsuarioTicket
        fields = ['ticket','usuario','relacion_ticket']
class FechaTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = FechaTicket
        fields = ['id','fecha','tipo_fecha']
class PresupuestoTISerializer(serializers.ModelSerializer):
    class Meta:
        model = PresupuestoTI
        fields = ['id', 'presupuesto_mensual', 'presupuesto_gastado', 'fecha_presupuesto','over_budget','presupuesto_restante']
class CostoSerializer(serializers.ModelSerializer):    
    class Meta:
        model = Costo
        fields = ['id', 'ticket', 'presupuesto_ti', 'monto', 'horas_atraso','cierre' , 'monto_final', 'fecha']

class EvaluacionTicketSerializer(serializers.ModelSerializer):
    ticket = serializers.PrimaryKeyRelatedField(read_only=True)  # Solo lectura

    class Meta:
        model = EvaluacionTicket
        fields = ['ticket', 'nota', 'feedback']
