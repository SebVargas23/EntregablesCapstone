// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; // Asegúrate de que la ruta sea correcta
import RegistroUsuario from './components/RegistroUsuario';
import Login from './components/Login'; // Importa el componente Login
import Tickets from './components/Tickets'; // Importa el componente Tickets
import TicketsList from './components/TicketsList';
import EditTicket from './components/EditTicket';
import PrivateRoute from './components/PrivateRoute'; // Importa el componente PrivateRoute
import UsersList from './components/UserList';

function App() {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    {/* Ruta para el registro de usuario */}
                    <Route path="/registro" element={<RegistroUsuario />} />

                    {/* Ruta para el login */}
                    <Route path="/login" element={<Login />} />


                    {/* Ruta protegida para crear tickets */}
                    <Route 
                        path="/tickets" 
                        element={
                            <PrivateRoute>
                                <Tickets />
                            </PrivateRoute>
                        } 
                    />

                    {/* Ruta protegida para la lista de tickets */}
                    <Route 
                        path="/tickets-list" 
                        element={
                            <PrivateRoute>
                                <TicketsList />
                            </PrivateRoute>
                        } 
                    />
                    
                    {/* Ruta protegida para Revisar Ticket */}
                    <Route 
                        path="/tickets/edit/:id" 
                        element={
                            <PrivateRoute>
                                <EditTicket />
                            </PrivateRoute>
                        } 
                    />
                    {/* Ruta para el UserList */}
                    <Route path="/userlist" element={<UsersList />} />

                    {/* Redireccionar a /login si no se encuentra la ruta */}
                    <Route path="*" element={<Login />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
