import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import RegistroUsuario from './components/RegistroUsuario';
import Login from './components/Login';
import Tickets from './components/Tickets';
import TicketsList from './components/TicketsList';
import EditTicket from './components/EditTicket';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/registro" element={<RegistroUsuario />} />
          <Route path="/login" element={<Login />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/tickets-list" element={<TicketsList />} />
          <Route path="/tickets/edit/:id" element={<EditTicket />} /> {/* Cambiado a 'element' */}
          {/* Redirección al login si la ruta no existe */}
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;