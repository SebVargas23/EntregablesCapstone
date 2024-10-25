import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../App.css';
import logo from '../imagenes/Puma-logo-1.png';

// Componente Header
const Header = ({ nombreUsuario }) => (
  <header className="header">
    <img src={logo} alt="Header" className="header-image" />
    <nav className="header-nav">
      <ul>
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/tickets">Tickets</Link></li>
        <li><Link to="/reportes">Reportes</Link></li>
        <li><Link to="/configuracion">Configuración</Link></li>
        <li><Link to="/ayuda">Ayuda</Link></li>
      </ul>
    </nav>
    <div className="header-usuario">{nombreUsuario}</div>
  </header>
);

const TicketsList = () => {
  const [tickets, setTickets] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [estados, setEstados] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener los datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ticketsRes, categoriasRes, prioridadesRes, estadosRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/tickets/'),
          axios.get('http://127.0.0.1:8000/categorias/'),
          axios.get('http://127.0.0.1:8000/prioridades/'),
          axios.get('http://127.0.0.1:8000/estados/')
        ]);

        setTickets(ticketsRes.data);
        setCategorias(categoriasRes.data);
        setPrioridades(prioridadesRes.data);
        setEstados(estadosRes.data);
      } catch (err) {
        console.error('Error al obtener los datos:', err);
        setError('Hubo un problema al cargar los datos.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Función para obtener el nombre de una categoría, prioridad o estado por ID
  const getNombrePorId = (id, lista) => {
    const item = lista.find((item) => item.id === id);
    return item ? item.nom_categoria || item.num_prioridad || item.nom_estado : 'Desconocido';
  };

  // Aplicar filtros a los tickets
  const aplicarFiltros = () => {
    return tickets.filter((ticket) => {
      const cumpleCategoria = filtroCategoria ? ticket.categoria === parseInt(filtroCategoria) : true;
      const cumplePrioridad = filtroPrioridad ? ticket.prioridad === parseInt(filtroPrioridad) : true;
      const cumpleEstado = filtroEstado ? ticket.estado === parseInt(filtroEstado) : true;

      return cumpleCategoria && cumplePrioridad && cumpleEstado;
    });
  };

  const ticketsFiltrados = aplicarFiltros();
  const nombreUsuario = 'Carlitos Palacios'; // Simulación de nombre de usuario

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <Header nombreUsuario={nombreUsuario} />
      <div className="tickets-list-container" style={{ marginTop: '20px' }}>
        <h2>📋 Lista de Tickets</h2>

        {/* Filtros */}
        <div className="filtros">
          <select onChange={(e) => setFiltroCategoria(e.target.value)} value={filtroCategoria}>
            < option value="">Filtrar por Categoría</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nom_categoria}
              </option>
            ))}
          </select>

          <select onChange={(e) => setFiltroPrioridad(e.target.value)} value={filtroPrioridad}>
            <option value="">Filtrar por Prioridad</option>
            {prioridades.map((prioridad) => (
              <option key={prioridad.id} value={prioridad.id}>
                {prioridad.num_prioridad}
              </option>
            ))}
          </select>

          <select onChange={(e) => setFiltroEstado(e.target.value)} value={filtroEstado}>
            <option value="">Filtrar por Estado</option>
            {estados.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estado.nom_estado}
              </option>
            ))}
          </select>
        </div>

        {/* Lista de Tickets */}
        <div className="tickets-row">
          {ticketsFiltrados.map((ticket) => (
            <div key={ticket.id} className="ticket-item">
              <div className="ticket-header">
                <h3 className="ticket-title">{ticket.titulo}</h3>
                <button
                  onClick={() => window.open(`/tickets/edit/${ticket.id}`, '_blank')}
                  className="link"
                >
                  Ver detalles
                </button>
              </div>
              <div className="ticket-details">
                <p>Categoría: {getNombrePorId(ticket.categoria, categorias)}</p>
                <p>Prioridad: {getNombrePorId(ticket.prioridad, prioridades)}</p>
                <p>Estado: {getNombrePorId(ticket.estado, estados)}</p>
              </div>
            </div>
          ))}
        </div>

        <Link to="/tickets" className="create-ticket-button">
          Volver a Tickets
        </Link>
      </div>
    </div>
  );
};

export default TicketsList;