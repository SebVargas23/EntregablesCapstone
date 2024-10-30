import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; // Asegúrate de que esta ruta sea correcta
import { Link, useNavigate } from 'react-router-dom'; // Importa useNavigate

const RegistroUsuario = () => {
    const [formData, setFormData] = useState({
        rut_usuario: '',
        dv_rut_usuario: '',
        nom_usuario: '',
        correo: '',
        telefono: '',
        cargo: '',
        password: '',
        password_confirm: ''
    });

    const [cargos, setCargos] = useState([]); // Declaración de cargos
    const [errors, setErrors] = useState({});
    const navigate = useNavigate(); // Inicializa useNavigate

    useEffect(() => {
        // Función para obtener los cargos del backend
        const fetchCargos = async () => {
            try {
                const response = await axios.get('ttps://paranormal-skull-v55xrg947qqhpwpj-8000.app.github.dev/api/cargos/'); // Cambia la URL según tu API
                setCargos(response.data); // Suponiendo que la respuesta es un array de cargos
            } catch (error) {
                console.error('Error al obtener los cargos:', error);
            }
        };

        fetchCargos(); // Llama a la función
    }, []); // Se ejecuta una vez al montar el componente

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: undefined,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Datos enviados:', formData);

        try {
            const response = await axios.post('ttps://paranormal-skull-v55xrg947qqhpwpj-8000.app.github.dev/registrar/', formData);
            console.log('Usuario registrado:', response.data);
            // Aquí puedes redirigir o hacer algo después del registro exitoso
            navigate('/login'); // Redirige al login después del registro exitoso
        } catch (err) {
            console.error('Error en el registro:', err.response?.data || err.message);
            if (err.response?.data) {
                setErrors(err.response.data);
            }
        }
    };

    const handleBackToLogin = () => {
        navigate('/login'); // Función para volver al login
    };

    return (
        <div className="login-container">
            {/* Botón para volver al login */}
            <button className="back-button" onClick={handleBackToLogin}>
                Volver al Login
            </button>

            <form className="login-box" onSubmit={handleSubmit}>
                <h2>Registro de Usuario</h2>

                <div className="input-group">
                    <input
                        type="text"
                        name="rut_usuario"
                        placeholder="RUT de Usuario"
                        value={formData.rut_usuario}
                        onChange={handleChange}
                        required
                    />
                    <span className="icon">🆔</span>
                    {errors.rut_usuario && <span className="error">{errors.rut_usuario}</span>}
                </div>

                <div className="input-group">
                    <input
                        type="text"
                        name="dv_rut_usuario"
                        placeholder="DV RUT de Usuario"
                        value={formData.dv_rut_usuario}
                        onChange={handleChange}
                        required
                    />
                    <span className="icon">🔍</span>
                    {errors.dv_rut_usuario && <span className="error">{errors.dv_rut_usuario}</span>}
                </div>

                <div className="input-group">
                    <input
                        type="text"
                        name="nom_usuario"
                        placeholder="Nombre de Usuario"
                        value={formData.nom_usuario}
                        onChange={handleChange}
                        required
                    />
                    <span className="icon">👤</span>
                    {errors.nom_usuario && <span className="error">{errors.nom_usuario}</span>}
                </div>

                <div className="input-group">
                    <input
                        type="email"
                        name="correo"
                        placeholder="Correo Electrónico"
                        value={formData.correo}
                        onChange={handleChange}
                        required
                    />
                    <span className="icon">✉️</span>
                    {errors.correo && <span className="error">{errors.correo}</span>}
                </div>

                <div className="input-group">
                    <input
                        type="tel"
                        name="telefono"
                        placeholder="Teléfono"
                        value={formData.telefono}
                        onChange={handleChange}
                        required
                    />
                    <span className="icon">📞</span>
                    {errors.telefono && <span className="error">{errors.telefono}</span>}
                </div>

                <div className="input-group">
                    <select name="cargo" id="cargo" onChange={handleChange} value={formData.cargo} required>
                        <option value="">Seleccione un cargo</option>
                        {cargos.map(cargo => (
                            <option key={cargo.id} value={cargo.id}>
                                {cargo.nom_cargo}
                            </option>
                        ))}
                    </select>
                    <span className="icon">💼</span>
                    {errors.cargo && <span className="error">{errors.cargo}</span>}
                </div>

                <div className="input-group">
                    <input
                        type="password"
                        name="password"
                        placeholder="Contraseña"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <span className="icon">🔒</span>
                    {errors.password && <span className="error">{errors.password}</span>}
                </div>

                <div className="input-group">
                    <input
                        type="password"
                        name="password_confirm"
                        placeholder="Confirmar Contraseña"
                        value={formData.password_confirm}
                        onChange={handleChange}
                        required
                    />
                    <span className="icon">🔒</span>
                    {errors.password_confirm && <span className="error">{errors.password_confirm}</span>}
                </div>

                <button type="submit">Registrar</button>
                <p>¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
            </form>
        </div>
    );
};

export default RegistroUsuario;
