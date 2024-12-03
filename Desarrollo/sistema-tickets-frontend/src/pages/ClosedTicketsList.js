import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';
import apiClient from '../components/apiClient';

const ClosedTicketsList = () => {
  const [closedTickets, setClosedTickets] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const ESTADO_CERRADO_ID = 5; // ID del estado "Cerrado"

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No estás autenticado. Por favor, inicia sesión.');
        navigate('/login');
        return;
      }

      try {
        const [ticketsRes, categoriasRes, prioridadesRes, estadosRes] = await Promise.all([
          apiClient.get('tickets/', {
            headers: {'Authorization': `Bearer ${token}` },
          }),
          apiClient.get('categorias/', {
            headers: {'Authorization': `Bearer ${token}` },
          }),
          apiClient.get('prioridades/', {
            headers: {'Authorization': `Bearer ${token}` },
          }),
          apiClient.get('estados/', {
            headers: {'Authorization': `Bearer ${token}` },
          }),
        ]);

        const ticketsData = ticketsRes.data.filter(ticket => ticket.estado === ESTADO_CERRADO_ID);
        setClosedTickets(ticketsData);
        setCategorias(categoriasRes.data);
        setPrioridades(prioridadesRes.data);
        setEstados(estadosRes.data);
      } catch (err) {
        console.error('Error al obtener los tickets cerrados:', err);
        setError('Hubo un problema al cargar los tickets cerrados.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const getNombrePorId = (id, lista, campo) => {
    const item = lista.find((item) => item.id === id);
    return item ? item[campo] : 'Desconocido';
  };

  const obtenerClaseDePrioridad = (prioridadId) => {
    const prioridad = getNombrePorId(prioridadId, prioridades, 'num_prioridad');
    if (prioridad === 'Alta') return 'priority-alta';
    if (prioridad === 'Media') return 'priority-media';
    if (prioridad === 'Baja') return 'priority-baja';
    return '';
  };

  const obtenerClaseDeEstado = (estadoNombre) => {
    return `status-${estadoNombre.toLowerCase().replace(/ /g, '_')}`;
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="tickets-list-container">
      <h2>🎫 Lista de Tickets Cerrados</h2>

      {closedTickets.length === 0 ? (
        <p>No hay tickets cerrados.</p>
      ) : (
        <table className="tickets-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Resumen</th>
              <th>Creador</th>
              <th>Prioridad</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Fecha de Cierre</th>
            </tr>
          </thead>
          <tbody>
            {closedTickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.id}</td>
                <td>
                  <Link to={`/tickets/edit/${ticket.id}`} className="ticket-link">
                    {ticket.titulo}
                  </Link>
                </td>
                <td>{ticket.user || 'Desconocido'}</td>
                <td>
                  <span className={`priority-badge ${obtenerClaseDePrioridad(ticket.prioridad)}`}>
                    {getNombrePorId(ticket.prioridad, prioridades, 'num_prioridad')}
                  </span>
                </td>
                <td>{getNombrePorId(ticket.categoria, categorias, 'nom_categoria')}</td>
                <td>
                  <span className={`status-badge ${obtenerClaseDeEstado(getNombrePorId(ticket.estado, estados, 'nom_estado'))}`}>
                    {getNombrePorId(ticket.estado, estados, 'nom_estado')}
                  </span>
                </td>
                <td>{ticket.fecha_cierre ? new Date(ticket.fecha_cierre).toLocaleDateString() : 'No disponible'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="buttons-container">
        <button onClick={() => navigate('/tickets-list')} className="back-to-list-button">
          Volver a Lista de Tickets
        </button>
      </div>
    </div>
  );
};

export default ClosedTicketsList;
