import React from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/home.css';

const Home = () => {
  return (
    <main className="hero-section">
      <div className="hero-content">
        <div className="hero-text-wrapper">
          <h1 className="hero-title">Simplifica la gestión de tu equipo</h1>
          <p className="hero-text">
            Nuestra plataforma integral de recursos humanos te ayuda a gestionar todo, 
            desde la contratación hasta la nómina, de manera eficiente y centralizada.
          </p>
          <Link to="/login" className="btn-primary">Empezar Ahora</Link>
        </div>

      <div className="hero-image-container">
        <img 
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
          alt="Equipo trabajando" 
          className="hero-img"
        />
      </div>
      </div>
    </main>
  );
};

export default Home;