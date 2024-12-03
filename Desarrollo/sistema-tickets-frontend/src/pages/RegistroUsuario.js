import React, { useState, useEffect } from 'react';
import apiClient from '../components/apiClient';
import { useNavigate } from 'react-router-dom';
import { decodeToken } from '../utils';
import Avatar from '../imagenes/Avatar.jpg';
import '../App.css';

const RegistroUsuario = () => {
    const [formData, setFormData] = useState({
        rut_usuario: '',
        dv_rut_usuario: '',
        nom_usuario: '',
        correo: '',
        telefono: '',
        cargo: '',
        role: 'usuario', // Asume rol 'usuario' por defecto
        password: '',
        password_confirm: ''
    });;

    const [cargos, setCargos] = useState([]);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const [userStats, setUserStats] = useState({});
    const [isAdmin, setIsAdmin] = useState(false);

    // Mapeo de ID de departamento a nombres de departamento
    const departamentos = {
        1: 'TI',
        2: 'P&O',
        3: 'Marketing',
        4: 'Merchandising',
        5: 'Finanzas',
        6: 'Compliance',
        7: 'EBP',
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = decodeToken(token);
            setIsAdmin(decoded.role === 'admin'); // Determinamos si es admin

            // Obtener datos del usuario autenticado y estadísticas
            const fetchUserStats = async () => {
                try {
                    const response = await apiClient.get(`usuarios/${decoded.user_id}/`);
                    setUserStats(response.data);
                } catch (error) {
                    console.error('Error al obtener estadísticas del usuario:', error);
                }
            };
            fetchUserStats();
            const fetchCargos = async () => {
                try {
                    const response = await apiClient.get('cargos/');
                    //importante añadir header
                    setCargos(response.data);
                } catch (error) {
                    console.error('Error al obtener los cargos:', error);
                }
            };
            fetchCargos();
        }
    }, []);

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

        // Remueve el rol si no es administrador
        const formDataToSend = isAdmin ? formData : { ...formData, role: 'usuario' };

        try {
            const response = await apiClient.post('registrar/', formDataToSend);
            console.log('Usuario registrado:', response.data);
            navigate('/login');
        } catch (err) {
            console.error('Error en el registro:', err.response?.data || err.message);
            setErrors(err.response?.data || { error: 'Error desconocido en el registro' });
        }
    };

    return (
        <div className="registration-container">
            {/* Sección del perfil del usuario */}
            <div className="user-profile-section">
                <img src={Avatar} alt="Avatar" className="user-avatar" />
                <h2>{userStats.nom_usuario || "Usuario"}</h2>
                <p>
                    {userStats.cargo?.nom_cargo
                        ? `${userStats.cargo.nom_cargo} (${departamentos[userStats.cargo.departamento] || "Sin departamento"})`
                        : "Cargo no asignado"}
                </p>
                <p className="description">
                    Bienvenido a la plataforma. Aquí puedes ver tu información personal y estadísticas.
                </p>
                <p><strong>Correo:</strong> {userStats.correo || "No disponible"}</p>
                <p><strong>Teléfono:</strong> {userStats.telefono || "No disponible"}</p>
                <p><strong>Tickets Creados:</strong> {userStats.tickets_creados || 0}</p>
            </div>

            {/* Sección de registro solo visible para admins */}
            {isAdmin && (
                <div className="account-details-section">
                    <h3>Registrar Nuevo Usuario</h3>
                    <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="input-group">
                            <label>RUT Usuario</label>
                            <input type="text" name="rut_usuario" value={formData.rut_usuario} onChange={handleChange} required />
                            {errors.rut_usuario && <span className="error">{errors.rut_usuario}</span>}
                        </div>

                        <div className="input-group">
                            <label>DV RUT</label>
                            <input type="text" name="dv_rut_usuario" value={formData.dv_rut_usuario} onChange={handleChange} required />
                            {errors.dv_rut_usuario && <span className="error">{errors.dv_rut_usuario}</span>}
                        </div>

                        <div className="input-group">
                            <label>Nombre</label>
                            <input type="text" name="nom_usuario" value={formData.nom_usuario} onChange={handleChange} required />
                            {errors.nom_usuario && <span className="error">{errors.nom_usuario}</span>}
                        </div>

                        <div className="input-group">
                            <label>Correo</label>
                            <input type="email" name="correo" value={formData.correo} onChange={handleChange} required />
                            {errors.correo && <span className="error">{errors.correo}</span>}
                        </div>

                        <div className="input-group">
                            <label>Teléfono</label>
                            <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required />
                            {errors.telefono && <span className="error">{errors.telefono}</span>}
                        </div>

                        <div className="input-group">
                            <label>Cargo</label>
                            <select name="cargo" onChange={handleChange} value={formData.cargo} required>
                                <option value="">Seleccione un cargo</option>
                                {cargos.map(cargo => (
                                    <option key={cargo.id} value={cargo.id}>{cargo.nom_cargo}</option>
                                ))}
                            </select>
                            {errors.cargo && <span className="error">{errors.cargo}</span>}
                        </div>

                        {/* Selector de Rol (visible solo para admin) */}
                        {isAdmin && (
                            <div className="input-group">
                                <label>Rol</label>
                                <select name="role" onChange={handleChange} value={formData.role}>
                                    <option value="usuario">Usuario</option>
                                    <option value="admin">Administrador</option>
                                </select>
                                {errors.role && <span className="error">{errors.role}</span>}
                            </div>
                        )}

                        <div className="input-group">
                            <label>Contraseña</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                            {errors.password && <span className="error">{errors.password}</span>}
                        </div>

                        <div className="input-group">
                            <label>Confirmar Contraseña</label>
                            <input type="password" name="password_confirm" value={formData.password_confirm} onChange={handleChange} required />
                            {errors.password_confirm && <span className="error">{errors.password_confirm}</span>}
                        </div>
                    </div>
                    <button type="submit" className="update-account-button">Registrar Usuario</button>
                </form>
                </div>
            )}
        </div>
    );
};

export default RegistroUsuario;
