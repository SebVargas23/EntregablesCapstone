import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate para redirección
import '../App.css';
import logo from '../imagenes/Puma-logo-1.png'; // Asegúrate de que la ruta a la imagen sea correcta

// Componente Header
const Header = ({ nombreUsuario }) => (
  <header className="header">
    <img src={logo} alt="Header" className="header-image" />
    <nav className="header-nav">
      <ul>
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/tickets">Tickets</Link></li>
        <li><Link to="/reportes">Reportes</Link></li>
        <li><Link to="/configuracion">Configuración</Link></li>
        <li><Link to="/ayuda">Ayuda</Link></li>
      </ul>
    </nav>
    <div className="header-usuario">{nombreUsuario}</div>
  </header>
);

const Ticket = () => {
    const navigate = useNavigate(); // Redirige si es necesario
    const [formData, setFormData] = useState({
        titulo: '',
        comentario: '',
        categoria: '',
        prioridad: '',
        estado: 'Abierto', // Estado predeterminado
        servicio: '',
    });

    const [categorias, setCategorias] = useState([]);
    const [prioridades, setPrioridades] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const nombreUsuario = 'Carlitos Palacios'; // Simulación de nombre de usuario

    // Carga inicial de categorías, prioridades y servicios
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [categoriasRes, prioridadesRes, serviciosRes] = await Promise.all([
                    axios.get('http://127.0.0.1:8000/api/categorias/'),
                    axios.get('http://127.0.0.1:8000/api/prioridades/'),
                    axios.get('http://127.0.0.1:8000/api/servicios/'),
                ]);
                setCategorias(categoriasRes.data);
                setPrioridades(prioridadesRes.data);
                setServicios(serviciosRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Error al cargar los datos. Por favor, inténtelo de nuevo.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Manejar el cambio en el campo categoría y seleccionar servicio relacionado
    const handleCategoryChange = (e) => {
        const { value } = e.target;
        const selectedService = servicios.find(
            (servicio) => servicio.categoria_id === parseInt(value)
        );
        setFormData((prevData) => ({
            ...prevData,
            categoria: value,
            servicio: selectedService ? selectedService.id : '',
        }));
    };

    // Manejar los cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        // Validaciones
        if (!formData.titulo) newErrors.titulo = 'El título es obligatorio.';
        if (!formData.categoria) newErrors.categoria = 'Seleccione una categoría.';
        if (!formData.prioridad) newErrors.prioridad = 'Seleccione una prioridad.';
        if (!formData.servicio) newErrors.servicio = 'Seleccione un servicio.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Debe iniciar sesión.');
                navigate('/login'); // Redirigir si no hay token
                return;
            }

            // Crear el ticket
            await axios.post('http://127.0.0.1:8000/api/tickets/', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Reiniciar el formulario y errores
            setFormData({
                titulo: '',
                comentario: '',
                categoria: '',
                prioridad: '',
                estado: 'Abierto',
                servicio: '',
            });
            setErrors({});

            // Redirigir a la lista de tickets
            navigate('/tickets-list');
        } catch (error) {
            console.error('Error al crear el ticket:', error);
            alert('Hubo un problema al crear el ticket.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tickets-container">
            <Header nombreUsuario={nombreUsuario} /> {/* Agregué el Header */}
            {loading && <p>Cargando...</p>}
            <form className="ticket-form" onSubmit={handleSubmit}>
                <h2>🎫 Crear Ticket</h2>

                {/* Título */}
                <div className="input-group">
                    <label htmlFor="titulo">📝 Título</label>
                    <input
                        type="text"
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleChange}
                        required
                    />
                    {errors.titulo && <span className="error">{errors.titulo}</span>}
                </div>

                {/* Comentario */}
                <div className="input-group">
                    <label htmlFor="comentario">💬 Comentario</label>
                    <textarea
                        name="comentario"
                        value={formData.comentario}
                        onChange={handleChange}
                        rows="4"
                        required
                    ></textarea>
                </div>

                {/* Categoría */}
                <div className="input-group">
                    <label htmlFor="categoria">📂 Categoría</label>
                    <select
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleCategoryChange}
                        required
                    >
                        <option value="">Seleccione una categoría</option>
                        {categorias.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nom_categoria}
                            </option>
                        ))}
                    </select>
                    {errors.categoria && <span className="error">{errors.categoria}</span>}
                </div>

                {/* Prioridad */}
                <div className="input-group">
                    <label htmlFor="prioridad">⚡ Prioridad</label>
                    <select
                        name="prioridad"
                        value={formData.prioridad}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione una prioridad</option>
                        {prioridades.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.num_prioridad}
                            </option>
                        ))}
                    </select>
                    {errors.prioridad && <span className="error">{errors.prioridad}</span>}
                </div>

                {/* Servicio */}
                <div className="input-group">
                    <label htmlFor="servicio">🔧 Servicio</label>
                    <select
                        name="servicio"
                        value={formData.servicio}
                        onChange={handleChange} // Permitir selección manual si es necesario
                    >
                        <option value="">Seleccione un servicio</option>
                        {servicios.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.titulo_servicio}
                            </option>
                        ))}
                    </select>
                    {errors.servicio && <span className="error">{errors.servicio}</span>}
                </div>

                <button type="submit">🚀 Crear Ticket</button>
            </form>

            <Link to="/tickets-list" className="view-tickets-link">
                📋 Ver Lista de Tickets
            </Link>
        </div>
    );
};

export default Ticket;