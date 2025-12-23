import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// Ajusta la ruta de tus imágenes según tu estructura de carpetas
import logoSmall from '../assets/img/talentrack_small.svg';
import logoLarge from '../assets/img/talenTrackLogo_SVG.svg';
import 'boxicons/css/boxicons.min.css';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Lógica para resaltar el botón activo
  const getActiveClass = (path) => {
    
    // CASO EMPRESAS: Se mantiene activo en sub-rutas (crear, editar, ver)
    if (path === '/admin/empresas') {
      if (
        currentPath === '/admin/empresas' || 
        currentPath.includes('/admin/empresas/crear-empresa') ||
        currentPath.includes('/admin/empresas/editar-empresa') ||
        currentPath.includes('/admin/empresas/ver-empresa')
      ) {
        return 'sidebar-item active';
      }
    }

    // CASO GENERAL: Coincidencia exacta
    if (currentPath === path) {
      return 'sidebar-item active';
    }

    return 'sidebar-item';
  };

  return (
    <aside className="sidebar" id="sidebar">
      {/* Logo del sidebar */}
      <div className="sidebar-logo">
        <img src={logoSmall} alt="Logo Pequeño" className="logo-small" />
        <img src={logoLarge} alt="Logo TalentTrack" className="logo-large" />
      </div>

      <div className="sidebar-top">
        
        {/* --- SECCIÓN RESUMEN --- */}
        <div className="sidebar-section-label" style={{ color: '#868988' }}>Resumen</div>
        
        <Link to="/admin/inicio" className={getActiveClass('/admin/inicio')} data-tooltip="Inicio">
          <i className='bx bxs-home sidebar-icon-box' style={{ color: '#ec1313' }}></i>
          <span>Inicio</span>
        </Link>
        
        <Link to="/admin/dashboard" className={getActiveClass('/admin/dashboard')} data-tooltip="Dashboard">
          <i className='bx bxs-dashboard sidebar-icon-box' style={{ color: '#ec1313' }}></i>
          <span>Dashboard</span>
        </Link>

        {/* --- SECCIÓN GESTIÓN EMPRESAS --- */}
        <div className="sidebar-section-label" style={{ color: '#868988' }}>Gestión Empresas</div>
        
        <Link to="/admin/empresas" className={getActiveClass('/admin/empresas')} data-tooltip="Empresas">
          <i className='bx bx-buildings sidebar-icon-box' style={{ color: '#ec1313' }}></i>
          <span>Empresas</span>
        </Link>

        {/* Items sin ruta definida aún (se quedan como divs o Links vacíos) */}
        <div className="sidebar-item" data-tooltip="Unidades Organizacionales">
          <i className='bx bx-sitemap sidebar-icon-box' style={{ color: '#ec1313' }}></i>
          <span>Unidades Organizacionales</span>
        </div>
        <div className="sidebar-item" data-tooltip="Puestos">
          <i className='bx bxs-briefcase sidebar-icon-box' style={{ color: '#ec1313' }}></i>
          <span>Puestos</span>
        </div>
        <div className="sidebar-item" data-tooltip="Turnos">
          <i className='bx bxs-clock sidebar-icon-box' style={{ color: '#ec1313' }}></i>
          <span>Turnos</span>
        </div>
        <div className="sidebar-item" data-tooltip="Reglas de Asistencia">
          <i className='bx bxs-check-square sidebar-icon-box' style={{ color: '#ec1313' }}></i>
          <span>Reglas de Asistencia</span>
        </div>
        <div className="sidebar-item" data-tooltip="Tipos de Ausencias">
          <i className='bx bx-calendar-x sidebar-icon-box' style={{ color: '#ec1313' }}></i>
          <span>Tipos de Ausencias</span>
        </div>

        {/* --- SECCIÓN RENDIMIENTO Y DATOS --- */}
        <div className="sidebar-section-label" style={{ color: '#868988' }}>Rendimiento y Datos</div>
        <div className="sidebar-item" data-tooltip="KPIs">
          <i className='bx bx-trending-up sidebar-icon-box' style={{ color: '#ec1313' }}></i>
          <span>KPIs</span>
        </div>
        <div className="sidebar-item" data-tooltip="Plantillas KPIs">
          <i className='bx bx-layout sidebar-icon-box' style={{ color: '#ec1313' }}></i>
          <span>Plantillas KPIs</span>
        </div>
        <div className="sidebar-item" data-tooltip="Integraciones ERP">
          <i className='bx bxs-plug-connect sidebar-icon-box' style={{ color: '#ec1313' }}></i>
          <span>Integraciones ERP</span>
        </div>
        <div className="sidebar-item" data-tooltip="Reportes Programados">
          <i className='bx bx-file sidebar-icon-box' style={{ color: '#ec1313' }}></i>
          <span>Reportes Programados</span>
        </div>

        {/* --- SECCIÓN ADMINISTRACIÓN --- */}
        <div className="sidebar-section-label" style={{ color: '#868988' }}>Administración</div>
        <div className="sidebar-item" data-tooltip="Usuarios">
          <i className='bx bx-group sidebar-icon-box' style={{ color: '#ec1313' }}></i>
          <span>Usuarios</span>
        </div>
        <div className="sidebar-item" data-tooltip="Roles">
          <i className='bx bxs-community sidebar-icon-box' style={{ color: '#ec1313' }}></i>
          <span>Roles</span>
        </div>
        <div className="sidebar-item" data-tooltip="Permisos">
          <i className='bx bxs-calendar-check sidebar-icon-box' style={{ color: '#ec1313' }}></i>
          <span>Permisos</span>
        </div>
        <div className="sidebar-item" data-tooltip="Usuarios con Roles">
          {/* Nota: En tu HTML tenías 'bxr', eso suele ser error, lo corregí a 'bx' */}
          <i className='bx bxs-community sidebar-icon-box' style={{ color: '#ec1313' }}></i>
          <span>Usuarios con Roles</span>
        </div>
        <div className="sidebar-item" data-tooltip="Webhooks">
          <i className='bx bx-code-alt sidebar-icon-box' style={{ color: '#ec1313' }}></i>
          <span>Webhooks</span>
        </div>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-item" data-tooltip="Ayuda">
          <i className='bx bx-help-circle sidebar-icon-box' style={{ color: '#495057' }}></i>
          <span>Ayuda</span>
        </div>
        <div className="sidebar-item" data-tooltip="Perfil">
          <i className='bx bxs-user sidebar-icon-box' style={{ color: '#495057' }}></i>
          <span>Perfil</span>
        </div>
        
        {/* Enlace para cerrar sesión */}
        <Link to="/login" className="sidebar-item logout" data-tooltip="Cerrar Sesión">
          <i className='bx bxs-door-open sidebar-icon-box' style={{ color: '#ec1313' }}></i>
          <span>Cerrar Sesión</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;