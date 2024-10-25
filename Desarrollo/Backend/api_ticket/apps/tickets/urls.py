from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DepartamentoListCreateView, DepartamentoDetailView,
    CargoListCreateView, CargoDetailView,
    CategoriaListCreateView, CategoriaDetailView,
    EstadoListCreateView, EstadoDetailView,
    PrioridadListCreateView, PrioridadDetailView,
    ServicioListCreateView, ServicioDetailView,
    TicketListCreateView, TicketDetailView,
    DetalleUsuarioTicketListCreateView, DetalleUsuarioTicketDetailView,
    FechaTicketListCreateView, FechaTicketDetailView
)

# Creamos un router

router = DefaultRouter()
router.register(r'usuarios', DetalleUsuarioTicketDetailView)

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
]
