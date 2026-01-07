import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section id="contacto" className="cta">
      <div className="cta__container">
        <div className="cta__box">
          <div className="cta__content">
            <h2 className="cta__title">
              ¿Listo para transformar la gestión de tu equipo?
            </h2>

            <p className="cta__subtitle">
              Únete a más de 500 empresas que ya optimizaron sus procesos de recursos humanos con TalenTrack.
            </p>

            <div className="cta__buttons">
              {/* BOTÓN CORREGIDO: border: 'none' */}
              <button 
                onClick={() => navigate('/login')} 
                className="cta__btn-primary"
                style={{ border: 'none', cursor: 'pointer' }}
              >
                Solicitar servicio
                <ArrowRight size={20} />
              </button>
              
              <button 
                onClick={() => navigate('/login')} 
                className="cta__btn-secondary"
                // Descomenta si el botón secundario también tiene borde
                // style={{ border: 'none', cursor: 'pointer' }}
              >
                Agendar Demo
              </button>
            </div>

            <p className="cta__note">
              No se requiere tarjeta de crédito • Cancela cuando quieras
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;