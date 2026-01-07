import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero__background" />

      <div className="hero__container">
        <div className="hero__grid">
          {/* Left Column - Text */}
          <div>
            <h1 className="hero__title">
              Gestiona tu equipo de{' '}
              <span className="hero__title-gradient">forma inteligente</span>
            </h1>

            <p className="hero__subtitle">
              Plataforma integral de recursos humanos que simplifica la gestión 
              de asistencia, vacaciones, KPIs y más. Todo en un solo lugar.
            </p>

            <div className="hero__buttons">
              {/* BOTÓN CORREGIDO: border: 'none' */}
              <button 
                onClick={() => navigate('/login')} 
                className="hero__btn-primary"
                style={{ border: 'none', cursor: 'pointer' }}
              >
                Comenzar Ahora
                <ArrowRight size={20} />
              </button>
              
              <button 
                onClick={() => navigate('/login')} 
                className="hero__btn-secondary"
                // Si el secundario también tiene borde negro, descomenta la siguiente línea:
                // style={{ border: 'none', cursor: 'pointer' }}
              >
                Ver Demo
              </button>
            </div>

            <div className="hero__stats">
              {[
                { value: '10K+', label: 'Usuarios activos' },
                { value: '99.9%', label: 'Uptime' },
                { value: '4.9/5', label: 'Calificación' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="hero__stat-value">{stat.value}</div>
                  <div className="hero__stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Dashboard Preview */}
          <div className="hero__preview">
            <div className="hero__dashboard">
              <div className="hero__dashboard-header">
                <div className="hero__dashboard-logo">
                  <div className="hero__dashboard-icon" />
                  <div>
                    <h3 className="hero__dashboard-title">Dashboard</h3>
                    <p className="hero__dashboard-subtitle">Vista general</p>
                  </div>
                </div>
                <div className="hero__dashboard-dots">
                  <div className="hero__dashboard-dot hero__dashboard-dot--red" />
                  <div className="hero__dashboard-dot hero__dashboard-dot--yellow" />
                  <div className="hero__dashboard-dot hero__dashboard-dot--green" />
                </div>
              </div>

              <div className="hero__dashboard-stats">
                {[
                  { label: 'Empleados', value: '247', colorClass: 'hero__dashboard-stat-value--red' },
                  { label: 'Asistencia', value: '95%', colorClass: 'hero__dashboard-stat-value--green' },
                  { label: 'Vacaciones', value: '12', colorClass: 'hero__dashboard-stat-value--orange' },
                  { label: 'KPIs', value: '89%', colorClass: 'hero__dashboard-stat-value--pink' },
                ].map((item) => (
                  <div key={item.label} className="hero__dashboard-stat">
                    <p className="hero__dashboard-stat-label">{item.label}</p>
                    <p className={`hero__dashboard-stat-value ${item.colorClass}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="hero__dashboard-chart">
                {[40, 65, 45, 80, 55, 70, 85].map((height, i) => (
                  <div
                    key={i}
                    className="hero__dashboard-bar"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>

              <div className="hero__floating-card hero__floating-card--top">
                <div className="hero__floating-content">
                  <div className="hero__floating-icon hero__floating-icon--green">✓</div>
                  <div>
                    <p className="hero__floating-title">Asistencia registrada</p>
                    <p className="hero__floating-subtitle">Hace 2 minutos</p>
                  </div>
                </div>
              </div>

              <div className="hero__floating-card hero__floating-card--bottom">
                <div className="hero__floating-content">
                  <div className="hero__floating-icon hero__floating-icon--red">📊</div>
                  <div>
                    <p className="hero__floating-title">Reporte generado</p>
                    <p className="hero__floating-subtitle">Automáticamente</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero__wave">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="#f8fafc"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;