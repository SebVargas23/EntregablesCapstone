// src/components/Navbar.js
import React from 'react';
import logo from '../imagenes/Puma-logo-1.png'; // Asegúrate de que la ruta sea correcta


function removeToken() {
  // revisar si el token esta en memoria local

  if (localStorage.getItem('token')) {
      localStorage.removeItem('token'); // remueve el token 
      console.log('Token eliminado de memoria local.');
      window.location.href = '/login';
  } else {
      console.log('No se encontro token en memoria local.');
  }
}

function getInitials(nombreCompleto) {
  if (!nombreCompleto) return ""; // Verificar si está vacío
  const nombres = nombreCompleto.split(" ");
  const iniciales = nombres
    .filter((parte) => parte.trim().length > 0) // Eliminar espacios extra
    .map((parte) => parte[0].toUpperCase()); // Tomar la primera letra en mayúsculas
  return iniciales.slice(0, 2).join(""); // Tomar máximo dos iniciales
}

const Navbar = ({ nombreUsuario }) => {
  return (
  <header className="navbar">
    {/* Logo Section */}
    <div className="navbar-logo">
      <img src={logo} alt="Logo" style={{ width: '40px' }} />
    </div>
    
    {/* Search Bar */}
    <input
      type="text"
      placeholder="Alguna búsqueda..."
      className="navbar-search-bar"
    />
    
    {/* User Info Section */}
    <div className="navbar-user-info">
      <span className="navbar-username">{nombreUsuario}</span>
      <div className="navbar-avatar">{getInitials(nombreUsuario)}</div>
    </div>
    <button onClick={removeToken} 
    className="navbar-logout-button"
    >Cerrar Sesión</button>
  </header>
  )
};

export default Navbar;
