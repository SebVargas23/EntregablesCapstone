import React, { useState, useEffect } from 'react';
import apiClient from '../components/apiClient';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';

const EditTicket = ({ userRole }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState({});
    const [categorias, setCategorias] = useState([]);
    const [prioridades, setPrioridades] = useState([]);
    const [estados, setEstados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [feedback, setFeedback] = useState({
        nota: 3, // Valor predeterminado
        comentario: '',
    });

    const emojis = [
        { value: 1, label: '😢', color: 'red' },
        { value: 2, label: '😟', color: 'orange' },
        { value: 3, label: '😐', color: 'yellow' },
        { value: 4, label: '🙂', color: 'lightgreen' },
        { value: 5, label: '😊', color: 'green' },
    ];
    const updateMeterPosition = (nota) => `${(nota - 1) * 25}%`;
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No estás autenticado. Por favor, inicia sesión.');
                navigate('/login');
                return;
            }

            try {
                const [ticketRes, categoriasRes, prioridadesRes, estadosRes] = await Promise.all([
                    apiClient.get(`/tickets/${id}/`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    apiClient.get('/categorias/', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    apiClient.get('/prioridades/', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    apiClient.get('/estados/', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                setTicket(ticketRes.data);
                setCategorias(categoriasRes.data);
                setPrioridades(prioridadesRes.data);
                setEstados(estadosRes.data);

                if (ticketRes.data.evaluacion) {
                    setFeedback({
                        nota: ticketRes.data.evaluacion.nota || 3,
                        comentario: ticketRes.data.evaluacion.feedback || '',
                    });
                }
            } catch (err) {
                console.error('Error al obtener los datos:', err);
                setError('Hubo un problema al cargar los datos.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    if (loading) return <p>Cargando...</p>;
    if (error) return <p>{error}</p>;

    const isReadOnly = userRole !== 'admin';

    const handleUpdate = async () => {
        const token = localStorage.getItem('token');
        try {
            await apiClient.patch(`/tickets/${id}/`, {
                ...ticket,
                user: ticket.user.rut_usuario, // Asegura que envías rut_usuario
            }, {
                headers: {
                    
                    Authorization: `Bearer ${token}`,
                },
            });
            alert('Ticket actualizado con éxito');
            navigate('/tickets-list');
        } catch (error) {
            console.error('Error al actualizar el ticket:', error);
            alert('Hubo un problema al actualizar el ticket.');
        }
    };
    const estadoCerrado = estados.find((estado) => estado.nom_estado === 'Cerrado');
    const handleCloseTicket = async () => {
        const token = localStorage.getItem('token');

        if (!estadoCerrado) {
            alert('No se encontró el estado "Cerrado".');
            return;
        }

        if (!ticket.resolucion || ticket.resolucion.trim() === '') {
            alert('No puedes cerrar un ticket sin ingresar una resolución.');
            return;
        }

        try {
            await apiClient.patch(
                `/tickets/${id}/`,
                {
                    ...ticket,
                    estado: estadoCerrado.id,
                    fecha_cierre: new Date().toISOString(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert('El ticket ha sido cerrado con éxito.');
            navigate('/tickets-list');
        } catch (error) {
            console.error('Error al cerrar el ticket:', error);
            alert('Hubo un problema al cerrar el ticket.');
        }
    };

    const handleSubmitFeedback = async () => {
        const token = localStorage.getItem('token');
        console.log('Feedback enviado:', feedback);

        if (!feedback.nota) {
            alert('Por favor, selecciona una calificación antes de enviar tu feedback.');
            return;
        }

        try {
            await apiClient.post(`/tickets/${id}/feedback/`, feedback, {
                headers: {  
                    Authorization: `Bearer ${token}`,
                },
            });
            alert('Gracias por tu feedback.');

            // Recargar el ticket para mostrar el feedback actualizado
            const response = await apiClient.get(`/tickets/${id}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTicket(response.data);

            if (response.data.evaluacion) {
                setFeedback({
                    nota: response.data.evaluacion.nota,
                    comentario: response.data.evaluacion.feedback,
                });
            }
        } catch (error) {
            console.error('Error al enviar el feedback:', error);
            alert('Hubo un problema al enviar tu feedback.');
        }
    };



    return (
        <div className="ticket-section-container">
            <h2>🎫 {isReadOnly ? 'Ver Ticket' : 'Editar Ticket'}</h2>
            <form>
                <div className="input-group">
                    <label>Título:</label>
                    <input
                        type="text"
                        name="titulo"
                        value={ticket.titulo || ''}
                        readOnly={isReadOnly}
                        onChange={(e) => setTicket({ ...ticket, titulo: e.target.value })}
                    />
                </div>

                <div className="input-group">
                    <label>Comentario:</label>
                    <textarea
                        name="comentario"
                        value={ticket.comentario || ''}
                        readOnly={isReadOnly}
                        onChange={(e) => setTicket({ ...ticket, comentario: e.target.value })}
                    />
                </div>

                <div className="input-group">
                    <label>Categoría:</label>
                    <select
                        name="categoria"
                        value={ticket.categoria || ''}
                        disabled={isReadOnly}
                        onChange={(e) => setTicket({ ...ticket, categoria: e.target.value })}
                    >
                        <option value="">Seleccione una categoría</option>
                        {categorias.map((categoria) => (
                            <option key={categoria.id} value={categoria.id}>
                                {categoria.nom_categoria}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="input-group">
                    <label>Prioridad:</label>
                    <select
                        name="prioridad"
                        value={ticket.prioridad || ''}
                        disabled={isReadOnly}
                        onChange={(e) => setTicket({ ...ticket, prioridad: e.target.value })}
                    >
                        <option value="">Seleccione una prioridad</option>
                        {prioridades.map((prioridad) => (
                            <option key={prioridad.id} value={prioridad.id}>
                                {prioridad.num_prioridad}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="input-group">
                    <label>Estado:</label>
                    <select
                        name="estado"
                        value={ticket.estado || ''}
                        disabled={isReadOnly}
                        onChange={(e) => setTicket({ ...ticket, estado: e.target.value })}
                    >
                        <option value="">Seleccione un estado</option>
                        {estados.map((estado) => (
                            <option key={estado.id} value={estado.id}>
                                {estado.nom_estado}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="input-group">
                    <label>Resolución:</label>
                    <textarea
                        name="resolucion"
                        value={ticket.resolucion || ''}
                        disabled={isReadOnly}
                        onChange={(e) => setTicket({ ...ticket, resolucion: e.target.value })}
                    />
                </div>

                
                {ticket.estado === estadoCerrado.id &&(
                    <div>
                        <div className="feedback-section">
                            <h3>📝 Evaluación del Ticket</h3>
                            <p>
                                Calificación Guardada: 
                                {emojis.find((e) => e.value === feedback.nota)?.label || 'No calificado'}
                            </p>
                            <p>Comentario Guardado: {feedback.comentario || 'Sin comentarios'}</p>
                        </div>

                        <div className="feedback-section">
                            <h3>📝 Actualizar Evaluación</h3>
                            <div className="meter-bar">
                            <div
                                className="meter-indicator"
                                style={{ left: updateMeterPosition(feedback.nota) }}
                            ></div>
                        </div>
                            <div className="feedback-emojis">
                                {emojis.map((emoji) => (
                                    <span
                                        key={emoji.value}
                                        className={`emoji ${feedback.nota === emoji.value ? 'selected' : ''}`}
                                        style={{ color: emoji.color }}
                                        onClick={() => setFeedback({ ...feedback, nota: emoji.value })}
                                        title={`Nota ${emoji.value}`}
                                    >
                                        {emoji.label}
                                    </span>
                                ))}
                            </div>
                            <div className="input-group">
                                <label>Comentarios:</label>
                                <textarea
                                    name="comentario"
                                    value={feedback.comentario}
                                    onChange={(e) => setFeedback({ ...feedback, comentario: e.target.value })}
                                />
                            </div>
                            <button
                                type="button"
                                className="submit-feedback-button"
                                onClick={handleSubmitFeedback}
                                disabled={!feedback.nota}
                            >
                                Enviar Feedback
                            </button>
                        </div>
                </div>
                )}
                <div className="button-group admin-buttons">
                    {userRole === 'admin' && (
                        <>
                            <button type="button" className="update-button" onClick={handleUpdate}>
                                Actualizar
                            </button>
                            <button type="button" className="close-button" onClick={handleCloseTicket}>
                                Cerrar Ticket
                            </button>
                        </>
                    )}
                </div>
            </form>

            <button onClick={() => navigate('/tickets-list')} className="back-button">
                Volver a Lista de Tickets
            </button>
        </div>
    );
};

export default EditTicket;
