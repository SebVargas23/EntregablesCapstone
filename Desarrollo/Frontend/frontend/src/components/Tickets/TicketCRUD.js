// src/components/Tickets/TicketCRUD.js

import React, { useState, useEffect } from 'react';

function TicketCRUD() {
    const [tickets, setTickets] = useState([]);
    
    // Esta función sería una llamada a tu API para obtener los tickets
    useEffect(() => {
        fetch('http://localhost:8000/api/tickets/')
            .then(res => res.json())
            .then(data => setTickets(data.tickets))
            .catch(err => console.log(err));
    }, []);

    return (
        <div>
            <h2>Gestión de Tickets</h2>
            <ul>
                {tickets.map(ticket => (
                    <li key={ticket.id}>{ticket.title}</li>
                ))}
            </ul>
        </div>
    );
}

export default TicketCRUD;
