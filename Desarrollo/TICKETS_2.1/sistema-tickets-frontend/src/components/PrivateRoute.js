// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Verifica si hay un token en localStorage

  // Si no hay token, redirige al usuario al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, permite el acceso a la ruta
  return children;
};

export default PrivateRoute;
