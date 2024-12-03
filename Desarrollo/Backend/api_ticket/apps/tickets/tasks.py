from django.utils.timezone import now, localdate, localtime
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from datetime import timedelta
from django.utils import timezone
from apps.tickets.models import Ticket
from .models import Costo, PresupuestoTI
from django.db.models import Sum
import math
from django.db import transaction
from api.logger import logger

def update_sla_status(ticket_id=None):
    """
    Updates the SLA status for a specific ticket or all tickets.
    It will call the appropriate function for open and closed tickets.
    """
    try:
        # Fetch the tickets to update (filter by ticket_id if provided)
        if ticket_id:
            tickets = Ticket.objects.filter(id=ticket_id).prefetch_related('fechaticket_set')
        else:
            tickets = Ticket.objects.all().prefetch_related('fechaticket_set')

        for ticket in tickets:
            # Check if the ticket has a cierre_real date (closed ticket)
            cierre_real = ticket.fechaticket_set.filter(tipo_fecha='Cierre').first()

            if cierre_real:
                # Closed ticket, update SLA status and cost (calculo_monto)
                update_sla_status_for_closed_ticket(ticket, cierre_real)
            else:
                # Open ticket, just update the SLA status without calculating monto
                update_sla_status_for_open_ticket(ticket)

    except Exception as e:
        logger.error(f"Error updating SLA status: {str(e)}")

def calculate_horas_atraso(date, expected_fecha):
    """
    Calculate hours of delay between two datetime objects.
    """
    if date > expected_fecha:
        return math.floor((date - expected_fecha).total_seconds() / 3600)
    return 0

def get_sla_status_and_delay(date, cierre_esperado):
    """
    Returns the SLA status and horas_atraso based on the current time and expected closure date.
    """
    if date > cierre_esperado:
        return 'Atrasado', calculate_horas_atraso(date, cierre_esperado)
    elif date + timedelta(days=1) > cierre_esperado:
        return 'En riesgo', 0
    else:
        return 'Al dia', 0

def update_costo_horas_atraso(costo, horas_atraso):
    """
    Updates the 'horas_atraso' field in the Costo model if necessary and recalculates the monto_final.
    """
    if costo.horas_atraso != horas_atraso:
        costo.horas_atraso = horas_atraso 
        costo.save()
        logger.info(f"SLA status updated: horas_atraso set to {horas_atraso} for Ticket ID {costo.ticket.id}")
    else:
        logger.info(f"No update needed for Ticket ID {costo.ticket.id}; horas_atraso remains {costo.horas_atraso}.")

def update_sla_ticket(ticket, new_sla_status):
    # Update SLA status if it has changed
    if ticket.sla_status != new_sla_status:
        ticket.sla_status = new_sla_status
        ticket.save()
        logger.info(f"SLA status updated for open Ticket ID {ticket.id} to {new_sla_status}")
    else: 
        logger.info(f"no update needed for sla status in ticket {ticket.id}")

def update_sla_status_for_open_ticket(ticket):
    """
    Updates SLA status for open tickets only (no cost calculations).
    """
    now = localtime()
    fecha_esperada = ticket.fechaticket_set.filter(tipo_fecha='cierre_esperado').first()
    
    if not fecha_esperada:
        logger.warning(f"Expected closure date not found for open Ticket ID {ticket.id}. Skipping update.")
        return

    cierre_esperado = fecha_esperada.fecha
    new_sla_status, horas_atraso = get_sla_status_and_delay(now, cierre_esperado)

    # Update Costo model with new horas_atraso if needed
    costo = Costo.objects.filter(ticket_id=ticket.id).first()
    if costo:
        update_costo_horas_atraso(costo, horas_atraso)
    else:
        logger.warning(f"Costo record not found for open Ticket ID {ticket.id}. Cannot update horas_atraso.")

    # Update SLA status if it has changed
    update_sla_ticket(ticket, new_sla_status)

def update_sla_status_for_closed_ticket(ticket, cierre_real):
    """
    Updates SLA status and recalculates horas_atraso for closed tickets.
    """
    if not cierre_real:
        logger.warning(f"No cierre_real provided for Ticket ID {ticket.id}. Skipping update.")
        return

    # Fetch expected closure date
    fecha_esperada = ticket.fechaticket_set.filter(tipo_fecha='cierre_esperado').first()
    if not fecha_esperada:
        logger.warning(f"Expected closure date not found for Ticket ID {ticket.id}. Skipping update.")
        return

    horas_atraso = calculate_horas_atraso(cierre_real.fecha, fecha_esperada.fecha)

    # Determine new SLA status
    new_sla_status = 'Al dia' if horas_atraso == 0 else 'Atrasado'
    
    # Update Costo model with new horas_atraso if needed
    costo = Costo.objects.filter(ticket_id=ticket.id).first()
    if costo:
        update_costo_horas_atraso(costo, horas_atraso)
    else:
        logger.warning(f"Costo record not found for Ticket ID {ticket.id}. Cannot update horas_atraso.")
    
    # Update SLA status if it has changed
    update_sla_ticket(ticket, new_sla_status)
    
