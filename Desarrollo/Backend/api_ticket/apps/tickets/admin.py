from django.contrib import admin
from .models import Ticket, Categoria, Estado, Prioridad, Servicio, PresupuestoTI, FechaTicket, Costo, EvaluacionTicket

admin.site.register(Ticket)
admin.site.register(Categoria)
admin.site.register(Estado)
admin.site.register(Prioridad)
admin.site.register(Servicio)
admin.site.register(PresupuestoTI)
admin.site.register(Costo)
admin.site.register(FechaTicket)
admin.site.register(EvaluacionTicket)
# Register your models here.
