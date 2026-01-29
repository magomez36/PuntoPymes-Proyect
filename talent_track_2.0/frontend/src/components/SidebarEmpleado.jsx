import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearSession } from "../services/session";

// CSS y Boxicons
import "../assets/css/sidebar.css"; 
import 'boxicons/css/boxicons.min.css';

// Imágenes
import logoIcon from "../assets/img/talentrack_small.svg"; 
import logoFull from "../assets/img/talenTrackLogo_SVG.svg"; 

const SidebarEmpleado = () => {
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
        
        {/* GRUPO 1: PRINCIPAL */}
        <Link to="/empleado/inicio" className={`sidebar-item ${isActive("/empleado/inicio")}`}>
          <div className="sidebar-icon-box"><i className='bx bxs-home'></i></div>
          <span>Inicio</span>
        </Link>

        <Link to="/empleado/asistencia" className={`sidebar-item ${isActive("/empleado/asistencia")}`}>
          <div className="sidebar-icon-box"><i className='bx bxs-watch'></i></div>
          <span>Mi Asistencia</span>
        </Link>

        {/* GRUPO 2: GESTIÓN DE TIEMPO */}
        <div className="sidebar-section-label">Mi Tiempo</div>
        
        <Link to="/empleado/jornadas" className={`sidebar-item ${isActive("/empleado/jornadas")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-history'></i></div>
          <span>Historial Jornadas</span>
        </Link>

        <Link to="/empleado/ausencias" className={`sidebar-item ${isActive("/empleado/ausencias")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-calendar-edit'></i></div>
          <span>Permisos / Ausencias</span>
        </Link>

        {/* GRUPO 3: MI CUENTA */}
        <div className="sidebar-section-label">Mi Cuenta</div>

        <Link to="/empleado/desempeno-kpis" className={`sidebar-item ${isActive("/empleado/desempeno-kpis")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-line-chart'></i></div>
          <span>Mis KPIs</span>
        </Link>

        <Link to="/empleado/notificaciones" className={`sidebar-item ${isActive("/empleado/notificaciones")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-bell'></i></div>
          <span>Notificaciones</span>
        </Link>

        <Link to="/empleado/mi-perfil" className={`sidebar-item ${isActive("/empleado/mi-perfil")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-user-circle'></i></div>
          <span>Mi Perfil</span>
        </Link>

        {/* GRUPO 4: AYUDA */}
        <div className="sidebar-section-label">Ayuda</div>

        <Link to="/empleado/soporte" className={`sidebar-item ${isActive("/empleado/soporte")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-support'></i></div>
          <span>Soporte RRHH</span>
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

export default SidebarEmpleado;