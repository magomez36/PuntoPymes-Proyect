import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  CalendarDays, 
  BarChart3, 
  Bell, 
  Shield,
  Zap
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Gestión de Empleados',
    description: 'Administra perfiles, documentos y datos de tu equipo de manera centralizada y segura.',
    iconClass: 'features__card-icon--blue',
    details: {
      descripcion: 'Administra de forma centralizada toda la información del personal de la empresa, manteniendo los datos organizados, actualizados y seguros.',
      funcionalidades: [
        'Registro, edición y baja de empleados',
        'Gestión de datos personales y laborales',  
        'Asignación de cargos, áreas y jefaturas',
        'Historial laboral del empleado',
      ],
      acciones: [
        'Crear y actualizar perfiles',
        'Consultar información del equipo',
        'Adjuntar documentos oficiales',
        'Visualizar estructura organizacional',
      ],
      beneficio: 'Reduce errores administrativos y mejora el control del talento humano desde un solo lugar.'
    }
  },
  {
    icon: Clock,
    title: 'Control de Asistencia',
    description: 'Registro automático de entradas y salidas con geolocalización y reconocimiento facial.',
    iconClass: 'features__card-icon--green',
    details: {
      descripcion: 'Permite registrar y monitorear las entradas y salidas del personal de manera automática y confiable.',
      funcionalidades: [
        'Registro de entrada y salida',
        'Control por horario y turnos',
        'Validación por geolocalización',
        'Reportes de atrasos y ausencias',
      ],
      acciones: [
        'Marcar asistencia',
        'Consultar historial personal',
        'Verificar cumplimiento de horarios',
      ],
      beneficio: 'Garantiza puntualidad, transparencia y control real del tiempo laboral.'
    }
  },
  {
    icon: CalendarDays,
    title: 'Vacaciones y Permisos',
    description: 'Solicitudes digitales, aprobaciones rápidas y calendario compartido del equipo.',
    iconClass: 'features__card-icon--orange',
    details: {
      descripcion: 'Gestiona las solicitudes de vacaciones y permisos de manera digital, eliminando procesos manuales.',
      funcionalidades: [
        'Solicitud de vacaciones y permisos',
        'Aprobación por jefes directos',
        'Cálculo automático de días disponibles',
        'Historial de solicitudes',
      ],
      acciones: [
        'Enviar solicitudes',
        'Consultar estado de aprobación',
        'Visualizar disponibilidad de días',
      ],
      beneficio: 'Agiliza los procesos internos y mejora la planificación del equipo.'
    }
  },
  {
    icon: BarChart3,
    title: 'KPIs y Rendimiento',
    description: 'Métricas en tiempo real, objetivos claros y evaluaciones de desempeño automatizadas.',
    iconClass: 'features__card-icon--purple',
    details: {
      descripcion: 'Visualiza el desempeño del personal mediante indicadores clave y métricas en tiempo real.',
      funcionalidades: [
        'Definición de objetivos individuales y grupales',
        'Evaluaciones periódicas de desempeño',
        'Gráficos e indicadores de progreso',
        'Comparativas entre periodos',
        'Reportes automáticos',
      ],
      acciones: [
        'Revisar métricas de rendimiento',
        'Evaluar desempeño',
        'Descargar reportes',
      ],
      beneficio: 'Facilita la toma de decisiones basadas en datos reales.'
    }
  },
  {
    icon: Bell,
    title: 'Notificaciones Inteligentes',
    description: 'Alertas personalizadas por email, push y en plataforma para no perderte nada.',
    iconClass: 'features__card-icon--red',
    details: {
      descripcion: 'Sistema de alertas automáticas que mantiene informado al usuario sobre eventos importantes.',
      funcionalidades: [
        'Alertas por correo electrónico',
        'Notificaciones push en la plataforma',
        'Avisos personalizados',
        'Recordatorios de eventos clave',
        'Configuración de preferencias',
      ],
      acciones: [
        'Consultar notificaciones',
        'Configurar alertas',
        'Marcar avisos como leídos',
      ],
      beneficio: 'Evita olvidos y mejora la comunicación interna.'
    }
  },
  {
    icon: Shield,
    title: 'Auditoría y Seguridad',
    description: 'Registro completo de actividades, roles granulares y cumplimiento normativo.',
    iconClass: 'features__card-icon--indigo',
    details: {
      descripcion: 'Controla y registra todas las acciones realizadas dentro del sistema para garantizar seguridad y cumplimiento normativo.',
      funcionalidades: [
        'Registro de actividades del sistema',
        'Control de roles y permisos',
        'Historial de accesos',
        'Monitoreo de acciones críticas',
        'Cumplimiento de normativas',
      ],
      acciones: [
        'Consultar logs',
        'Gestionar permisos',
        'Auditar actividades',
      ],
      beneficio: 'Aumenta la seguridad y la trazabilidad del sistema.'
    }
  },
];

