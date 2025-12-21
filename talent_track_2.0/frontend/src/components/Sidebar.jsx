import React from 'react';
import { Link } from 'react-router-dom';
// Asegúrate de ajustar las rutas de tus imágenes
import logoSmall from '../assets/img/talentrack_small.svg';
import logoLarge from '../assets/img/talenTrackLogo_SVG.svg';

const Sidebar = () => {
  return (
    <aside className="sidebar" id="sidebar">
      {/* Logo del sidebar */}
      <div className="sidebar-logo">
        <img src={logoSmall} alt="Logo Pequeño" className="logo-small" />
        <img src={logoLarge} alt="Logo TalentTrack" className="logo-large" />
      </div>

      <div className="sidebar-top">
        {/* Resumen */}
        <div className="sidebar-section-label" style={{ color: '#868988' }}>Resumen</div>
        
        {/* Usamos Link en lugar de onclick */}
        <Link to="/admin/dashboard" className="sidebar-item active" data-tooltip="Inicio">
          <i className='bx bxs-home sidebar-icon-box' style={{ color: '#ec1313' }}></i>
          <span>Inicio</span>
        </Link>
        
        <Link to="/admin/dashboard" className="sidebar-item" data-tooltip="Dashboard">
          <i className='bx bxs-dashboard sidebar-icon-box' style={{ color: '#ec1313' }}></i>
          <span>Dashboard</span>
        </Link>

        {/* Gestión Empresas */}
        <div className="sidebar-section-label" style={{ color: '#868988' }}>Gestión Empresas</div>
        
        <Link to="/admin/empresas" className="sidebar-item" data-tooltip="Empresas">
          <i className='bx bx-buildings sidebar-icon-box' style={{ color: '#ec1313' }}></i>
          <span>Empresas</span>
        </Link>

        {/* Nota: Dejaré los demás items como divs por ahora, pero deberías cambiarlos a <Link> cuando crees esas páginas */}
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

        {/* Rendimiento y Datos */}
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

        {/* Administración */}
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
          <i className='bx bxs-user-detail sidebar-icon-box' style={{ color: '#ec1313' }}></i>
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
        {/* El logout suele llevar al login */}
        <Link to="/login" className="sidebar-item logout" data-tooltip="Cerrar Sesión">
          <i className='bx bxs-door-open sidebar-icon-box' style={{ color: '#ec1313' }}></i>
          <span>Cerrar Sesión</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;