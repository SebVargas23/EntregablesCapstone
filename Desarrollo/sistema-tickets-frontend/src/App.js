// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import RegistroUsuario from './pages/RegistroUsuario';
import Login from './pages/Login';
import Tickets from './pages/Tickets';
import TicketsList from './pages/TicketsList';
import EditTicket from './pages/EditTicket';
import ClosedTicketsList from './pages/ClosedTicketsList';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import apiClient from './components/apiClient';
import SlaRelatedData from './pages/SlaRelatedData';
import Navbar from './components/Navbar';
import { useUser, UserProvider } from './components/UserContext';

// Configuración de Axios
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Error de Axios:", error.message);
    if (error.response && error.response.status === 401) {
      alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

function App() {
  return (
    <UserProvider>
      <Router>
        <MainContent />
      </Router>
    </UserProvider>
  );
}

function MainContent() {
  const { nombreUsuario, userRole, loading } = useUser(); // Access context values
  const location = useLocation();
  const isLoginRoute = location.pathname === '/login';
  
  if (loading) {
    return <div>Loading...</div>; // Mostramos un mensaje mientras cargan los datos
  }
  
  return (
    <div className="app-container">
      {!isLoginRoute && <Navbar nombreUsuario={nombreUsuario} />}
      {!isLoginRoute && <Sidebar userRole={userRole} />}

      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<PrivateRoute><RegistroUsuario /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute requiredRole="admin"><Dashboard /></PrivateRoute>} />
          <Route path="/tickets" element={<PrivateRoute><Tickets /></PrivateRoute>} />
          <Route path="/tickets-list" element={<PrivateRoute><TicketsList /></PrivateRoute>} />
          <Route path="/tickets/edit/:id" element={<PrivateRoute><EditTicket userRole={userRole}/></PrivateRoute>} />
          <Route path="/tickets-cerrados" element={<PrivateRoute><ClosedTicketsList /></PrivateRoute>} />
          <Route path="/sla-data" element={<PrivateRoute requiredRole="admin"><SlaRelatedData /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}
export default App;
