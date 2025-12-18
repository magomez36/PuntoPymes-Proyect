import React from 'react';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Simplifica la gestión de tu equipo</h1>
            <p className="hero-subtitle">
              Nuestra plataforma integral de recursos humanos te ayuda a gestionar todo,
              desde la contratación hasta la nómina, de manera eficiente y centralizada.
            </p>
            <div className="hero-buttons">
              {/* Botones adicionales irían aquí */}
            </div>
          </div>

          <div className="hero-image">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbVr2fFC0zxt6Ptr9J7eo2YKk-vZJzBPYSADyzX5vL83-7z4Z3dHcv9DGg-vuOV4oiDiRcbVrct022zhtsaG3iovFrZ4w0C61JMOP1QEwxc1C399OYN4jHHbJjpY5ViIsdMTmxr9UCiJQi9qrJJ5iAUPGCcJcaQaaJBmHvsMxhV-fuukQrOsM9jm9yEvRZ-fl-kPmLnmOqjyleEoLEFxQHkdk8bt_03Kz0YAv6g1RnbTjonPnOYhPg3N_FhPZn9GCps8eHBoebLn8" 
              alt="Equipo colaborando en oficina moderna" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;