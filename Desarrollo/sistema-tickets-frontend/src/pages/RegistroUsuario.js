import React, { useState, useEffect } from 'react';
import apiClient from '../components/apiClient';
import { decodeToken } from '../utils';
import Avatar from '../imagenes/Avatar.jpg';
import '../App.css';
import '../styles/registro.css'

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
    const [userStats, setUserStats] = useState({});
    const [isAdmin, setIsAdmin] = useState(false);


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
    const validateForm = () => {
        const newErrors = {};
    
        // Validación de RUT Usuario
        if (!formData.rut_usuario) {
            newErrors.rut_usuario = 'El RUT es obligatorio.';
        } else if (!/^\d{7,8}$/.test(formData.rut_usuario)) {
            newErrors.rut_usuario = 'El RUT debe contener entre 7 y 8 dígitos numéricos.';
        }
    
        // Validación de DV RUT
        if (!formData.dv_rut_usuario) {
            newErrors.dv_rut_usuario = 'El DV es obligatorio.';
        } else if (!/^[0-9kK]$/.test(formData.dv_rut_usuario)) {
            newErrors.dv_rut_usuario = 'El DV debe ser un número o la letra "K".';
        }
    
        // Validación de Nombre
        if (!formData.nom_usuario) {
            newErrors.nom_usuario = 'El nombre es obligatorio.';
        } else if (formData.nom_usuario.length < 3) {
            newErrors.nom_usuario = 'El nombre debe tener al menos 3 caracteres.';
        }
    
        // Validación de Correo
        if (!formData.correo) {
            newErrors.correo = 'El correo es obligatorio.';
        } // La validación del formato del correo es manejada por el input `type="email"`
    
        // Validación de Teléfono
        if (!formData.telefono) {
            newErrors.telefono = 'El teléfono es obligatorio.';
        } else if (!/^\+569\d{8}$/.test(formData.telefono)) {
            newErrors.telefono = 'El teléfono debe seguir el formato +569XXXXXXXX.';
        }
    
        // Validación de Cargo
        if (!formData.cargo) {
            newErrors.cargo = 'Debe seleccionar un cargo.';
        }
    
        // Validación de Contraseña
        if (!formData.password) {
            newErrors.password = 'La contraseña es obligatoria.';
        } else if (formData.password.length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
        }
    
        // Validación de Confirmar Contraseña
        if (formData.password !== formData.password_confirm) {
            newErrors.password_confirm = 'Las contraseñas no coinciden.';
        }
    
        return newErrors;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors); // Muestra los errores en pantalla
            return;
        }
    
        
        // Remueve el rol si no es administrador
        const formDataToSend = isAdmin ? formData : { ...formData, role: 'usuario' };

        try {
            const response = await apiClient.post('registrar/', formDataToSend);
            if (response) {
               alert('El usuario se a guardado exitosamente.');
               console.log('Usuario registrado:', response.data); 
               setErrors({});
               setFormData({
                rut_usuario: '',
                dv_rut_usuario: '',
                nom_usuario: '',
                correo: '',
                telefono: '',
                cargo: '',
                role: 'usuario', // Rol predeterminado
                password: '',
                password_confirm: '',
            });
            }
            
            
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
                        ? `${userStats.cargo.nom_cargo} (${userStats.cargo.departamento})`
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
                            {errors.rut_usuario && <span className="error-tooltip">{errors.rut_usuario}</span>}
                        </div>

                        <div className="input-group">
                            <label>DV RUT</label>
                            <input type="text" name="dv_rut_usuario" value={formData.dv_rut_usuario} onChange={handleChange} required />
                            {errors.dv_rut_usuario && <span className="error-tooltip">{errors.dv_rut_usuario}</span>}
                        </div>

                        <div className="input-group">
                            <label>Nombre</label>
                            <input type="text" name="nom_usuario" value={formData.nom_usuario} onChange={handleChange} required />
                            {errors.nom_usuario && <span className="error-tooltip">{errors.nom_usuario}</span>}
                        </div>

                        <div className="input-group">
                            <label>Correo</label>
                            <input type="email" name="correo" value={formData.correo} onChange={handleChange} required />
                            {errors.correo && <span className="error-tooltip">{errors.correo}</span>}
                        </div>

                        <div className="input-group">
                            <label>Teléfono</label>
                            <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required />
                            {errors.telefono && <span className="error-tooltip">{errors.telefono}</span>}
                        </div>

                        <div className="input-group">
                            <label>Cargo</label>
                            <select name="cargo" onChange={handleChange} value={formData.cargo} required>
                                <option value="">Seleccione un cargo</option>
                                {cargos.map(cargo => (
                                    <option key={cargo.id} value={cargo.id}>{cargo.nom_cargo}</option>
                                ))}
                            </select>
                            {errors.cargo && <span className="error-tooltip">{errors.cargo}</span>}
                        </div>

                        {/* Selector de Rol (visible solo para admin) */}
                        {isAdmin && (
                            <div className="input-group">
                                <label>Rol</label>
                                <select name="role" onChange={handleChange} value={formData.role}>
                                    <option value="usuario">Usuario</option>
                                    <option value="admin">Administrador</option>
                                </select>
                                {errors.role && <span className="error-tooltip">{errors.role}</span>}
                            </div>
                        )}

                        <div className="input-group">
                            <label>Contraseña</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                            {errors.password && <span className="error-tooltip">{errors.password}</span>}
                        </div>

                        <div className="input-group">
                            <label>Confirmar Contraseña</label>
                            <input type="password" name="password_confirm" value={formData.password_confirm} onChange={handleChange} required />
                            {errors.password_confirm && <span className="error-tooltip">{errors.password_confirm}</span>}
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
