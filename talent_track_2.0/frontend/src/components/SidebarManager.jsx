import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoSmall from '../assets/img/talentrack_small.svg';
import logoLarge from '../assets/img/talenTrackLogo_SVG.svg';
import 'boxicons/css/boxicons.min.css';
import '../assets/css/sidebar.css';

const SidebarManager = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const getActiveClass = (path) => {
    // Exact match or sub-path match logic can be refined if needed
    if (currentPath.startsWith(path)) {
      return 'sidebar-item active';
    }
    return 'sidebar-item';
  };

  return (
    <aside className="sidebar" id="sidebar">
      {/* --- LOGO --- */}
      <div className="sidebar-logo">
        <img src={logoSmall} alt="Logo Pequeño" className="logo-small" />
        <img src={logoLarge} alt="Logo TalentTrack" className="logo-large" />
      </div>

      <div className="sidebar-top">
        {/* SECCIÓN RESUMEN */}
        <div className="sidebar-section-label">Resumen</div>
        <Link to="/manager/inicio" className={getActiveClass('/manager/inicio')} data-tooltip="Inicio">
          <i className='bx bxs-home sidebar-icon-box'></i>
          <span>Inicio</span>
        </Link>
        <Link to="/manager/dashboard" className={getActiveClass('/manager/dashboard')} data-tooltip="Dashboard">
          <i className='bx bxs-dashboard sidebar-icon-box'></i>
          <span>Dashboard</span>
        </Link>

        {/* SECCIÓN GESTIÓN DE EQUIPO */}
        <div className="sidebar-section-label">Gestión de Equipo</div>
        <Link to="/manager/mi-equipo/empleados" className={getActiveClass('/manager/mi-equipo')} data-tooltip="Mi Equipo">
          <i className='bx bx-group sidebar-icon-box'></i>
          <span>Mi Equipo</span>
        </Link>
        <Link to="/manager/ausencias/solicitudes" className={getActiveClass('/manager/ausencias')} data-tooltip="Aprobación de Solicitudes">
          <i className='bx bx-envelope sidebar-icon-box'></i>
          <span>Aprobación de Solicitudes</span>
        </Link>

        {/* SECCIÓN SUPERVISIÓN Y REPORTES */}
        <div className="sidebar-section-label">Supervisión y Reportes</div>
        <Link to="/manager/supervision/asistencia" className={getActiveClass('/manager/supervision/asistencia')} data-tooltip="Supervisión de Asistencia">
          <i className='bx bx-calendar-check sidebar-icon-box'></i>
          <span>Supervisión de Asistencia</span>
        </Link>
        <Link to="/manager/supervision/jornadas" className={getActiveClass('/manager/supervision/jornadas')} data-tooltip="Jornadas Calculadas">
          <i className='bx bx-time-five sidebar-icon-box'></i>
          <span>Jornadas Calculadas</span>
        </Link>
        <Link to="/manager/evaluaciones" className={getActiveClass('/manager/evaluaciones')} data-tooltip="Evaluaciones de Desempeño">
          <i className='bx bx-bar-chart-alt-2 sidebar-icon-box'></i>
          <span>Evaluaciones de Desempeño</span>
        </Link>
      </div>

      <div className="sidebar-bottom">

        <Link to="/login" className="sidebar-item logout" data-tooltip="Cerrar Sesión">
          <i className='bx bxs-door-open sidebar-icon-box'></i>
          <span>Cerrar Sesión</span>
        </Link>
      </div>
    </aside>
  );
};

export default SidebarManager;