import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import 'boxicons/css/boxicons.min.css';

// Importamos el icono para la marca de agua
import logoIcon from "../../assets/img/talentrack_small.svg";

// REUTILIZAMOS EL CSS DEL LOGIN (Login.css)
// Esto asegura que tengan exactamente el mismo fondo y estilo de vidrio
import '../../assets/css/login.css';

const ResetPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Solicitud de reset para:', email);
    // Aquí tu lógica...
    alert('Si el correo existe, recibirás instrucciones.');
  };

  return (
    <div className="login-page">
      
      {/* MARCA DE AGUA (FONDO ICONO) */}
      <img src={logoIcon} alt="" className="background-watermark" />

      {/* Usamos 'login-container' para obtener el efecto GLASSMORPHISM */}
      <div className="login-container">
        
        {/* Icono del candado (Estilizado en el CSS que agregamos) */}
        <div className="reset-icon-wrapper">
          <div className="reset-icon">
            <i className='bx bxs-lock-open'></i>
          </div>
        </div>

        {/* Usamos las clases de tipografía del Login para que sean blancas */}
        <h2 className="login-title">Restablecer Contraseña</h2>
        <p className="login-subtitle">
          Introduce tu correo electrónico para recibir un enlace de recuperación.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Correo electrónico</label>
            
            <div className="input-wrapper">
              {/* Quitamos el color inline para que el CSS controle el gris/rojo */}
              <i className='bx bxs-envelope input-icon'></i>
              <input 
                type="email" 
                id="email"
                className="form-input" 
                placeholder="ej: tuemail@empresa.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Usamos la clase del botón del login */}
          <button type="submit" className="login-button">
            Enviar Instrucciones
          </button>
        </form>

        {/* Footer con estilo consistente */}
        <div className="login-footer-row" style={{ justifyContent: 'center' }}>
          <Link to="/login" className="footer-link">
            <i className='bx bx-arrow-back'></i> Volver al Inicio de Sesión
          </Link>
        </div>
        
        <div className="copyright-text">
          © 2025 Talent Track. Seguridad.
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;