import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import 'boxicons/css/boxicons.min.css';
// Importamos los estilos de autenticación
import '../../assets/css/auth.css';

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
      <div className="reset-container">
        
        {/* Icono animado del candado */}
        <div className="reset-icon-wrapper">
          <div className="reset-icon">
            <i className='bx bxs-lock-open'></i>
          </div>
        </div>

        <h2 className="reset-title">Restablecer Contraseña</h2>
        <p className="reset-subtitle">
          Introduce tu correo electrónico para recibir un enlace de recuperación.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Correo electrónico</label>
            
            {/* ESTA ES LA PARTE IMPORTANTE QUE FALTA ACTUALIZAR */}
            <div className="input-wrapper">
              {/* Icono de sobre rojo */}
              <i className='bx bxs-envelope input-icon' style={{ color: '#d51e37' }}></i>
              <input 
                type="email" 
                id="email"
                className="form-input" /* Esta clase le da el estilo bonito */
                placeholder="ej: tuemail@empresa.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="reset-button">
            Enviar Instrucciones
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          {/* Enlace con estilo y flecha */}
          <Link to="/login" className="back-to-login">
            <i className='bx bx-arrow-back'></i> Volver al Inicio de Sesión
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;