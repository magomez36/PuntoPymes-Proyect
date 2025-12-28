import React from 'react';
import { Link } from 'react-router-dom'; // 1. IMPORTANTE: Agrega esta línea

const Footer = () => {
  return (
    <footer>
      {/* Contenedor principal con Grid */}
      <div className="footer-content">
        
        {/* Columna 1: Info General */}
        <div className="footer-col">
          <h3>Recursos Humanos</h3>
          <p>
            © 2025 UTPL <br />
            Departamento de Gestión del Talento
          </p>
          <p>
            "El talento humano es nuestra mayor fortaleza."
          </p>
        </div>

        {/* Columna 2: Contacto */}
        <div className="footer-col">
          <h3>Contacto</h3>
          <div className="footer-links">
            <p>
              <strong>Email:</strong> rrhh@empresa.com
            </p>
            <p>
              <strong>Tel:</strong> 0999999999
            </p>
            <p>Loja, Ecuador</p>
          </div>
        </div>

        {/* Columna 3: Enlaces */}
        <div className="footer-col">
          <h3>Enlaces Rápidos</h3>
          <ul className="footer-links">
            {/* 2. SOLUCIÓN: Usamos Link y to="/" como placeholder */}
            <li><Link to="/">Políticas de Privacidad</Link></li>
            <li><Link to="/">Manual del Empleado</Link></li>
            <li><Link to="/">Beneficios Corporativos</Link></li>
            <li><Link to="/">Soporte Técnico</Link></li>
          </ul>
        </div>

      </div>

      {/* Barra inferior de Copyright */}
      <div className="footer-bottom">
        <p>Desarrollado para la gestión eficiente de personal.</p>
      </div>
    </footer>
  );
};

export default Footer;