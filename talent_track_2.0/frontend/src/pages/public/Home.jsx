import React from 'react';
import '../../assets/css/styles.css'; // Asegúrate de importar tus estilos si no están globales

const Home = () => {
  return (
    <div className="layout">
      <main className="main-content">
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              
              {/* Texto del Hero */}
              <div className="hero-text">
                <h1 className="hero-title">Simplifica la gestión de tu equipo</h1>
                <p className="hero-subtitle">
                  Nuestra plataforma integral de recursos humanos te ayuda a gestionar todo,
                  desde la contratación hasta la nómina, de manera eficiente y centralizada.
                </p>
                <div className="hero-buttons">
                  {/* Aquí irían tus botones de acción si decides agregarlos */}
                </div>
              </div>

              {/* Imagen del Hero */}
              <div className="hero-image">
                {/* NOTA: En React las etiquetas img siempre deben cerrarse con "/>" */}
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbVr2fFC0zxt6Ptr9J7eo2YKk-vZJzBPYSADyzX5vL83-7z4Z3dHcv9DGg-vuOV4oiDiRcbVrct022zhtsaG3iovFrZ4w0C61JMOP1QEwxc1C399OYN4jHHbJjpY5ViIsdMTmxr9UCiJQi9qrJJ5iAUPGCcJcaQaaJBmHvsMxhV-fuukQrOsM9jm9yEvRZ-fl-kPmLnmOqjyleEoLEFxQHkdk8bt_03Kz0YAv6g1RnbTjonPnOYhPg3N_FhPZn9GCps8eHBoebLn8" 
                  alt="Equipo colaborando en oficina moderna" 
                />
              </div>

            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;