const Features = () => {
  const [modalInfo, setModalInfo] = useState(null);

  // Función para abrir el modal con la info de la tarjeta
  const handleCardClick = (feature) => {
    setModalInfo(feature);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setModalInfo(null);
  };

  return (
    <section id="productos" className="features">
      <div className="features__container">
        {/* Section Header */}
        <div className="features__header">
          <div className="features__badge">
            <Zap className="features__badge-icon" size={16} />
            <span className="features__badge-text">Características</span>
          </div>
          <h2 className="features__title">
            Todo lo que necesitas para{' '}
            <span className="features__title-gradient">gestionar talento</span>
          </h2>
          <p className="features__subtitle">
            Herramientas potentes y fáciles de usar que transforman la manera 
            en que gestionas tu equipo de trabajo.
          </p>
        </div>

        {/* Features Grid */}
        <div className="features__grid">
          {features.map((feature) => (
            <div key={feature.title} className="features__card" onClick={() => handleCardClick(feature)} style={{cursor: 'pointer'}}>
              {/* Icon */}
              <div className={`features__card-icon ${feature.iconClass}`}>
                <feature.icon size={28} />
              </div>

              {/* Content */}
              <h3 className="features__card-title">{feature.title}</h3>
              <p className="features__card-description">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Modal */}
        {modalInfo && (
          <div className="features__modal-overlay" onClick={handleCloseModal}>
            <div className="features__modal-content" onClick={e => e.stopPropagation()}>
              {/* Lado izquierdo: ícono y título */}
              <div className="features__modal-iconbox">
                <div className={`features__card-icon ${modalInfo.iconClass}`} style={{marginBottom: '1rem'}}>
                  <modalInfo.icon size={48} />
                </div>
                <h2 style={{marginBottom: '0.5rem', fontSize: '1.25rem', textAlign: 'center'}}>{modalInfo.title}</h2>
              </div>
              {/* Lado derecho: detalles */}
              <div className="features__modal-details">
                <span style={{fontWeight: 'bold', fontSize: '1.05rem'}}>📌 Descripción</span>
                <p style={{margin: '0.3rem 0 0.7rem 0'}}>{modalInfo.details.descripcion}</p>

                <span style={{fontWeight: 'bold', fontSize: '1.05rem'}}>⚙️ Funcionalidades</span>
                <ul style={{margin: '0.3rem 0 0.7rem 1.2rem', padding: 0}}>
                  {modalInfo.details.funcionalidades.map((item, idx) => (
                    <li key={idx} style={{marginBottom: '0.2rem'}}>{item}</li>
                  ))}
                </ul>

                <span style={{fontWeight: 'bold', fontSize: '1.05rem'}}>👤 Acciones del usuario</span>
                <ul style={{margin: '0.3rem 0 0.7rem 1.2rem', padding: 0}}>
                  {modalInfo.details.acciones.map((item, idx) => (
                    <li key={idx} style={{marginBottom: '0.2rem'}}>{item}</li>
                  ))}
                </ul>

                <span style={{fontWeight: 'bold', fontSize: '1.05rem'}}>🎯 Beneficio</span>
                <p style={{margin: '0.3rem 0 0.7rem 0', color: '#2563eb', fontWeight: '500'}}>{modalInfo.details.beneficio}</p>
                <button className="features__modal-close" onClick={handleCloseModal}>Cerrar</button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Text */}
        <div className="features__footer">
          <p className="features__footer-text">
            Descubre cómo cada herramienta puede optimizar la gestión de tu equipo
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;