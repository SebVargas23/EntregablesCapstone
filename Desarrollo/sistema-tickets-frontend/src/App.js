// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; // Asegúrate de que la ruta sea correcta
import RegistroUsuario from './components/RegistroUsuario';
import Login from './components/Login'; // Importa el componente Login
import Tickets from './components/Tickets'; // Importa el componente Tickets

function App() {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    {/* Ruta para el registro de usuario */}
                    <Route path="/registro" element={<RegistroUsuario />} />
                    
                    {/* Ruta para el login */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* Ruta para crear tickets */}
                    <Route path="/tickets" element={<Tickets />} />
                    
                    {/* Redireccionar a /login si no se encuentra la ruta */}
                    <Route path="*" element={<Login />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
