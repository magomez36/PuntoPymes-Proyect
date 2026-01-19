import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearSession } from "../services/session";

// CSS y Boxicons
import "../assets/css/sidebar.css"; 
import 'boxicons/css/boxicons.min.css';

// Imágenes
import logoIcon from "../assets/img/talentrack_small.svg"; 
import logoFull from "../assets/img/talenTrackLogo_SVG.svg"; 

const SidebarSuperAdmin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  const isActive = (path) => {
    return currentPath.startsWith(path) ? "active" : "";
  };

  return (
    <aside className="sidebar">
      
      {/* --- LOGO --- */}
      <div className="sidebar-logo" style={{ padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            <img 
                src={logoIcon} 
                alt="Icono" 
                className="logo-small"
                style={{ maxHeight: '40px', width: 'auto' }} 
            />
            <img 
                src={logoFull} 
                alt="Logo" 
                className="logo-large"
                style={{ maxHeight: '50px', maxWidth: '180px', width: 'auto' }} 
            />
        </div>
      </div>

      {/* --- MENÚ --- */}
      <div className="sidebar-top">
        
        {/* GRUPO 1: RESUMEN */}
        {/* Nota: Si quieres línea arriba de Inicio, agrega un div vacío con la clase sidebar-section-label aquí, si no, déjalo así */}
        
        <Link to="/superadmin/inicio" className={`sidebar-item ${isActive("/superadmin/inicio")}`}>
          <div className="sidebar-icon-box"><i className='bx bxs-home'></i></div>
          <span>Inicio</span>
        </Link>
        
        <Link to="/admin/dashboard" className={`sidebar-item ${isActive("/admin/dashboard")}`}>
          <div className="sidebar-icon-box"><i className='bx bxs-dashboard'></i></div>
          <span>Dashboard</span>
        </Link>

        {/* GRUPO 2: GESTIÓN EMPRESAS */}
        {/* El CSS transformará esto en una línea cuando el sidebar esté cerrado */}
        <div className="sidebar-section-label">Gestión Empresas</div>
        
        <Link to="/admin/empresas" className={`sidebar-item ${isActive("/admin/empresas")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-buildings'></i></div>
          <span>Empresas</span>
        </Link>

        <Link to="/admin/unidades-organizacionales" className={`sidebar-item ${isActive("/admin/unidades-organizacionales")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-sitemap'></i></div>
          <span>Unidades Org.</span>
        </Link>
        
        <Link to="/admin/puestos" className={`sidebar-item ${isActive("/admin/puestos")}`}>
          <div className="sidebar-icon-box"><i className='bx bxs-briefcase'></i></div>
          <span>Puestos</span>
        </Link>

        <Link to="/admin/turnos" className={`sidebar-item ${isActive("/admin/turnos")}`}>
          <div className="sidebar-icon-box"><i className='bx bxs-time'></i></div>
          <span>Turnos</span>
        </Link>

        <Link to="/admin/reglas-asistencia" className={`sidebar-item ${isActive("/admin/reglas-asistencia")}`}>
          <div className="sidebar-icon-box"><i className='bx bxs-check-square'></i></div>
          <span>Reglas Asistencia</span>
        </Link>
        
        <Link to="/admin/tipos-ausencias" className={`sidebar-item ${isActive("/admin/tipos-ausencias")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-calendar-x'></i></div>
          <span>Tipos Ausencias</span>
        </Link>

        <Link to="/admin/empleados" className={`sidebar-item ${isActive("/admin/empleados")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-id-card'></i></div>
          <span>Empleados</span>
        </Link>

        {/* GRUPO 3: RENDIMIENTO */}
        <div className="sidebar-section-label">Rendimiento</div>

        <Link to="/admin/kpis" className={`sidebar-item ${isActive("/admin/kpis")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-trending-up'></i></div>
          <span>KPIs</span>
        </Link>

        <Link to="/admin/plantillas-kpi" className={`sidebar-item ${isActive("/admin/plantillas-kpi")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-layout'></i></div>
          <span>Plantillas KPIs</span>
        </Link>
        
        <div className="sidebar-item" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
          <div className="sidebar-icon-box"><i className='bx bxs-plug'></i></div>
          <span>Integraciones ERP</span>
        </div>

        <Link to="/admin/reportes-programados" className={`sidebar-item ${isActive("/admin/reportes-programados")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-file'></i></div>
          <span>Reportes</span>
        </Link>

        {/* GRUPO 4: SEGURIDAD */}
        <div className="sidebar-section-label">Seguridad</div>

        <Link to="/admin/usuarios" className={`sidebar-item ${isActive("/admin/usuarios")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-group'></i></div>
          <span>Usuarios</span>
        </Link>

        <Link to="/admin/roles" className={`sidebar-item ${isActive("/admin/roles")}`}>
          <div className="sidebar-icon-box"><i className='bx bxs-user-badge'></i></div>
          <span>Roles</span>
        </Link>
        
        <Link to="/admin/permisos" className={`sidebar-item ${isActive("/admin/permisos")}`}>
          <div className="sidebar-icon-box"><i className='bx bxs-calendar-check'></i></div>
          <span>Permisos</span>
        </Link>

         <div className="sidebar-item" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
          <div className="sidebar-icon-box"><i className='bx bx-code-alt'></i></div>
          <span>Webhooks</span>
        </div>

      </div>

      {/* --- FOOTER --- */}
      <div className="sidebar-bottom" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>
        
        <button 
            onClick={handleLogout} 
            className="sidebar-item logout" 
            style={{ width:'100%', border:'none', background:'transparent', padding:'10px 12px' }}
        >
          <div className="sidebar-icon-box"><i className='bx bxs-door-open' style={{ color: '#d51e37' }}></i></div>
          <span>Cerrar Sesión</span>
        </button>
      </div>

    </aside>
  );
};

export default SidebarSuperAdmin;