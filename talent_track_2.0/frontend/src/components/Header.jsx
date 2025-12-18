import React, { useState } from 'react';
// Asegúrate de importar tu logo si está en la carpeta src, 
// o usa la ruta pública si está en la carpeta public.
import logo from '../assets/img/talenTrackLogo_SVG.svg'; 

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header>
      <div className="container">
        <div className="header-content">
          <div className="logo-section">
            <img src={logo} alt="Punto Pymes Logo" className="logo-main" />
          </div>

          {/* Agregamos una clase condicional si el menú está abierto */}
          <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <div className="nav-links">
              <a href="#productos">Productos</a>
              <a href="#soluciones">Soluciones</a>
              <a href="#recursos">Recursos</a>
              <a href="#soporte">Soporte</a>
            </div>
            <a href="../login" className="btn-login">Iniciar Sesion</a>
          </nav>

          <button className="menu-toggle" onClick={toggleMenu}>
            ☰
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;