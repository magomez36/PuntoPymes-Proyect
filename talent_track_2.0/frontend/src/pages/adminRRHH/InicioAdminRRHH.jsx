import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { getFullName, clearSession } from "../../services/session";
import SidebarRRHH from "../../components/SidebarRRHH"; 

// Estilos generales
import "../../assets/css/admin-empresas.css";

// Importamos el logo para la marca de agua
import logoWatermark from "../../assets/img/talentrack_small.svg";

export default function InicioAdminRRHH() {
  const navigate = useNavigate();
  const fullName = getFullName();

  // --- LÓGICA DE RELOJ Y SALUDO ---
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const saludo = useMemo(() => {
    const hour = currentDate.getHours();
    if (hour >= 6 && hour < 12) return "Buenos días";
    if (hour >= 12 && hour < 19) return "Buenas tardes";
    return "Buenas noches";
  }, [currentDate]);

  const formattedDate = currentDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  // --- MENÚ DE OPCIONES ---
  const menuSections = [
    {
      title: "Estructura Organizacional",
      items: [
        { label: "Unidades Organizacionales", icon: "bx-sitemap", path: "/rrhh/unidades-organizacionales", desc: "Departamentos y áreas." },
        { label: "Puestos", icon: "bx-briefcase", path: "/rrhh/puestos", desc: "Gestión de cargos." },
      ]
    },
    {
      title: "Gestión de Talento",
      items: [
        { label: "Empleados", icon: "bx-user-pin", path: "/rrhh/empleados", desc: "Legajos del personal." },
        { label: "Contratos", icon: "bx-file", path: "/rrhh/contratos", desc: "Administración contractual." },
      ]
    },
    {
      title: "Tiempo y Asistencia",
      items: [
        { label: "Turnos", icon: "bx-time-five", path: "/rrhh/turnos", desc: "Horarios rotativos." },
        { label: "Tipos de Ausencias", icon: "bx-calendar-minus", path: "/rrhh/tipos-ausencias", desc: "Catálogo de permisos." },
        { label: "Solicitudes Ausencias", icon: "bx-envelope", path: "/rrhh/ausencias/solicitudes", desc: "Bandeja de aprobaciones." },
        { label: "Jornadas Calculadas", icon: "bx-calendar-check", path: "/rrhh/jornadas-calculadas", desc: "Control de asistencia." },
        { label: "Saldos Vacaciones", icon: "bx-sun", path: "/rrhh/vacaciones/saldos", desc: "Días disponibles." },
      ]
    },
    {
      title: "Evaluación y Desempeño",
      items: [
        { label: "Catálogo KPIs", icon: "bx-bar-chart-alt-2", path: "/rrhh/kpis", desc: "Biblioteca de indicadores." },
        { label: "Asignaciones KPIs", icon: "bx-target-lock", path: "/rrhh/kpi/asignaciones", desc: "Metas por empleado." },
      ]
    }
  ];

  const cardStyle = {
    background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)", cursor: "pointer", transition: "all 0.3s ease",
    display: "flex", flexDirection: "column", gap: "12px", position: "relative", overflow: "hidden"
  };

  // --- ESTILO MARCA DE AGUA (Gigante) ---
  const watermarkStyle = {
    position: 'fixed',
    bottom: '-80px',
    right: '-80px',
    width: '550px',       // Un poco más grande para el Dashboard
    height: 'auto',
    opacity: '0.04',      // Muy sutil
    zIndex: 0,
    pointerEvents: 'none'
  };

  return (
    // 1. Usamos layout-wrapper para el flexbox general
    <div className="layout-wrapper">
      
      <SidebarRRHH />

      {/* 2. Usamos page-content-wrapper para el margen de 80px */}
      <main className="page-content-wrapper">
        
        {/* HEADER SUPERIOR (BARRA BLANCA) */}
        <header style={{ background: 'white', padding: '0 40px', borderBottom: '1px solid #e2e8f0', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0, display:'flex', alignItems:'center', gap:'10px' }}>
                <i className='bx bxs-home' style={{color:'#dc2626'}}></i> Panel Principal
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

        {/* CONTENEDOR CENTRADO (MaxWidth 1200px) */}
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
            
            {/* HERO / SALUDO */}
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px', letterSpacing:'-0.5px' }}>
                        {saludo}, <span style={{color:'#dc2626'}}>{fullName || "Gestor"}</span>
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0 }}>
                        Bienvenido a tu panel de gestión de recursos humanos.
                    </p>
                </div>

                {/* WIDGET FECHA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', color: '#dc2626', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {formattedDate}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop:'4px' }}>Sistema Activo</div>
                    </div>
                    <div style={{ width: '1px', height: '40px', background: '#e2e8f0' }}></div>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <i className='bx bx-calendar' style={{ fontSize: '1.5rem' }}></i>
                    </div>
                </div>
            </div>

            {/* GRID DE OPCIONES */}
            {menuSections.map((section, idx) => (
                <div key={idx} style={{ marginBottom: '40px' }}>
                    
                    <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom: '20px', paddingBottom:'10px', borderBottom:'1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', fontWeight: '800', margin:0 }}>
                            {section.title}
                        </h3>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
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
                                    <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>
                                        <i className={`bx ${item.icon}`}></i>
                                    </div>
                                    <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', color:'#cbd5e1' }}>
                                        <i className='bx bx-chevron-right' style={{ fontSize:'1.2rem' }}></i>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>{item.label}</h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight:'1.5' }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

        </div>
      </main>

      {/* MARCA DE AGUA */}
      <img 
        src={logoWatermark} 
        alt="Logo Fondo" 
        style={watermarkStyle} 
      />

    </div>
  );
}