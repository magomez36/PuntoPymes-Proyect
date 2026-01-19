import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearSession } from "../services/session"; // Ajusta la ruta si es necesario

// CSS y Boxicons (Mismos estilos que SuperAdmin)
import "../assets/css/sidebar.css"; 
import 'boxicons/css/boxicons.min.css';

// Imágenes (Mismos logos)
import logoIcon from "../assets/img/talentrack_small.svg"; 
import logoFull from "../assets/img/talenTrackLogo_SVG.svg"; 

const SidebarAuditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  // Función para marcar activo si la ruta empieza con...
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
        {/* Nota: Agregamos Inicio y Dashboard como pediste */}
        
        <Link to="/auditor/inicio" className={`sidebar-item ${isActive("/auditor/inicio")}`}>
          <div className="sidebar-icon-box"><i className='bx bxs-home'></i></div>
          <span>Inicio</span>
        </Link>
        
        <Link to="/auditor/dashboard" className={`sidebar-item ${isActive("/auditor/dashboard")}`}>
          <div className="sidebar-icon-box"><i className='bx bxs-dashboard'></i></div>
          <span>Dashboard</span>
        </Link>

        {/* GRUPO 2: SEGURIDAD Y ACCESOS */}
        <div className="sidebar-section-label">Seguridad</div>
        
        <Link to="/auditor/accesos/usuarios" className={`sidebar-item ${isActive("/auditor/accesos/usuarios")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-shield-quarter'></i></div>
          <span>Control Accesos</span>
        </Link>

        <Link to="/auditor/trazabilidad/logs" className={`sidebar-item ${isActive("/auditor/trazabilidad/logs")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-list-ul'></i></div>
          <span>Trazabilidad Logs</span>
        </Link>

        {/* GRUPO 3: GESTIÓN DE TALENTO */}
        <div className="sidebar-section-label">Talento Humano</div>
        
        <Link to="/auditor/expedientes/empleados" className={`sidebar-item ${isActive("/auditor/expedientes/empleados")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-folder-open'></i></div>
          <span>Expedientes</span>
        </Link>

        <Link to="/auditor/desempeno/asignaciones-kpi" className={`sidebar-item ${isActive("/auditor/desempeno/asignaciones-kpi")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-bar-chart-alt'></i></div>
          <span>Desempeño KPI</span>
        </Link>

        {/* GRUPO 4: TIEMPO Y ASISTENCIA */}
        <div className="sidebar-section-label">Tiempo y Asistencia</div>

        <Link to="/auditor/ausencias/solicitudes" className={`sidebar-item ${isActive("/auditor/ausencias/solicitudes")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-calendar-x'></i></div>
          <span>Ausencias</span>
        </Link>

        <Link to="/auditor/asistencia/eventos" className={`sidebar-item ${isActive("/auditor/asistencia/eventos")}`}>
          <div className="sidebar-icon-box"><i className='bx bx-time-five'></i></div>
          <span>Asistencia</span>
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

export default SidebarAuditor;