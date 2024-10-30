// src/components/UsuarioLista.js
import '../App.css';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import listarUsuarios from '../api/usuarioHandler'; // Asegúrate de que la ruta sea correcta

const UsuarioLista = () => {
    const [usuarios, setUsuarios] = useState([]);
    const navigate = useNavigate();
    const handleTicketClick = (ticketId) => {
        navigate(`/tickets/edit/${ticketId}`);
      };
    useEffect(() => {
        const loadUsuarios = async () => {
            try {
                const data = await listarUsuarios();
                setUsuarios(data);
            } catch (error) {
                console.error('Error loading usuarios:', error);
            }
        };

        loadUsuarios();
    }, []);
    const toggleTickets = (id) => {
        setUsuarios((prevUsuarios) =>
          prevUsuarios.map((usuario) =>
            usuario.id === id ? { ...usuario, mostrarTickets: !usuario.mostrarTickets } : usuario
          )
        );
      };

    return (
        <div className="usuarios-tickets-container">
        <h1 className="usuarios-tickets-title">Usuarios y Sus Tickets</h1>
            <ul className="usuarios-list">
                {usuarios.map((usuario) => (
                <li key={usuario.id} className="usuario-item">
                    <div 
                    className="usuario-name"
                    onClick={() => toggleTickets(usuario.id)}
                    >
                    {usuario.nombre} (ID: {usuario.id})
                    </div>
                    {usuario.mostrarTickets && usuario.tickets.length > 0 && (
                    <ul className="tickets-list">
                        {usuario.tickets.map((ticket) => (
                        <li 
                            key={ticket.id} 
                            className="ticket-item"
                            onClick={() => handleTicketClick(ticket.id)}
                            style={{ cursor: 'pointer' }} // Agrega un cursor de puntero para indicar interactividad
                        >
                            {ticket.titulo}
                        </li>
                        ))}
                    </ul>
                    )}
                    {usuario.mostrarTickets && usuario.tickets.length === 0 && (
                    <p className="no-tickets">No hay tickets para este usuario.</p>
                    )}
                </li>
                ))}
            </ul>
        </div>
      );
};

export default UsuarioLista;
