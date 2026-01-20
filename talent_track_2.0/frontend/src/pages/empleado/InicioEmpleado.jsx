import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getFullName, clearSession } from "../../services/session";
import Sidebar from "../../components/SidebarEmpleado"; 
import "../../assets/css/admin-empresas.css"; // Estilos globales y marca de agua

export default function InicioEmpleado() {
  const navigate = useNavigate();
  const fullName = getFullName() || "Colaborador";

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const currentDate = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = currentDate.toLocaleDateString('es-ES', dateOptions);

  const saludo = useMemo(() => {
    const hour = currentDate.getHours();
    if (hour >= 6 && hour < 12) return "Buenos días";
    if (hour >= 12 && hour < 19) return "Buenas tardes";
    return "Buenas noches";
  }, [currentDate]);

  // Configuración de tarjetas con estilo corporativo
  const actions = [
    { 
      title: "Registrar Asistencia", 
      desc: "Marca tu entrada o salida.", 
      icon: "bx-play-circle", // Icono actualizado
      path: "/empleado/asistencia", 
      highlight: true // Esta será diferente
    },
    { 
      title: "Historial Laboral", 
      desc: "Consulta tus jornadas.", 
      icon: "bx-history", 
      path: "/empleado/jornadas" 
    },
    { 
      title: "Solicitar Permiso", 
      desc: "Vacaciones y ausencias.", 
      icon: "bx-calendar-plus", 
      path: "/empleado/ausencias" 
    },
    { 
      title: "Mis Indicadores", 
      desc: "KPIs y desempeño.", 
      icon: "bx-bar-chart-alt-2", 
      path: "/empleado/desempeno-kpis" 
    },
    { 
      title: "Notificaciones", 
      desc: "Bandeja de entrada.", 
      icon: "bx-bell", 
      path: "/empleado/notificaciones" 
    },
    { 
      title: "Mi Perfil", 
      desc: "Datos y seguridad.", 
      icon: "bx-user-circle", 
      path: "/empleado/mi-perfil" 
    },
  ];

  // --- ESTILOS ---
  const layoutWrapperStyle = {
    display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', width: '100%'
  };

  const mainAreaStyle = {
    flex: 1,
    padding: '40px 40px 40px 120px', // Un poco más de espacio
    position: 'relative', zIndex: 1,
    display: 'flex', flexDirection: 'column'
  };

  // Estilo base de tarjeta
  const cardStyle = (highlight) => ({
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    border: highlight ? '1px solid #fda4af' : '1px solid #e2e8f0', // Borde rojo suave si es destacado
    boxShadow: highlight ? '0 10px 15px -3px rgba(225, 29, 72, 0.1)' : '0 4px 6px -1px rgba(0,0,0,0.02)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    minHeight: '160px',
    position: 'relative',
    overflow: 'hidden'
  });

  return (
    <div className="layout layout-watermark" style={layoutWrapperStyle}>
      <Sidebar />
      
      <main style={mainAreaStyle}>
        
        {/* HEADER SUPERIOR */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '50px' }}>
            <div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1e293b', margin: 0, letterSpacing: '-0.03em' }}>
                    {saludo}, <span style={{ color: '#D51F36' }}>{fullName.split(' ')[0]}</span>
                </h2>
                <p style={{ color: '#64748b', marginTop: '8px', fontSize: '1.1rem', textTransform: 'capitalize' }}>
                    {formattedDate}
                </p>
            </div>
            
            <button 
                onClick={logout}
                style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 20px', borderRadius: '30px', 
                    border: '1px solid #e2e8f0', backgroundColor: 'white', 
                    color: '#64748b', fontWeight: '600', cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#fee2e2'; e.currentTarget.style.color = '#D51F36'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
            >
                <i className='bx bx-log-out' style={{ fontSize: '1.2rem' }}></i> Cerrar Sesión
            </button>
        </header>

        {/* GRID DE TARJETAS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
            
            {actions.map((item, index) => (
                <div 
                    key={index}
                    style={cardStyle(item.highlight)}
                    onClick={() => navigate(item.path)}
                    onMouseEnter={(e) => { 
                        e.currentTarget.style.transform = 'translateY(-5px)'; 
                        e.currentTarget.style.boxShadow = '0 15px 20px -5px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={(e) => { 
                        e.currentTarget.style.transform = 'translateY(0)'; 
                        e.currentTarget.style.boxShadow = item.highlight ? '0 10px 15px -3px rgba(225, 29, 72, 0.1)' : '0 4px 6px -1px rgba(0,0,0,0.02)';
                    }}
                >
                    {/* Icono */}
                    <div style={{ 
                        width: '60px', height: '60px', borderRadius: '14px', 
                        // Rojo fuerte si destacado, Gris muy suave si normal
                        backgroundColor: item.highlight ? '#D51F36' : '#f8fafc', 
                        color: item.highlight ? 'white' : '#475569', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        fontSize: '2rem', marginBottom: '20px'
                    }}>
                        <i className={`bx ${item.icon}`}></i>
                    </div>
                    
                    {/* Textos */}
                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
                            {item.title}
                        </h3>
                        <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            {item.desc}
                        </p>
                    </div>

                    {/* Flecha decorativa */}
                    <div style={{ position: 'absolute', top: '24px', right: '24px', color: '#cbd5e1' }}>
                        <i className='bx bx-right-arrow-alt' style={{ fontSize: '1.5rem' }}></i>
                    </div>
                </div>
            ))}

            {/* TARJETA DE SOPORTE (Diseño secundario) */}
            <div 
                style={{ 
                    borderRadius: '16px', border: '2px dashed #cbd5e1', 
                    padding: '24px', cursor: 'pointer', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', gap: '15px',
                    transition: 'all 0.2s', minHeight: '160px', backgroundColor: 'transparent'
                }}
                onClick={() => navigate("/empleado/soporte")}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
            >
                <i className='bx bx-support' style={{ fontSize: '2rem', color: '#94a3b8' }}></i>
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#64748b', marginBottom: '2px' }}>¿Ayuda?</h3>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Contactar RRHH</p>
                </div>
            </div>

        </div>

      </main>
    </div>
  );
}