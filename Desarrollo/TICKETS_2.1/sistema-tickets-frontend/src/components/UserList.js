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
        <li><Link to="/users">Usuarios</Link></li>
        <li><Link to="/roles">Roles</Link></li>
        <li><Link to="/configuracion">Configuración</Link></li>
        <li><Link to="/ayuda">Ayuda</Link></li>
      </ul>
    </nav>
    <div className="header-usuario">{nombreUsuario}</div>
  </header>
);

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [status, setStatus] = useState([]);
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener los datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, rolesRes, statusRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/users/'),
          axios.get('http://127.0.0.1:8000/roles/'),
          axios.get('http://127.0.0.1:8000/user-status/')
        ]);

        setUsers(usersRes.data);
        setRoles(rolesRes.data);
        setStatus(statusRes.data);
      } catch (err) {
        console.error('Error al obtener los datos:', err);
        setError('Hubo un problema al cargar los datos.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Función para obtener el nombre de un rol o estado por ID
  const getNombrePorId = (id, lista) => {
    const item = lista.find((item) => item.id === id);
    return item ? item.nom_rol || item.nom_estado : 'Desconocido';
  };

  // Aplicar filtros a los usuarios
  const aplicarFiltros = () => {
    return users.filter((user) => {
      const cumpleRol = filtroRol ? user.rol === parseInt(filtroRol) : true;
      const cumpleEstado = filtroEstado ? user.estado === parseInt(filtroEstado) : true;

      return cumpleRol && cumpleEstado;
    });
  };

  const usersFiltrados = aplicarFiltros();
  const nombreUsuario = 'Carlitos Palacios'; // Simulación de nombre de usuario

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <Header nombreUsuario={nombreUsuario} />
      <div className="tickets-list-container" style={{ marginTop: '20px' }}>
        <h2>📋 Lista de Usuarios</h2>

        {/* Filtros */}
        <div className="filtros">
          <select onChange={(e) => setFiltroRol(e.target.value)} value={filtroRol}>
            <option value="">Filtrar por Rol</option>
            {roles.map((rol) => (
              <option key={rol.id} value={rol.id}>
                {rol.nom_rol}
              </option>
            ))}
          </select>

          <select onChange={(e) => setFiltroEstado(e.target.value)} value={filtroEstado}>
            <option value="">Filtrar por Estado</option>
            {status.map((estadoItem) => (
              <option key={estadoItem.id} value={estadoItem.id}>
                {estadoItem.nom_estado}
              </option>
            ))}
          </select>
        </div>

        {/* Lista de Usuarios */}
        <div className="tickets-row">
          {usersFiltrados.map((user) => (
            <div key={user.id} className="ticket-item">
              <div className="ticket-header">
                <h3 className="ticket-title">{user.nombre}</h3>
                <button
                  onClick={() => window.open(`/users/edit/${user.id}`, '_blank')}
                  className="link"
                >
                  Ver detalles
                </button>
              </div>
              <div className="ticket-details">
                <p>Rol: {getNombrePorId(user.rol, roles)}</p>
                <p>Estado: {getNombrePorId(user.estado, status)}</p>
              </div>
            </div>
          ))}
        </div>

        <Link to="/users" className="create-ticket-button">
          Volver a Usuarios
        </Link>
      </div>
    </div>
  );
};

export default UsersList;