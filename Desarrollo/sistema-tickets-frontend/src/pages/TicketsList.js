import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import { decodeToken } from '../utils'; // Asegúrate de tener decodeToken importado
import apiClient from '../components/apiClient';

const TicketsList = () => {
  const [tickets, setTickets] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [estados, setEstados] = useState([]);
  const [servicios, setServicios] = useState([]); // Nuevo estado para almacenar servicios
  const [usuarios, setUsuarios] = useState([]);
  const [sugerenciasUsuario, setSugerenciasUsuario] = useState([]); // Lista de usuarios para el filtro
  const [filtroUsuario, setFiltroUsuario] = useState(''); // Estado para el filtro por usuario
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.filtro-usuario')) {
        setSugerenciasUsuario([]);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    

    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = decodeToken(token);
      setUserRole(decodedToken.role);
    }

    const fetchData = async () => {
      if (!token) {
        setError('No estás autenticado. Por favor, inicia sesión.');
        navigate('/login');
        return;
      }
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const [ticketsRes, usuariosRes, categoriasRes, prioridadesRes, estadosRes, serviciosRes] = await Promise.all([
          apiClient.get('tickets/', { headers: { Authorization: `Bearer ${token}` } }),
          apiClient.get('get-user-data/', { headers: { Authorization: `Bearer ${token}` } }), // Obtener usuarios
          apiClient.get('categorias/', { headers: { Authorization: `Bearer ${token}` } }),
          apiClient.get('prioridades/', { headers: { Authorization: `Bearer ${token}` } }),
          apiClient.get('estados/', { headers: { Authorization: `Bearer ${token}` } }),
          apiClient.get('servicios/', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const estadoCerrado = estadosRes.data.find(estado => estado.nom_estado === "Cerrado")?.id;
        const openTickets = ticketsRes.data.filter(ticket => ticket.estado !== estadoCerrado);
        

        setTickets(openTickets);
        setUsuarios(usuariosRes.data); // Guardar usuarios
        setCategorias(categoriasRes.data);
        setPrioridades(prioridadesRes.data);
        setEstados(estadosRes.data);
        setServicios(serviciosRes.data);
      } catch (err) {
        console.error('Error al obtener los datos:', err);
        setError('Hubo un problema al cargar los datos.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [navigate]);

  const getNombrePorId = (id, lista, campo = 'nom_categoria') => {
    const item = lista.find(item => item.id === id);
    return item ? item[campo] : 'Desconocido';
  };
  
  const manejarCambioFiltroUsuario = (e) => {
    const valor = e.target.value;
    setFiltroUsuario(valor);
  
    if (valor) {
      const sugerencias = usuarios.filter(usuario =>
        usuario.nom_usuario.toLowerCase().includes(valor.toLowerCase())
      );
      setSugerenciasUsuario(sugerencias);
    } else {
      setSugerenciasUsuario([]);
    }
  };
  

  const aplicarFiltros = () => {

    return tickets.filter(ticket => {
      const cumpleUsuario = filtroUsuario ? ticket.user?.toLowerCase().includes(filtroUsuario.toLowerCase()) : true;
      const cumpleCategoria = filtroCategoria ? ticket.categoria === parseInt(filtroCategoria) : true;
      const cumplePrioridad = filtroPrioridad ? ticket.prioridad === parseInt(filtroPrioridad) : true;
      const cumpleEstado = filtroEstado ? ticket.estado === parseInt(filtroEstado) : true;
      return cumpleUsuario && cumpleCategoria && cumplePrioridad && cumpleEstado;
    });
  };

  const ticketsFiltrados = aplicarFiltros();

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="tickets-list-container">
      <h2>📋 Lista de Tickets</h2>
      <div className="filtros">
      {userRole === 'admin' && (
        <div className="filtro-usuario">
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={filtroUsuario}
          onChange={manejarCambioFiltroUsuario}
        />
        {sugerenciasUsuario.length > 0 && (
          <ul className="sugerencias-lista">
            {sugerenciasUsuario.map((sugerencia) => (
              <li
                key={sugerencia.id}
                onClick={() => {
                  setFiltroUsuario(sugerencia.nom_usuario);
                  setSugerenciasUsuario([]);
                }}
                style={{color:"black"}}
              >
                {sugerencia.nom_usuario}
              </li>
            ))}
          </ul>
        )}
      </div>
      )}

      
        <select onChange={e => setFiltroCategoria(e.target.value)} value={filtroCategoria}>
          <option value="">Filtrar por Categoría</option>
          {categorias.map(categoria => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nom_categoria}
            </option>
          ))}
        </select>

        <select onChange={e => setFiltroPrioridad(e.target.value)} value={filtroPrioridad}>
          <option value="">Filtrar por Prioridad</option>
          {prioridades.map(prioridad => (
            <option key={prioridad.id} value={prioridad.id}>
              {prioridad.num_prioridad}
            </option>
          ))}
        </select>

        <select onChange={e => setFiltroEstado(e.target.value)} value={filtroEstado}>
          <option value="">Filtrar por Estado</option>
          {estados.map(estado => (
            <option key={estado.id} value={estado.id}>
              {estado.nom_estado}
            </option>
          ))}
        </select>
      </div>

      <table className="tickets-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Resumen</th>
            <th>Creador</th>
            <th>Prioridad</th>
            <th>Categoría</th>
            <th>Servicio</th>
            <th>Estado</th>
            <th>Fecha de Creación</th>
          </tr>
        </thead>
        <tbody>
          {ticketsFiltrados.map(ticket => (
            <tr key={ticket.id}>
              <td>{ticket.id}</td>
              <td>
                <Link to={`/tickets/edit/${ticket.id}`}>{ticket.titulo}</Link>
              </td>
              <td>{ticket.user || 'Desconocido'}</td>
              <td>
                <span className={`priority-badge priority-${getNombrePorId(ticket.prioridad, prioridades, 'num_prioridad').toLowerCase()}`}>
                  {getNombrePorId(ticket.prioridad, prioridades, 'num_prioridad')}
                </span>
              </td>
              <td>{getNombrePorId(ticket.categoria, categorias, 'nom_categoria')}</td>
              <td>{getNombrePorId(ticket.servicio, servicios, 'titulo_servicio')}</td>
              <td>
                <span className={`status-badge ${
                  getNombrePorId(ticket.estado, estados, 'nom_estado') === "En espera de aprobación"
                    ? "status-en_espera_de_aprobacion"
                    : `status-${getNombrePorId(ticket.estado, estados, 'nom_estado').toLowerCase().replace(/ /g, '_')}`
                }`}>
                  {getNombrePorId(ticket.estado, estados, 'nom_estado')}
                </span>
              </td>
              <td>{ticket.fecha_creacion ? new Date(ticket.fecha_creacion).toLocaleDateString() : 'Desconocida'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketsList;
