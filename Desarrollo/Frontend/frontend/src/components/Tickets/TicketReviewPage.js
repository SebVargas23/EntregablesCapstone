// src/components/Tickets/TicketReviewPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TicketReviewPage() {
  const [ticketNo, setTicketNo] = useState('');
  const [solicitante, setSolicitante] = useState('');
  const [fecha, setFecha] = useState('');
  const [categoria, setCategoria] = useState('');
  const [titulo, setTitulo] = useState('');
  const [comentario, setComentario] = useState('');
  const [resolucion, setResolucion] = useState('');

  const ticketId = 12345; // ID del ticket que quieres cargar (puedes obtenerlo dinámicamente)

  // Cargar ticket desde la API
  useEffect(() => {
    const cargarTicket = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/tickets/${ticketId}/`);
        const datosTicket = response.data;
        
        setTicketNo(datosTicket.ticketNo);
        setSolicitante(datosTicket.solicitante);
        setFecha(datosTicket.fecha);
        setCategoria(datosTicket.categoria);
        setTitulo(datosTicket.titulo);
        setComentario(datosTicket.comentario);
        setResolucion(datosTicket.resolucion);
      } catch (error) {
        console.error('Error al cargar el ticket:', error);
      }
    };

    cargarTicket();
  }, [ticketId]);

  // Guardar ticket (PUT)
  const handleGuardar = async () => {
    const datosTicketActualizado = {
      ticketNo,
      solicitante,
      fecha,
      categoria,
      titulo,
      comentario,
      resolucion,
    };

    try {
      await axios.put(`http://localhost:8000/api/tickets/${ticketId}/`, datosTicketActualizado);
      console.log('Ticket guardado exitosamente');
    } catch (error) {
      console.error('Error al guardar el ticket:', error);
    }
  };

  // Eliminar ticket (DELETE)
  const handleEliminar = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/tickets/${ticketId}/`);
      console.log('Ticket eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar el ticket:', error);
    }
  };

  return (
    <div className="ticket-review-page">
      <h1>Sistema de tickets</h1>
      <div className="ticket-form">
        <form>
          <div>
            <label>Ticket No.</label>
            <input
              type="text"
              value={ticketNo}
              readOnly
              disabled
            />
          </div>
          <div>
            <label>Usuario Solicitante</label>
            <input
              type="text"
              value={solicitante}
              readOnly
              disabled
            />
          </div>
          <div>
            <label>Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
          <div>
            <label>Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="Conexión de redes">Conexión de redes</option>
              <option value="Problemas de hardware">Problemas de hardware</option>
              <option value="Acceso a sistemas">Acceso a sistemas</option>
            </select>
          </div>
          <div>
            <label>Título del Ticket</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>
          <div>
            <label>Comentario</label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>
          <div>
            <label>Resolución</label>
            <select
              value={resolucion}
              onChange={(e) => setResolucion(e.target.value)}
            >
              <option value="En revisión">En revisión</option>
              <option value="Resuelto">Resuelto</option>
              <option value="Pendiente">Pendiente</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="button" onClick={handleEliminar}>Eliminar</button>
            <button type="button" onClick={handleGuardar}>Guardar</button>
            <button type="button" onClick={handleGuardar}>Salir y Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TicketReviewPage;
