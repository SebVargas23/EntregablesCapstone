import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

const EditTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState({});
  const [categorias, setCategorias] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [estados, setEstados] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketRes, categoriasRes, prioridadesRes, estadosRes] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/tickets/${id}/`),
          axios.get('http://127.0.0.1:8000/categorias/'),
          axios.get('http://127.0.0.1:8000/prioridades/'),
          axios.get('http://127.0.0.1:8000/estados/')
        ]);

        setTicket({
          ...ticketRes.data,
          fecha_creacion: ticketRes.data.fecha_creacion 
            ? new Date(ticketRes.data.fecha_creacion).toISOString().split('T')[0] 
            : '',
          fecha_cierre: ticketRes.data.fecha_cierre 
            ? new Date(ticketRes.data.fecha_cierre).toISOString().split('T')[0] 
            : ''
        });
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
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTicket({ ...ticket, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Realiza la solicitud PATCH para actualizar el ticket
      await axios.patch(`http://127.0.0.1:8000/tickets/${id}/`, ticket, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      alert('Ticket actualizado con éxito');
      navigate('/tickets-list');
    } catch (err) {
      console.error('Error al actualizar el ticket:', err);
      setError('Hubo un problema al actualizar el ticket.');
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="tickets-list-container">
      <Header nombreUsuario="Carlitos Palacios" />

      <div className="ticket-form">
        <h2>Editar Ticket</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Creado Por:</label>
            <input
              type="text"
              name="creado_por"
              value={ticket.creado_por || ''}
              readOnly
            />
          </div>

          <div className="input-group">
            <label>Fecha de Creación:</label>
            <input
              type="text"
              name="fecha_creacion"
              value={ticket.fecha_creacion || 'No disponible'}
              readOnly
            />
          </div>

          <div className="input-group">
            <label>Título:</label>
            <input
              type="text"
              name="titulo"
              value={ticket.titulo || ''}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Categoría:</label>
            <select
              name="categoria"
              value={ticket.categoria || ''}
              onChange={handleChange}
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nom_categoria}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Prioridad:</label>
            <select
              name="prioridad"
              value={ticket.prioridad || ''}
              onChange={handleChange}
            >
              <option value="">Seleccione una prioridad</option>
              {prioridades.map((prioridad) => (
                <option key={prioridad.id} value={prioridad.id}>
                  {prioridad.num_prioridad}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Estado:</label>
            <select
              name="estado"
              value={ticket.estado || ''}
              onChange={handleChange}
            >
              <option value="">Seleccione un estado</option>
              {estados.map((estado) => (
                <option key={estado.id} value={estado.nom_estado}>
                  {estado.nom_estado}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Comentario:</label>
            <textarea
              name="comentario"
              value={ticket.comentario || ''}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Fecha de Cierre:</label>
            <input
              type="date"
              name="fecha_cierre"
              value={ticket.fecha_cierre || ''}
              onChange={handleChange}
            />
          </div>

          <button type="submit">Actualizar</button>
        </form>

        <button onClick={() => navigate('/tickets-list')} className="back-to-list-button">
          Volver a Lista de Tickets
        </button>
      </div>
    </div>
  );
};

export default EditTicket;
