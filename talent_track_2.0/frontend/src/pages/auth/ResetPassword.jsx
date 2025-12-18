import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ResetPassword = () => {
  const [emailOrUser, setEmailOrUser] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Solicitud de reset para:', emailOrUser);
    // Lógica para enviar el correo de recuperación
    alert('Si el usuario existe, se enviará un correo de recuperación.');
  };

  return (
    <div className="login-page">
      <div className="reset-container">
        <div className="reset-icon-wrapper">
          <div className="reset-icon">🔒</div>
        </div>

        <div className="reset-header">
          <h1 className="reset-title">Restablecer Contraseña</h1>
          <p className="reset-subtitle">
            Introduce tu correo electrónico o nombre de usuario para recibir un enlace para restablecer la contraseña.
          </p>
        </div>

        <form onSubmit={handleSubmit} id="resetForm">
          <div className="form-group">
            <label className="form-label" htmlFor="emailOrUsername">
              Correo electrónico o nombre de usuario
            </label>
            <input 
              type="text" 
              id="emailOrUsername" 
              className="form-input-reset" 
              placeholder="ej: tuemail@empresa.com"
              value={emailOrUser}
              onChange={(e) => setEmailOrUser(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="reset-button">Enviar</button>
        </form>

        <Link to="/login" className="back-to-login">Volver al Inicio de Sesión</Link>
      </div>
    </div>
  );
};

export default ResetPassword;