// src/components/UserContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { decodeToken } from '../utils'; // Adjust the path as needed

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = decodeToken(token);
      if (decodedToken) {
        setNombreUsuario(decodedToken.nom_usuario);
        setUserRole(decodedToken.role); 
      }
    }
    setLoading(false); 
  }, []);

  return (
    <UserContext.Provider value={{ nombreUsuario, setNombreUsuario, userRole, setUserRole, loading }}>
      {children}
    </UserContext.Provider>
  );
};
