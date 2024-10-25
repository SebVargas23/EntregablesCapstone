from django.db import models


class Categoria(models.Model):
    nom_categoria = models.CharField(max_length=255)

    def __str__(self):
        return self.nom_categoria

class Prioridad(models.Model):
    num_prioridad = models.CharField(max_length=10)

    def __str__(self):
        return self.num_prioridad

class Estado(models.Model):
    nom_estado = models.CharField(max_length=255)

    def __str__(self):
        return self.nom_estado

'''class Equipo(models.Model):
    nom_equipo = models.CharField(max_length=255)
    tipo_equipo = models.CharField(max_length=20)

    def __str__(self):
        return self.nom_equipo'''


class Servicio(models.Model):
    titulo_servicio = models.CharField(max_length=20)
    costo = models.DecimalField(max_digits=12, decimal_places=2)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, null=True, blank=True)# Relación con Categoria

    def __str__(self):
        return self.titulo_servicio
    
class Ticket(models.Model):
    titulo = models.CharField(max_length=255)
    comentario = models.TextField(null=True, blank=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    prioridad = models.ForeignKey(Prioridad, on_delete=models.CASCADE)
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE)
    estado = models.ForeignKey(Estado, on_delete=models.CASCADE)

    def __str__(self):
        return self.titulo
    

'''class DetalleServicio(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE)
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE)

    def __str__(self):
        return f"Servicio {self.servicio} en Ticket {self.ticket}"'''
    
class FechaTicket(models.Model):
    fecha = models.DateTimeField(auto_now_add=True)
    tipo_fecha = models.CharField(max_length=20, choices=[
        ('Creacion', 'Creación'), 
        ('Cierre', 'Cierre'),
    ])
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE)

    def __str__(self):
        return f"Fecha {self.fecha} ({self.tipo_fecha}) para Ticket {self.ticket}"
    class Meta:
        unique_together = ('fecha', 'ticket')

class DetalleUsuarioTicket(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE)
    usuario = models.ForeignKey('autenticacion.Usuario', on_delete=models.CASCADE)
    relacion_ticket = models.CharField(max_length=20, choices=[
        ('creador', 'Creador'),
        ('asignado', 'Asignado'),
        ('resuelto', 'Resuelto')
    ])

    def __str__(self):
        return f"Usuario {self.usuario.nom_usuario} - {self.relacion_ticket} en Ticket {self.ticket}"

    class Meta:
        unique_together = ('ticket', 'usuario', 'relacion_ticket')
