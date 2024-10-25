// src/components/Usuarios/ListaUsuarios.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  // Cargar lista de usuarios al montar el componente
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/usuarios/');
        setUsuarios(response.data);
      } catch (error) {
        console.error('Error al cargar los usuarios:', error);
      }
    };

    cargarUsuarios();
  }, []);

  // Filtrar usuarios por búsqueda
  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleBuscar = (e) => {
    setBusqueda(e.target.value);
  };

  // Función para redirigir a la página de tickets de un usuario
  const handleRevisarTickets = (usuarioId) => {
    // Aquí deberías redirigir a la página que muestra los tickets del usuario
    // Puedes usar useHistory o cualquier librería de enrutamiento que estés usando
    console.log(`Revisando tickets para el usuario con ID: ${usuarioId}`);
    // Ejemplo si usas React Router:
    // history.push(`/tickets/usuario/${usuarioId}`);
  };

  return (
    <div className="lista-usuarios-page">
      <h1>Usuarios</h1>
      <div className="busqueda-usuario">
        <label>Búsqueda Usuario</label>
        <input
          type="text"
          value={busqueda}
          onChange={handleBuscar}
          placeholder="Buscar por nombre"
        />
      </div>

      <div className="lista-usuarios">
        {usuariosFiltrados.map((usuario) => (
          <div key={usuario.id} className="usuario-item">
            <span>{usuario.nombre}</span>
            <button onClick={() => handleRevisarTickets(usuario.id)}>
              Revisar Tickets
            </button>
          </div>
        ))}
      </div>

      <footer className="footer">
        <div className="footer-columns">
          <div>
            <p>Use cases</p>
            <ul>
              <li>UI design</li>
              <li>UX design</li>
              <li>Wireframing</li>
            </ul>
          </div>
          <div>
            <p>Explore</p>
            <ul>
              <li>Design</li>
              <li>Prototyping</li>
              <li>Collaboration features</li>
            </ul>
          </div>
          <div>
            <p>Resources</p>
            <ul>
              <li>Blog</li>
              <li>Best practices</li>
              <li>Color wheel</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ListaUsuarios;
