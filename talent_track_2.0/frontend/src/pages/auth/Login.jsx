import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Asegúrate de tener el logo en la ruta correcta, por ejemplo: src/assets/images/
import logo from '../../assets/img/talenTrackLogo_SVG.svg'; 
import 'boxicons/css/boxicons.min.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false
  });

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos de login:', formData);
    // Aquí iría tu lógica de conexión con el backend (fetch/axios)
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo-image" style={{ width: '200px', marginBottom: '10px' }} />
          <h1 className="login-title">Bienvenido de nuevo</h1>
          <p className="login-subtitle">Inicia sesión para gestionar tu equipo.</p>
        </div>

        <form onSubmit={handleSubmit} id="loginForm">
          <div className="form-group">
            <label className="form-label" htmlFor="username">Usuario</label>
            <div className="input-wrapper">
              <i className='bx bxs-user input-icon' style={{ color: '#d51e37' }}></i>
              <input 
                type="text" 
                id="username" 
                name="username"
                className="form-input" 
                placeholder="Ingresa tu usuario"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <i className='bx bxs-lock input-icon' style={{ color: '#d51e37' }}></i>
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                name="password"
                className="form-input" 
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {/* Lógica para mostrar/ocultar contraseña */}
              <i 
                className={`bx ${showPassword ? 'bx-show' : 'bx-hide'} password-toggle`} 
                id="togglePassword" 
                style={{ color: '#868988' }}
                onClick={togglePassword}
              ></i>
            </div>
          </div>

          <div className="form-options">
            <div className="checkbox-wrapper">
              <input 
                type="checkbox" 
                id="remember" 
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
              />
              <label className="checkbox-label" htmlFor="remember">Recordar Contraseña</label>
            </div>
            {/* CORREGIDO: class -> className */}
            <Link to="/reset-password" className="forgot-password">¿Olvidaste tu contraseña?</Link>
          </div>

          <button type="submit" className="login-button">Iniciar Sesión</button>
        </form>

        {/* CORREGIDO: Quitamos el style inline azul y usamos la clase correcta */}
        <Link to="/" className="back-home-link">
          ← Volver al inicio
        </Link>

        <p className="footer-text" style={{ marginTop: '30px' }}>© 2025 UTPL. Todos los derechos reservados.</p>
      </div>
    </div>
  );
};

export default Login;