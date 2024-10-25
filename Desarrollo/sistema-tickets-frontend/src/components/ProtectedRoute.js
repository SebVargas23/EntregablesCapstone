// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;


// Con esto, cuando intentes acceder a /tickets 
//sin estar autenticado, 
//serás redirigido a la página de login.