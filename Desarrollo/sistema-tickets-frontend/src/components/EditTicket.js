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
  const { id } = useParams(); // Obtener el ID del ticket desde la URL
  const navigate = useNavigate(); // Para redirigir después de la actualización
  const [ticket, setTicket] = useState({}); // Inicializa como un objeto vacío
  const [categorias, setCategorias] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const nombreUsuario = 'Carlitos Palacios'; // Simulación de nombre de usuario

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketRes, categoriasRes, prioridadesRes, estadosRes] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/tickets/${id}/`),
          axios.get('http://127.0.0.1:8000/categorias/'),
          axios.get('http://127.0.0.1:8000/prioridades/'),
          axios.get('http://127.0.0.1:8000/estados/')
        ]);

        setTicket(ticketRes.data);
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
    setTicket({ ...ticket, [name]: value }); // Actualiza el ticket con el nuevo valor
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://127.0.0.1:8000/tickets/${id}/`, ticket);
      alert('Ticket actualizado con éxito');
      navigate('/tickets-list'); // Redirigir a la lista de tickets después de la actualización
    } catch (err) {
      console.error('Error al actualizar el ticket:', err);
      setError('Hubo un problema al actualizar el ticket.');
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;
  if (!ticket) return <p>No se encontraron detalles para este ticket.</p>;

  return (
    <div className="tickets-list-container">
      <Header nombreUsuario={nombreUsuario} />
      <div className="ticket-form">
        <h2>Editar Ticket</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Título:</label>
            <input
              type="text"
              name="titulo"
              value={ticket.titulo || ''} // Asigna el valor del título del ticket
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label>Categoría:</label>
            <select
              name="categoria"
              value={ticket.categoria || ''} // Asigna el valor de la categoría del ticket
              onChange={handleChange}
            >
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
              value={ticket.prioridad || ''} // Asigna el valor de la prioridad del ticket
              onChange={handleChange}
            >
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
              value={ticket.estado || ''} // Asigna el valor del estado del ticket
              onChange={handleChange}
            >
              {estados.map((estado) => (
                <option key={estado.id} value={estado.id}>
                  {estado.nom_estado}
                </option>
              ))}
            </select>
          </div>
          <button type="submit">Actualizar</button>
        </form>
      </div>
    </div>
  );
};

export default EditTicket;