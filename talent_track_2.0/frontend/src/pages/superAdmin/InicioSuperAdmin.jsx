import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearSession } from "../../services/session";
import Sidebar from "../../components/Sidebar";

// Estilos
import "../../assets/css/admin-empresas.css"; 

export default function InicioSuperAdmin() {
  const navigate = useNavigate();
  
  // Estado para el reloj
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  // --- LÓGICA DE SALUDO ---
  const saludo = useMemo(() => {
    const hour = currentDate.getHours();
    if (hour >= 6 && hour < 12) return "Buenos días";
    if (hour >= 12 && hour < 19) return "Buenas tardes";
    return "Buenas noches";
  }, [currentDate]);

  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = currentDate.toLocaleDateString('es-ES', dateOptions);

  // --- MENÚ ORGANIZADO (LO QUE SÍ EXISTE) ---
  const menuItems = [
    {
      category: "Estructura Organizacional",
      items: [
        { title: "Empresas", icon: "bx-buildings", path: "/admin/empresas", desc: "Gestión de compañías y sedes." },
        { title: "Unidades Org.", icon: "bx-sitemap", path: "/admin/unidades-organizacionales", desc: "Departamentos y áreas operativas." },
        { title: "Puestos", icon: "bx-briefcase", path: "/admin/puestos", desc: "Catálogo de cargos y jerarquías." },
      ]
    },
    {
      category: "Personal y Tiempo",
      items: [
        { title: "Empleados", icon: "bx-user-pin", path: "/admin/empleados", desc: "Directorio de personal y estados." },
        { title: "Turnos y Horarios", icon: "bx-time-five", path: "/admin/turnos", desc: "Planificación de jornadas laborales." },
        { title: "Tipos de Ausencias", icon: "bx-calendar-minus", path: "/admin/tipos-ausencias", desc: "Catálogo de permisos y justificaciones." },
      ]
    },
    {
      category: "Seguridad y Accesos",
      items: [
        { title: "Usuarios", icon: "bx-user-circle", path: "/admin/usuarios", desc: "Cuentas de acceso al sistema." },
        { title: "Roles", icon: "bx-shield", path: "/admin/roles", desc: "Perfiles (Admin, Gerente, etc.)." },
        { title: "Permisos", icon: "bx-key", path: "/admin/permisos", desc: "Reglas de autorización granular." },
      ]
    },
    {
      category: "Configuración y Métricas",
      items: [
        { title: "Reglas de Asistencia", icon: "bx-cog", path: "/admin/reglas-asistencia", desc: "Políticas de atrasos y horas extra." },
        { title: "KPIs y Reportes", icon: "bx-bar-chart-alt-2", path: "/admin/kpis", desc: "Indicadores de gestión y asistencia." },
      ]
    }
  ];

  const cardStyle = {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    position: "relative",
    overflow: "hidden"
  };

  return (
    <div className="layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER */}
        <header style={{ background: 'white', padding: '0 40px', borderBottom: '1px solid #e2e8f0', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0, display:'flex', alignItems:'center', gap:'10px' }}>
                <i className='bx bxs-home' style={{color:'#dc2626'}}></i> Inicio
            </h2>
            <button 
                onClick={logout}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '600', transition:'color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#dc2626'}
                onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
            >
                <i className='bx bx-log-out' style={{ fontSize: '1.2rem' }}></i> Cerrar Sesión
            </button>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <div className="content-area" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            
            {/* HERO */}
            <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px', letterSpacing:'-0.5px' }}>
                        {saludo}, <span style={{color:'#dc2626'}}>SuperAdmin</span>
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0 }}>
                        Panel de control general y configuración del sistema.
                    </p>
                </div>

                {/* WIDGET FECHA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', color: '#dc2626', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {formattedDate}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop:'4px' }}>
                            Sistema Operativo
                        </div>
                    </div>
                    <div style={{ width: '1px', height: '40px', background: '#e2e8f0' }}></div>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        <i className='bx bx-calendar' style={{ fontSize: '1.5rem' }}></i>
                    </div>
                </div>
            </div>

            {/* GRID DE CATEGORÍAS */}
            {menuItems.map((section, idx) => (
                <div key={idx} style={{ marginBottom: '40px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom: '20px', paddingBottom:'10px', borderBottom:'1px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', fontWeight: '800', margin:0 }}>
                            {section.category}
                        </h3>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                        {section.items.map((item, i) => (
                            <div 
                                key={i} 
                                style={cardStyle}
                                onClick={() => navigate(item.path)}
                                onMouseEnter={(e) => { 
                                    e.currentTarget.style.transform = 'translateY(-5px)'; 
                                    e.currentTarget.style.borderColor = '#fee2e2'; 
                                    e.currentTarget.style.boxShadow = '0 12px 20px -5px rgba(220, 38, 38, 0.1)'; 
                                }}
                                onMouseLeave={(e) => { 
                                    e.currentTarget.style.transform = 'translateY(0)'; 
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02)'; 
                                }}
                            >
                                <div style={{ display:'flex', alignItems:'start', justifyContent:'space-between' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', transition:'all 0.3s' }}>
                                        <i className={`bx ${item.icon}`}></i>
                                    </div>
                                    
                                    <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', color:'#cbd5e1' }}>
                                        <i className='bx bx-chevron-right' style={{ fontSize:'1.2rem' }}></i>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: '700', color: '#1e293b' }}>{item.title}</h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight:'1.5' }}>{item.desc}</p>
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