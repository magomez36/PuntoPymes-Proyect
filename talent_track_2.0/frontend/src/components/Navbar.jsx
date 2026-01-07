import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../assets/img/talenTrackLogo_SVG.svg'; 

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Función para scroll suave
  const scrollToSection = (e, href) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Características', href: '#productos' },
    { name: 'Contacto', href: '#contacto' },
  ];

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar__container">
        <div className="navbar__content">
          {/* Logo */}
          <div 
            onClick={() => navigate('/')} 
            className="navbar__logo" 
            style={{ cursor: 'pointer' }}
          >
            <img src={logo} alt="TalenTrack Logo" />
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="navbar__nav">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="navbar__link"
                  onClick={(e) => scrollToSection(e, link.href)}
                  style={{ textDecoration: 'none' }}
                >
                  {link.name}
                </a>
              ))}
            </nav>
          )}

          {/* CTA Button - Desktop */}
          {!isMobile && (
            <div className="navbar__actions">
              {/* BOTÓN CORREGIDO: border: 'none' */}
              <button 
                onClick={() => navigate('/login')} 
                className="navbar__cta"
                style={{ border: 'none', cursor: 'pointer' }}
              >
                Iniciar Sesión
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="navbar__mobile-btn"
              style={{ border: 'none', background: 'transparent' }} // También quitamos borde al icono del menú por si acaso
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobile && isMobileMenuOpen && (
        <div className="navbar__mobile-menu open">
          <div className="navbar__mobile-content">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="navbar__mobile-link"
                onClick={(e) => scrollToSection(e, link.href)}
                style={{ textDecoration: 'none' }}
              >
                {link.name}
              </a>
            ))}
            <hr className="navbar__mobile-divider" />
            
            {/* BOTÓN MÓVIL CORREGIDO: border: 'none' */}
            <button 
                onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                }} 
                className="navbar__mobile-cta"
                style={{ border: 'none', cursor: 'pointer' }}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;