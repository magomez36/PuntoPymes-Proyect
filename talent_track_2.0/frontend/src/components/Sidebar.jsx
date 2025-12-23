import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoSmall from '../assets/img/talentrack_small.svg';
import logoLarge from '../assets/img/talenTrackLogo_SVG.svg';
import 'boxicons/css/boxicons.min.css';
import '../assets/css/sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const getActiveClass = (path) => {
    // Lógica para EMPRESAS (se mantiene activo en crear/editar/ver)
    if (path === '/admin/empresas') {
      if (currentPath.includes('/admin/empresas')) {
        return 'sidebar-item active';
      }
    }
    // Lógica general
    if (currentPath === path) {
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
        
        <Link to="/admin/inicio" className={getActiveClass('/admin/inicio')} data-tooltip="Inicio">
          <i className='bx bxs-home sidebar-icon-box'></i>
          <span>Inicio</span>
        </Link>
        
        <Link to="/admin/dashboard" className={getActiveClass('/admin/dashboard')} data-tooltip="Dashboard">
          <i className='bx bxs-dashboard sidebar-icon-box'></i>
          <span>Dashboard</span>
        </Link>

        {/* SECCIÓN GESTIÓN EMPRESAS */}
        <div className="sidebar-section-label">Gestión Empresas</div>
        
        <Link to="/admin/empresas" className={getActiveClass('/admin/empresas')} data-tooltip="Empresas">
          <i className='bx bx-buildings sidebar-icon-box'></i>
          <span>Empresas</span>
        </Link>

        {/* Items Placeholder */}
        <div className="sidebar-item" data-tooltip="Unidades Org.">
          <i className='bx bx-sitemap sidebar-icon-box'></i>
          <span>Unidades Organizacionales</span>
        </div>
        <div className="sidebar-item" data-tooltip="Puestos">
          <i className='bx bxs-briefcase sidebar-icon-box'></i>
          <span>Puestos</span>
        </div>
        
        {/* --- CORRECCIÓN TURNOS: 'bxs-clock' no existe, usamos 'bxs-time' --- */}
        <div className="sidebar-item" data-tooltip="Turnos">
          <i className='bx bxs-time sidebar-icon-box'></i>
          <span>Turnos</span>
        </div>
        
        <div className="sidebar-item" data-tooltip="Reglas Asistencia">
          <i className='bx bxs-check-square sidebar-icon-box'></i>
          <span>Reglas de Asistencia</span>
        </div>
        <div className="sidebar-item" data-tooltip="Tipos Ausencias">
          <i className='bx bx-calendar-x sidebar-icon-box'></i>
          <span>Tipos de Ausencias</span>
        </div>

        {/* SECCIÓN RENDIMIENTO */}
        <div className="sidebar-section-label">Rendimiento</div>
        
        <div className="sidebar-item" data-tooltip="KPIs">
          <i className='bx bx-trending-up sidebar-icon-box'></i>
          <span>KPIs</span>
        </div>
        <div className="sidebar-item" data-tooltip="Plantillas KPIs">
          <i className='bx bx-layout sidebar-icon-box'></i>
          <span>Plantillas KPIs</span>
        </div>
        <div className="sidebar-item" data-tooltip="Integraciones ERP">
          <i className='bx bxs-plug sidebar-icon-box'></i>
          <span>Integraciones ERP</span>
        </div>
        <div className="sidebar-item" data-tooltip="Reportes">
          <i className='bx bx-file sidebar-icon-box'></i>
          <span>Reportes Programados</span>
        </div>

        {/* SECCIÓN ADMINISTRACIÓN */}
        <div className="sidebar-section-label">Administración</div>
        
        <div className="sidebar-item" data-tooltip="Usuarios">
          <i className='bx bx-group sidebar-icon-box'></i>
          <span>Usuarios</span>
        </div>
        
        {/* --- CORRECCIÓN ROLES: Usamos 'bxs-user-badge' que es más seguro --- */}
        <div className="sidebar-item" data-tooltip="Roles">
          <i className='bx bxs-user-badge sidebar-icon-box'></i>
          <span>Roles</span>
        </div>
        
        <div className="sidebar-item" data-tooltip="Permisos">
          <i className='bx bxs-calendar-check sidebar-icon-box'></i>
          <span>Permisos</span>
        </div>
        <div className="sidebar-item" data-tooltip="Usuarios con Roles">
          <i className='bx bxs-user-detail sidebar-icon-box'></i>
          <span>Usuarios con Roles</span>
        </div>
        <div className="sidebar-item" data-tooltip="Webhooks">
          <i className='bx bx-code-alt sidebar-icon-box'></i>
          <span>Webhooks</span>
        </div>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-item" data-tooltip="Ayuda">
          <i className='bx bx-help-circle sidebar-icon-box'></i>
          <span>Ayuda</span>
        </div>
        <div className="sidebar-item" data-tooltip="Perfil">
          <i className='bx bxs-user sidebar-icon-box'></i>
          <span>Perfil</span>
        </div>
        
        <Link to="/login" className="sidebar-item logout" data-tooltip="Cerrar Sesión">
          <i className='bx bxs-door-open sidebar-icon-box'></i>
          <span>Cerrar Sesión</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;