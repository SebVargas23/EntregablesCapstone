from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    DepartamentoListCreateView, DepartamentoDetailView,
    CargoListCreateView, CargoDetailView,
    CategoriaListCreateView, CategoriaDetailView,
    EstadoListCreateView, EstadoDetailView,
    PrioridadListCreateView, PrioridadDetailView,
    ServicioListCreateView, ServicioDetailView,
    TicketListCreateView, TicketDetailView,
    DetalleUsuarioTicketListCreateView, DetalleUsuarioTicketDetailView,
    FechaTicketListCreateView, FechaTicketDetailView,ClosedTicketListView,
    sla_presupuestoView,
    dashboard_stats,list_usuarios, create_or_update_evaluacion
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="API",
        default_version='v1',
        description="Documentación de la API",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@api.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)
# Creamos un router


# Definimos rutas con path
urlpatterns = [
    path('departamentos/', DepartamentoListCreateView.as_view(), name='departamento-list-create'),
    path('departamentos/<int:pk>/', DepartamentoDetailView.as_view(), name='departamento-detail'),

    path('cargos/', CargoListCreateView.as_view(), name='cargo-list-create'),
    path('cargos/<int:pk>/', CargoDetailView.as_view(), name='cargo-detail'),

    path('categorias/', CategoriaListCreateView.as_view(), name='categoria-list-create'),
    path('categorias/<int:pk>/', CategoriaDetailView.as_view(), name='categoria-detail'),

    path('estados/', EstadoListCreateView.as_view(), name='estado-list-create'),
    path('estados/<int:pk>/', EstadoDetailView.as_view(), name='estado-detail'),

    path('prioridades/', PrioridadListCreateView.as_view(), name='prioridad-list-create'),
    path('prioridades/<int:pk>/', PrioridadDetailView.as_view(), name='prioridad-detail'),

    path('servicios/', ServicioListCreateView.as_view(), name='servicio-list-create'),
    path('servicios/<int:pk>/', ServicioDetailView.as_view(), name='servicio-detail'),

    path('tickets/', TicketListCreateView.as_view(), name='ticket-list-create'),
    path('tickets/<int:pk>/', TicketDetailView.as_view(), name='ticket-detail'),

    path('detalle-usuarios-tickets/', DetalleUsuarioTicketListCreateView.as_view(), name='detalle-usuario-ticket-list-create'),
    path('detalle-usuarios-tickets/<int:pk>/', DetalleUsuarioTicketDetailView.as_view(), name='detalle-usuario-ticket-detail'),

    path('fechas-tickets/', FechaTicketListCreateView.as_view(), name='fecha-ticket-list-create'),
    path('fechas-tickets/<int:pk>/', FechaTicketDetailView.as_view(), name='fecha-ticket-detail'),

    # Otras rutas de tu API

    path('tickets-cerrados/', ClosedTicketListView.as_view(), name='tickets-cerrados'),

    path('api/dashboard/stats/', dashboard_stats, name='dashboard-stats'),

    path('sla-presupuestos/',sla_presupuestoView.as_view(), name='sla-presupuesto'),

    path('usuarios/', list_usuarios, name='list_usuarios'),

    path('tickets/<int:ticket_id>/feedback/', create_or_update_evaluacion, name='create_or_update_evaluacion'),
]

DEBUG = True