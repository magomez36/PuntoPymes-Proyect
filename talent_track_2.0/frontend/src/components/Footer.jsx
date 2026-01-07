import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import logo from '../assets/img/talenTrackLogo_SVG.svg';

const Footer = () => {
  const navigate = useNavigate();

  const footerLinks = {
    Producto: [
      { name: 'Características', href: '#productos' },
      { name: 'Precios', href: '#precios' },
      { name: 'Integraciones', href: '#' },
      { name: 'API', href: '#' },
    ],
    Empresa: [
      { name: 'Sobre nosotros', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Carreras', href: '#' },
      { name: 'Prensa', href: '#' },
    ],
    Recursos: [
      { name: 'Documentación', href: '#' },
      { name: 'Guías', href: '#' },
      { name: 'Webinars', href: '#' },
      { name: 'Centro de ayuda', href: '#' },
    ],
    Legal: [
      { name: 'Privacidad', href: '#' },
      { name: 'Términos', href: '#' },
      { name: 'Seguridad', href: '#' },
      { name: 'Cookies', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: '#' },
    { icon: Twitter, href: '#' },
    { icon: Linkedin, href: '#' },
    { icon: Instagram, href: '#' },
  ];

  return (
    <footer className="footer">
      <div className="footer__container">
        {/* Top Section */}
        <div className="footer__grid">
          {/* Brand Column */}
          <div className="footer__brand">
            {/* Logo corregido con navigate */}
            <div 
                onClick={() => navigate('/')} 
                className="footer__logo" 
                style={{ cursor: 'pointer' }}
            >
              <img src={logo} alt="TalenTrack Logo" />
            </div>
            
            <p className="footer__description">
              Plataforma integral de recursos humanos para empresas modernas.
            </p>
            <div className="footer__contact">
              <div className="footer__contact-item">
                <Mail size={20} />
                <span>contacto@talentrack.com</span>
              </div>
              <div className="footer__contact-item">
                <Phone size={20} />
                <span>+593 999 999 999</span>
              </div>
              <div className="footer__contact-item">
                <MapPin size={20} />
                <span>Loja, Ecuador</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="footer__column-title">{title}</h3>
              <ul className="footer__links">
                {links.map((link) => (
                  <li key={link.name}>
                    <a 
                        href={link.href} 
                        className="footer__link" 
                        style={{ textDecoration: 'none' }} // Adiós subrayado
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="footer__bottom">
          {/* Copyright */}
          <p className="footer__copyright">
            © 2025 TalenTrack. Todos los derechos reservados. UTPL
          </p>

          {/* Social Links */}
          <div className="footer__social">
            {socialLinks.map((social, index) => (
              <a 
                key={index} 
                href={social.href} 
                className="footer__social-link" 
                style={{ textDecoration: 'none' }}
              >
                <social.icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;