@transaction.atomic
def definir_costo(ticket_id=None):
    try:
        logger.info(f"on: definir_costo. Starting cost definition process.")
        tickets = (
            Ticket.objects.filter(id=ticket_id) if ticket_id else Ticket.objects.all()
        )

        for ticket in tickets:
            try:
                fecha_costo = localtime()
                print("fecha del costo", fecha_costo)
                costo_instance = getattr(ticket, 'costos', None)
                print("revisando instancia de costo para ticket :",ticket.id )
                if costo_instance:
                    logger.info(f"Updating existing Costo instance: {costo_instance}")
                    costo_instance.save()
                else:
                    #if there is no costo instance then set lookup date as timezone.now()
                    
                    logger.info(f"on: definir_costo. Current year and month: {localtime().strftime('%Y/%m')}")
                   
                    #after getting the look up date get or create a presupuesto ti object
                    print("definiendo presupuesto como ",fecha_costo)
                    presupuesto_ti, created = PresupuestoTI.objects.get_or_create(
                        fecha_presupuesto__month=fecha_costo.month,
                        fecha_presupuesto__year=fecha_costo.year,
                        defaults={'fecha_presupuesto': fecha_costo}
                    )
                    print("! punto de control post presupuesto_ti")
                    if created:
                        # If the object was created, log that the record was created
                        presupuesto_ti.save()
                        logger.info(f"on: definir_costo. Created new presupuesto record for {fecha_costo.strftime('%Y/%m')}")
                    else:
                        # If the object already exists, log that the record was found
                        logger.info(f"on: definir_costo. Presupuesto record already exists for {fecha_costo.strftime('%Y/%m')}")
                        # if there is no difference between montos then skip
                    costo_instance = Costo.objects.create(
                        ticket=ticket,
                        presupuesto_ti=presupuesto_ti,
                        fecha=fecha_costo
                    )
                    logger.info(f"on: definir_costo. New Costo instance created: {costo_instance}")
            except ObjectDoesNotExist as e:
                logger.error(f"on: definir_costo. Error: {str(e)}. Ticket ID: {ticket.id} or related service not found.")
            except ValueError as e:
                logger.error(f"on: definir_costo. Error: {str(e)}. Ticket ID: {ticket.id}.")
            except IntegrityError as e:
                logger.error(f"on: definir_costo. Database IntegrityError: {str(e)}. Ticket ID: {ticket.id}.")
            except Exception as e:
                logger.error(f"on: definir_costo. Unexpected error for Ticket ID {ticket.id}: {str(e)}")
    except Exception as e:
        logger.error(f"on: definir_costo. Error processing tickets: {str(e)}")
        
def calcular_presupuesto_gastado(date):
    """
    Calculates and updates the 'presupuesto_gastado' field for a given month and year.
    This function can be called from anywhere without requiring an instance.
    """
    try:
        logger.info(f"on: calcular_presupuesto_gastado. Starting presupuesto_gastado calculation for {date.strftime('%Y-%m-%d')}.")
        
        # Standardize date to the first day of the month
        fecha_update = date.replace(day=1)
        logger.info(f"on: calcular_presupuesto_gastado. Month standardized to {fecha_update.strftime('%Y-%m')}.")

        # Get or create the corresponding 'PresupuestoTI' for the given month
        print("buscando presupuesto o creando uno nuevo")
        presupuesto_ti, created = PresupuestoTI.objects.get_or_create(
            fecha_presupuesto__year=fecha_update.year,
            fecha_presupuesto__month=fecha_update.month,
            defaults={'fecha_presupuesto': fecha_update}
        )

        if created:
            logger.info(f"on: calcular_presupuesto_gastado. Created new presupuesto record for {fecha_update.strftime('%Y/%m')}")
        else:
            logger.info(f"on: calcular_presupuesto_gastado. Presupuesto record already exists for {fecha_update.strftime('%Y/%m')}")

        # Call the save method to trigger calculations and updates
        presupuesto_ti.save()

        logger.info(f"on: calcular_presupuesto_gastado. Successfully updated 'presupuesto_gastado' for {fecha_update.strftime('%Y-%m')}.")
    except ObjectDoesNotExist as e:
        logger.error(f"on: calcular_presupuesto_gastado. PresupuestoTI object not found for the date {date.strftime('%Y-%m')}: {str(e)}")
    except IntegrityError as e:
        logger.error(f"on: calcular_presupuesto_gastado. Database IntegrityError while updating 'presupuesto_gastado' for {date.strftime('%Y-%m')}: {str(e)}")
    except Exception as e:
        logger.error(f"on: calcular_presupuesto_gastado. Unexpected error while calculating 'presupuesto_gastado' for {date.strftime('%Y-%m')}: {str(e)}")
