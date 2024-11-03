import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Asegúrate de que la ruta sea correcta

const Ticket = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        titulo: '',
        comentario: '',
        categoria: '',
        prioridad: '',
        servicio: '',
        estado: 'Abierto',
    });

    const [categorias, setCategorias] = useState([]);
    const [prioridades, setPrioridades] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [estados, setEstados] = useState([]);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await fetch('https://paranormal-skull-v55xrg947qqhpwpj-8000.app.github.dev/categorias/');
                const data = await response.json();
                setCategorias(data);
            } catch (error) {
                console.error('Error al cargar las categorías:', error);
            }
        };

        const fetchPrioridades = async () => {
            try {
                const response = await fetch('https://paranormal-skull-v55xrg947qqhpwpj-8000.app.github.dev/prioridades/');
                const data = await response.json();
                setPrioridades(data);
            } catch (error) {
                console.error('Error al cargar las prioridades:', error);
            }
        };

        const fetchServicios = async () => {
            try {
                const response = await fetch('https://paranormal-skull-v55xrg947qqhpwpj-8000.app.github.dev/servicios/');
                const data = await response.json();
                setServicios(data);
            } catch (error) {
                console.error('Error al cargar los servicios:', error);
            }
        };

        const fetchEstados = async () => {
            try {
                const response = await fetch('https://paranormal-skull-v55xrg947qqhpwpj-8000.app.github.dev/estados/');
                const data = await response.json();
                setEstados(data);
            } catch (error) {
                console.error('Error al cargar los estados:', error);
            }
        };

        fetchCategorias();
        fetchPrioridades();
        fetchServicios();
        fetchEstados();
    }, []);

    const handleCategoryChange = (e) => {
        const categoriaId = parseInt(e.target.value);
        setFormData((prevData) => ({
            ...prevData,
            categoria: categoriaId,
        }));

        const relatedService = servicios.find(
            (servicio) => servicio.categoria_id === categoriaId
        );

        if (relatedService) {
            setFormData((prevData) => ({
                ...prevData,
                servicio: relatedService.id,
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                servicio: '',
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Ajustar el valor de estado si es necesario
        const adjustedData = {
            ...formData,
            estado: estados.find((estado) => estado.nom_estado === formData.estado)?.id,
        };
    
        console.log('Datos ajustados:', adjustedData); // Verificar datos ajustados
    
        try {
            const response = await fetch('https://paranormal-skull-v55xrg947qqhpwpj-8000.app.github.dev/tickets/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(adjustedData),
            });
    
            if (response.ok) {
                alert('Ticket creado con éxito');
                navigate('/tickets');  // Redirige a la ruta raíz
                // Limpiar los campos del formulario
                setFormData({
                    titulo: '',
                    comentario: '',
                    categoria: '',
                    prioridad: '',
                    servicio: '',
                    estado: 'Abierto',  // Valor predeterminado
                });
    
            } else {
                const errorData = await response.json();
                console.error('Error en la respuesta:', errorData);
                alert('Error al crear el ticket');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un problema al crear el ticket');
        }
    };
    
    
    

    return (
        <div className="tickets-container">
            <button className="back-button" onClick={() => navigate('/login')}>
                ⬅ Volver al Login
            </button>

            <form className="ticket-form" onSubmit={handleSubmit}>
                <h2 className="form-title">🎫 Crear Ticket</h2>

                {/* Título */}
                <div className="input-group">
                    <label>📝 Título</label>
                    <input
                        type="text"
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleChange}
                        required
                        placeholder="Escribe el título del ticket"
                    />
                </div>

                {/* Comentario */}
                <div className="input-group">
                    <label>💬 Comentario</label>
                    <textarea
                        name="comentario"
                        value={formData.comentario}
                        onChange={handleChange}
                        required
                        placeholder="Escribe un comentario"
                    ></textarea>
                </div>

                {/* Categoría */}
                <div className="input-group">
                    <span className="icon">📂</span>
                    <select
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleCategoryChange}
                        required
                    >
                        <option value="">Seleccione una categoría</option>
                        {categorias.map((categoria) => (
                            <option key={categoria.id} value={categoria.id}>
                                {categoria.nom_categoria}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Prioridad */}
                <div className="input-group">
                    <span className="icon">⚡</span>
                    <select
                        name="prioridad"
                        value={formData.prioridad}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione una prioridad</option>
                        {prioridades.map((prioridad) => (
                            <option key={prioridad.id} value={prioridad.id}>
                                {prioridad.num_prioridad}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Servicio */}
                <div className="input-group">
                    <span className="icon">🔧</span>
                    <select
                        name="servicio"
                        value={formData.servicio}
                        required
                        disabled
                    >
                        <option value="">Seleccione un servicio</option>
                        {servicios.map((servicio) => (
                            <option key={servicio.id} value={servicio.id}>
                                {servicio.titulo_servicio}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Estado */}
                <div className="input-group">
                    <span className="icon">📌</span>
                    <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        required
                    >
                        {estados.map((estado) => (
                            <option key={estado.id} value={estado.nom_estado}>
                                {estado.nom_estado}
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit">🚀 Crear Ticket</button>
            </form>

            <a href="/tickets-list" className="view-tickets-link">
                📋 Ver Lista de Tickets
            </a>
        </div>
    );
};

export default Ticket;