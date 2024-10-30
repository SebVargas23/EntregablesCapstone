// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginUser from '../api/sessionHandler';
import '../App.css'; // Asegúrate de que esta ruta sea correcta
import { Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    correo: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const correo = formData.correo
    const password = formData.password
    try {
      // Realizar solicitud POST para autenticación
      const data = await loginUser(correo, password);
      // Redirigir al dashboard o a otra ruta
      if (data) {
        navigate('/tickets');
      }
    } catch (error) {
      // Manejo de errores
      setError(error)
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>

        {error && <p className="error">{error}</p>}

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
        </div>

        <button type="submit">Iniciar Sesión</button>
        <p>¿No tienes una cuenta? <Link to="/registro">Regístrate aquí</Link></p>
      </form>
    </div>
  );
};

export default Login;
