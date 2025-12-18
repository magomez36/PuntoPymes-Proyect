import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-col">
        <h3>Recursos Humanos</h3>
        <p>© 2025 UTPL<br />Departamento de Gestión del Talento</p>
      </div>

      <div className="footer-col">
        <h3>Contacto</h3>
        <p>Email: rrhh@empresa.com<br />Tel: 0999999999</p>
      </div>

      <div className="footer-col">
        <h3>Enlaces</h3>
        <a href="#politicas">Políticas</a><br />
        <a href="#manual">Manual del Empleado</a><br />
        <a href="#beneficios">Beneficios</a>
      </div>

      <div className="footer-col">
        <h3>Mensaje</h3>
        <p>"El talento humano es nuestra mayor fortaleza."</p>
      </div>
    </footer>
  );
};

export default Footer;