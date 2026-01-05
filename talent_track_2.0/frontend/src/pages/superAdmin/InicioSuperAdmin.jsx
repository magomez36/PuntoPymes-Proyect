import React from "react";
import { useNavigate } from "react-router-dom";
import { clearSession } from "../../services/session";
import Sidebar from "../../components/Sidebar";

// Estilos
import "../../assets/css/admin-empresas.css"; // Reutilizamos el layout base

export default function InicioSuperAdmin() {
  const navigate = useNavigate();

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  // Configuración de las tarjetas del Dashboard
  const menuItems = [
    {
      category: "Organización",
      items: [
        { title: "Empresas", icon: "bx-buildings", path: "/admin/empresas", desc: "Gestión de compañías y sedes." },
        { title: "Unidades Org.", icon: "bx-sitemap", path: "/admin/unidades-organizacionales", desc: "Departamentos y áreas." },
        { title: "Puestos", icon: "bx-briefcase", path: "/admin/puestos", desc: "Cargos y jerarquías." },
      ]
    },
    {
      category: "Gestión de Talento",
      items: [
        { title: "Empleados", icon: "bx-user-pin", path: "/admin/empleados", desc: "Directorio de personal." },
        { title: "Turnos", icon: "bx-time-five", path: "/admin/turnos", desc: "Horarios y rotaciones." },
        { title: "Ausencias", icon: "bx-calendar-x", path: "/admin/tipos-ausencias", desc: "Tipos de permisos." },
      ]
    },
    {
      category: "Configuración y Control",
      items: [
        { title: "Reglas Asistencia", icon: "bx-cog", path: "/admin/reglas-asistencia", desc: "Políticas de puntualidad." },
        { title: "KPIs", icon: "bx-bar-chart-alt-2", path: "/admin/kpis", desc: "Indicadores de gestión." },
        { title: "Usuarios del Sistema", icon: "bx-user-circle", path: "/admin/usuarios", desc: "Accesos y seguridad." },
      ]
    }
  ];

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

  return (
    <div className="layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER */}
        <header style={{ background: 'white', padding: '0 32px', borderBottom: '1px solid #e2e8f0', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Panel General</h2>
            <button 
                onClick={logout}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '600' }}
            >
                <i className='bx bx-log-out' style={{ fontSize: '1.2rem' }}></i> Cerrar Sesión
            </button>
        </header>

        <div className="content-area" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Bienvenido, SuperAdmin</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>¿Qué deseas gestionar hoy?</p>
            </div>

            {/* GRID DE CATEGORÍAS */}
            {menuItems.map((section, idx) => (
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
                                <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                    <i className={`bx ${item.icon}`}></i>
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>{item.title}</h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{item.desc}</p>
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