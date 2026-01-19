import React from "react";
import { useNavigate } from "react-router-dom";
import { getFullName, clearSession } from "../../services/session";
import SidebarManager from "../../components/SidebarManager";

export default function InicioManager() {
  const navigate = useNavigate();
  const fullName = getFullName();

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  // Estilos inline para las tarjetas
  const cardStyle = {
    background: "white",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  };

  // Manager Modules Data
  const managerModules = [
    {
      category: "Gestión de Equipo",
      items: [
        {
          title: "Mi Equipo",
          icon: "bx-group",
          path: "/manager/mi-equipo/empleados",
          desc: "Directorio y gestión de los empleados a tu cargo."
        },
        {
          title: "Aprobación de Solicitudes",
          icon: "bx-envelope",
          path: "/manager/ausencias/solicitudes",
          desc: "Gestiona y aprueba las solicitudes de ausencias de tu equipo."
        },
      ]
    },
    {
      category: "Supervisión y Reportes",
      items: [
        {
          title: "Supervisión de Asistencia",
          icon: "bx-calendar-check",
          path: "/manager/supervision/asistencia",
          desc: "Revisa los eventos de asistencia diarios de tu equipo."
        },
        {
          title: "Jornadas Calculadas",
          icon: "bx-time-five",
          path: "/manager/supervision/jornadas",
          desc: "Consulta las jornadas laborales calculadas del día."
        },
        {
          title: "Evaluaciones de Desempeño",
          icon: "bx-bar-chart-alt-2",
          path: "/manager/evaluaciones",
          desc: "Accede a los reportes y evaluaciones de desempeño de tu equipo."
        },
      ]
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <div className="layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <SidebarManager />

      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '80px' }}>

        {/* HEADER */}
        <header style={{ background: 'white', padding: '0 32px', borderBottom: '1px solid #e2e8f0', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Panel General</h2>

          <button
            className="manager-logout-btn"
            onClick={logout}
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '600' }}
          >
            <i className="bx bx-log-out" style={{ fontSize: '1.2rem' }}></i>
            Cerrar Sesión
          </button>
        </header>

        <div className="content-area" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

          {/* BIENVENIDA */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#dc2626', marginBottom: '8px' }}>
              {getGreeting()}{fullName ? `, ${fullName}` : ""}
            </h1>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
              Panel de Manager: aprobación de permisos y reportes del equipo.
            </p>
          </div>

          {/* GRID DE MÓDULOS */}
          {managerModules.map((section, idx) => (
            <div key={idx} style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '0.95rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', fontWeight: '700', marginBottom: '16px' }}>
                {section.category}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {section.items.map((item, i) => (
                  <div
                    key={i}
                    style={cardStyle}
                    onClick={() => navigate(item.path)}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; }}
                  >
                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                      <i className={`bx ${item.icon}`}></i>
                    </div>
                    <div>
                      <div className="manager-module-title" style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>{item.title}</div>
                      <div className="manager-module-desc" style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

        </div>
      </main>
    </div>
  );
}
