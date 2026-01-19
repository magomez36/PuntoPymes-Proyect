import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearSession } from "../services/session";

import "../assets/css/sidebar.css"; 
import 'boxicons/css/boxicons.min.css';

import logoIcon from "../assets/img/talentrack_small.svg";
import logoFull from "../assets/img/talenTrackLogo_SVG.svg";

const SidebarRRHH = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  const isActive = (path) => location.pathname.startsWith(path) ? "active" : "";

  return (
    <aside className="sidebar">
      
      {/* --- LOGO --- */}
      <div className="sidebar-logo" style={{ padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            <img 
                src={logoIcon} 
                alt="Icono Empresa" 
                className="logo-small"
                style={{ maxHeight: '40px', width: 'auto' }} 
            />
            <img 
                src={logoFull} 
                alt="Logo Empresa" 
                className="logo-large"
                style={{ maxHeight: '50px', maxWidth: '180px', width: 'auto' }} 
            />
        </div>
      </div>

      {/* --- MENU --- */}
      <div className="sidebar-top">
        
        {/* INICIO */}
        <Link to="/rrhh/inicio" className={`sidebar-item ${isActive("/rrhh/inicio")}`}>
          <div className="sidebar-icon-box"><i className='bx bxs-home'></i></div>
          <span>Inicio</span>
        </Link>

        <Link to="/rrhh/dashboard" className={`sidebar-item ${isActive("/rrhh/dashboard")}`}>
          <div className="sidebar-icon-box"><i className='bx bxs-dashboard'></i></div>
          <span>Dashboard</span>
        </Link>

        {/* SECCIÓN: ORGANIZACIÓN */}
        <div className="sidebar-section-label">Organización</div>
        
        <Link to="/rrhh/unidades-organizacionales" className={`sidebar-item ${isActive("/rrhh/unidades-organizacionales")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-sitemap'></i></div>
          <span>Unidades Org.</span>
        </Link>
        
        <Link to="/rrhh/puestos" className={`sidebar-item ${isActive("/rrhh/puestos")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-briefcase'></i></div>
          <span>Puestos</span>
        </Link>

        {/* SECCIÓN: TALENTO */}
        <div className="sidebar-section-label">Gestión de Talento</div>

        <Link to="/rrhh/empleados" className={`sidebar-item ${isActive("/rrhh/empleados")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-user-pin'></i></div>
          <span>Empleados</span>
        </Link>

        <Link to="/rrhh/contratos" className={`sidebar-item ${isActive("/rrhh/contratos")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-file'></i></div>
          <span>Contratos</span>
        </Link>

        {/* SECCIÓN: TIEMPO */}
        <div className="sidebar-section-label">Tiempo y Asistencia</div>

        <Link to="/rrhh/turnos" className={`sidebar-item ${isActive("/rrhh/turnos")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-time-five'></i></div>
          <span>Turnos</span>
        </Link>

        <Link to="/rrhh/ausencias/solicitudes" className={`sidebar-item ${isActive("/rrhh/ausencias/solicitudes")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-envelope'></i></div>
          <span>Solicitudes</span>
        </Link>

        <Link to="/rrhh/ausencias/aprobaciones" className={`sidebar-item ${isActive("/rrhh/ausencias/aprobaciones")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-check-circle'></i></div>
          <span>Aprobaciones</span>
        </Link>
        
        <Link to="/rrhh/vacaciones/saldos" className={`sidebar-item ${isActive("/rrhh/vacaciones/saldos")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-sun'></i></div>
          <span>Saldos Vacaciones</span>
        </Link>

        <Link to="/rrhh/jornadas-calculadas" className={`sidebar-item ${isActive("/rrhh/jornadas-calculadas")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-calendar-check'></i></div>
          <span>Jornadas</span>
        </Link>

        {/* SECCIÓN: DESEMPEÑO */}
        <div className="sidebar-section-label">Evaluaciones</div>

        <Link to="/rrhh/kpis" className={`sidebar-item ${isActive("/rrhh/kpis")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-list-ul'></i></div>
          <span>Catálogo KPIs</span>
        </Link>

        <Link to="/rrhh/kpi/asignaciones" className={`sidebar-item ${isActive("/rrhh/kpi/asignaciones")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-target-lock'></i></div>
          <span>Asignar KPIs</span>
        </Link>

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

export default SidebarRRHH;