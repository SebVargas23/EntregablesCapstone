// src/components/ticket.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Asegúrate de que la ruta sea correcta

const Ticket = () => {
    const navigate = useNavigate();

    const handleBackToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="ticket-container">
            {/* Botón para volver al login */}
            <button className="back-button" onClick={handleBackToLogin}>
                Volver al Login
            </button>
            
            <h2>Crear Ticket</h2>
            <form>
                <div>
                    <label>Título</label>
                    <input type="text" name="titulo" required />
                </div>
                <div>
                    <label>Comentario Resolución</label>
                    <textarea name="comentario" required></textarea>
                </div>
                <div>
                    <label>Categoría</label>
                    <select name="categoria">
                        <option value="soporte_tecnico">Soporte Técnico</option>
                        <option value="diagnostico_tecnico">Diagnóstico Técnico</option>
                        {/* Otras categorías si es necesario */}
                    </select>
                </div>
                <div>
                    <label>Prioridad</label>
                    <select name="prioridad">
                        <option value="alta">Alta</option>
                        <option value="media">Media</option>
                        <option value="baja">Baja</option>
                    </select>
                </div>
                <div>
                    <label>Estado</label>
                    <select name="estado">
                        <option value="abierto">Abierto</option>
                        <option value="cerrado">Cerrado</option>
                    </select>
                </div>
                <button type="submit">Crear Ticket</button>
            </form>
        </div>
    );
};

export default Ticket;
