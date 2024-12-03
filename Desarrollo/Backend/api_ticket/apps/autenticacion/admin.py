from django.contrib import admin
from .models import Usuario, Cargo, Departamento

admin.site.register(Usuario)
admin.site.register(Cargo)
admin.site.register(Departamento)

# Register your models here.
