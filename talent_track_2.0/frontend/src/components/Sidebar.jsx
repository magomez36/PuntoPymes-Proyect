import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoSmall from '../assets/img/talentrack_small.svg';
import logoLarge from '../assets/img/talenTrackLogo_SVG.svg';
import 'boxicons/css/boxicons.min.css';
import '../assets/css/sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Función para detectar si el link está activo (incluyendo sub-rutas)
  const getActiveClass = (path) => {
    // Si la ruta base coincide con el inicio de la ruta actual, se marca activo
    // Ejemplo: path="/admin/puestos" coincidirá con "/admin/puestos/crear"
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
        
        <Link to="/superadmin/inicio" className={getActiveClass('/superadmin/inicio')} data-tooltip="Inicio">
          <i className='bx bxs-home sidebar-icon-box'></i>
          <span>Inicio</span>
        </Link>
        
        {/* Nota: En tu App.js no vi una ruta explicita para /admin/dashboard, 
            así que dejo esta apuntando a inicio o la que prefieras */}
        <Link to="/superadmin/inicio" className={currentPath === '/admin/dashboard' ? 'sidebar-item active' : 'sidebar-item'} data-tooltip="Dashboard">
          <i className='bx bxs-dashboard sidebar-icon-box'></i>
          <span>Dashboard</span>
        </Link>

        {/* SECCIÓN GESTIÓN EMPRESAS */}
        <div className="sidebar-section-label">Gestión Empresas</div>
        
        <Link to="/admin/empresas" className={getActiveClass('/admin/empresas')} data-tooltip="Empresas">
          <i className='bx bx-buildings sidebar-icon-box'></i>
          <span>Empresas</span>
        </Link>

        <Link to="/admin/unidades-organizacionales" className={getActiveClass('/admin/unidades-organizacionales')} data-tooltip="Unidades Org.">
          <i className='bx bx-sitemap sidebar-icon-box'></i>
          <span>Unidades Org.</span>
        </Link>

        <Link to="/admin/puestos" className={getActiveClass('/admin/puestos')} data-tooltip="Puestos">
          <i className='bx bxs-briefcase sidebar-icon-box'></i>
          <span>Puestos</span>
        </Link>
        
        <Link to="/admin/turnos" className={getActiveClass('/admin/turnos')} data-tooltip="Turnos">
          <i className='bx bxs-time sidebar-icon-box'></i>
          <span>Turnos</span>
        </Link>
        
        <Link to="/admin/reglas-asistencia" className={getActiveClass('/admin/reglas-asistencia')} data-tooltip="Reglas Asistencia">
          <i className='bx bxs-check-square sidebar-icon-box'></i>
          <span>Reglas Asistencia</span>
        </Link>

        <Link to="/admin/tipos-ausencias" className={getActiveClass('/admin/tipos-ausencias')} data-tooltip="Tipos Ausencias">
          <i className='bx bx-calendar-x sidebar-icon-box'></i>
          <span>Tipos Ausencias</span>
        </Link>

        <Link to="/admin/empleados" className={getActiveClass('/admin/empleados')} data-tooltip="Empleados">
           <i className='bx bx-id-card sidebar-icon-box'></i>
           <span>Empleados</span>
        </Link>

        {/* SECCIÓN RENDIMIENTO */}
        <div className="sidebar-section-label">Rendimiento</div>
        
        <Link to="/admin/kpis" className={getActiveClass('/admin/kpis')} data-tooltip="KPIs">
          <i className='bx bx-trending-up sidebar-icon-box'></i>
          <span>KPIs</span>
        </Link>

        <Link to="/admin/plantillas-kpi" className={getActiveClass('/admin/plantillas-kpi')} data-tooltip="Plantillas KPIs">
          <i className='bx bx-layout sidebar-icon-box'></i>
          <span>Plantillas KPIs</span>
        </Link>

        {/* Placeholder: No vi ruta en App.js para Integraciones */}
        <div className="sidebar-item" data-tooltip="Integraciones ERP (Próximamente)">
          <i className='bx bxs-plug sidebar-icon-box'></i>
          <span>Integraciones ERP</span>
        </div>

        <Link to="/admin/reportes-programados" className={getActiveClass('/admin/reportes-programados')} data-tooltip="Reportes">
          <i className='bx bx-file sidebar-icon-box'></i>
          <span>Reportes</span>
        </Link>

        {/* SECCIÓN ADMINISTRACIÓN */}
        <div className="sidebar-section-label">Seguridad</div>
        
        <Link to="/admin/usuarios" className={getActiveClass('/admin/usuarios')} data-tooltip="Usuarios">
          <i className='bx bx-group sidebar-icon-box'></i>
          <span>Usuarios</span>
        </Link>
        
        <Link to="/admin/roles" className={getActiveClass('/admin/roles')} data-tooltip="Roles">
          <i className='bx bxs-user-badge sidebar-icon-box'></i>
          <span>Roles</span>
        </Link>
        
        <Link to="/admin/permisos" className={getActiveClass('/admin/permisos')} data-tooltip="Permisos">
          <i className='bx bxs-calendar-check sidebar-icon-box'></i>
          <span>Permisos</span>
        </Link>

        {/* Placeholder: No vi ruta en App.js para Webhooks */}
        <div className="sidebar-item" data-tooltip="Webhooks (Próximamente)">
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