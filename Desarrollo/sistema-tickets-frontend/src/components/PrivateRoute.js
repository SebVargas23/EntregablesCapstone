// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { decodeToken } from '../utils';

const PrivateRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  
  // Si no hay token, redirige al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Decodifica el token para verificar el rol del usuario
  const decodedToken = decodeToken(token);
  const userRole = decodedToken?.role;

  // Verifica si el usuario tiene el rol requerido o si no hay rol requerido
  if (requiredRole && userRole !== requiredRole) {
    // Redirige a una página de acceso restringido o dashboard si el rol no coincide
    return <Navigate to="/tickets-list" replace />;
  }

  // Si todo está en orden, permite el acceso al componente
  return children;
};

export default PrivateRoute;
