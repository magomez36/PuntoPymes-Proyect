import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/SidebarAuditor";
import { apiFetch } from "../../../services/api";
import logoWatermark from "../../../assets/img/talentrack_small.svg"; 

const fmtDate = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-EC", { year: 'numeric', month: 'long', day: 'numeric' });
};

export default function DetallesEmpleado() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/auditor/expedientes/empleados/${id}/`);
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d?.detail || JSON.stringify(d));
      setData(d);
    } catch (e) {
      setErr(e?.message || "Error cargando detalle.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const getInitials = (name, surname) => {
    const n = name ? name.charAt(0).toUpperCase() : '';
    const s = surname ? surname.charAt(0).toUpperCase() : '';
    return n + s;
  };

  // --- Estilos ---
  const watermarkStyle = {
    position: 'fixed', bottom: '-80px', right: '-80px', width: '450px', height: 'auto', opacity: '0.04', zIndex: 0, pointerEvents: 'none'
  };

  const cardBaseStyle = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    padding: '24px',
    height: '100%', // Para que las tarjetas se estiren si están en grid
    display: 'flex',
    flexDirection: 'column'
  };

  const getStatusBadge = (status) => {
    const s = status ? status.toUpperCase() : "DESCONOCIDO";
    let bg = '#f1f5f9'; let color = '#475569';

    if (s === 'ACTIVO' || s === 'ALTA') { bg = '#dcfce7'; color = '#15803d'; }
    else if (s === 'INACTIVO' || s === 'BAJA') { bg = '#fee2e2'; color = '#b91c1c'; }
    else if (s === 'VACACIONES') { bg = '#fef9c3'; color = '#a16207'; }

    return (
      <span style={{ 
        backgroundColor: bg, color: color, 
        padding: '4px 12px', borderRadius: '20px', 
        fontSize: '0.75rem', fontWeight: '700', 
        textTransform: 'uppercase', letterSpacing: '0.5px',
        display: 'inline-block', marginTop: '5px'
      }}>
        {s}
      </span>
    );
  };

  const InfoItem = ({ icon, label, value, colorIcon = '#d51e37' }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ 
            minWidth: '35px', height: '35px', 
            borderRadius: '8px', backgroundColor: '#fff', 
            border: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginRight: '15px', color: colorIcon, fontSize: '1.2rem'
        }}>
            <i className={`bx ${icon}`}></i>
        </div>
        <div>
            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>
                {label}
            </span>
            <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: '600', color: '#334155' }}>
                {value || "N/A"}
            </span>
        </div>
    </div>
  );

  // Componente para archivos (Simulado)
  const FileItem = ({ name, type, date }) => (
    <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '12px', border: '1px solid #f1f5f9', borderRadius: '8px', marginBottom: '10px',
        transition: 'background 0.2s', cursor: 'pointer'
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ color: '#ef4444', fontSize: '1.5rem' }}><i className='bx bxs-file-pdf'></i></div>
            <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>{name}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{type} • Subido el {date}</div>
            </div>
        </div>
        <i className='bx bx-download' style={{ color: '#64748b', fontSize: '1.2rem' }}></i>
    </div>
  );

  // Componente para timeline (Simulado)
  const TimelineItem = ({ title, date, desc, last }) => (
    <div style={{ display: 'flex', gap: '15px', position: 'relative', paddingBottom: last ? '0' : '20px' }}>
        {/* Línea vertical */}
        {!last && <div style={{ position: 'absolute', left: '7px', top: '20px', bottom: '0', width: '2px', background: '#e2e8f0' }}></div>}
        
        {/* Punto */}
        <div style={{ 
            width: '16px', height: '16px', borderRadius: '50%', background: '#d51e37', 
            border: '4px solid #fee2e2', flexShrink: 0, marginTop: '2px'
        }}></div>
        
        <div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#334155' }}>{title}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>{date}</div>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>{desc}</div>
        </div>
    </div>
  );

  return (
    <div className="layout" style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <img src={logoWatermark} alt="Marca de Agua" style={watermarkStyle} />

      <main className="main-content" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        
        {/* Botón Volver */}
        <div style={{ marginBottom: '20px' }}>
            <button 
                onClick={() => navigate("/auditor/expedientes/empleados")}
                style={{ 
                    background: 'none', border: 'none', cursor: 'pointer', 
                    color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px',
                    padding: 0
                }}
            >
                <i className='bx bx-arrow-back'></i> Volver a la lista
            </button>
        </div>

        {loading && <p style={{ textAlign:'center' }}>Cargando perfil...</p>}
        {err && <p style={{ color: "crimson", textAlign:'center' }}>{err}</p>}

        {!loading && data && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 1. HEADER CARD */}
                <div style={{ ...cardBaseStyle, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ 
                            width: '80px', height: '80px', borderRadius: '50%', 
                            backgroundColor: '#e2e8f0', color: '#475569', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            fontSize: '2rem', fontWeight: '700', border: '4px solid #f8fafc'
                        }}>
                            {getInitials(data.nombres, data.apellidos)}
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                                {data.nombres} {data.apellidos}
                            </h1>
                            <div style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>
                                {data.puesto_nombre} • {data.unidad_nombre}
                            </div>
                            {getStatusBadge(data.estado_label)}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={() => navigate(`/auditor/expedientes/empleados/${id}/contrato`)}
                            style={{ 
                                background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
                                padding: '10px 20px', cursor: 'pointer', fontWeight: '600', color: '#334155',
                                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d51e37'; e.currentTarget.style.color = '#d51e37'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155'; }}
                        >
                            <i className='bx bx-file'></i> Ver Contrato
                        </button>
                        <button 
                            onClick={() => navigate(`/auditor/expedientes/empleados/${id}/jornadas`)}
                            style={{ 
                                background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
                                padding: '10px 20px', cursor: 'pointer', fontWeight: '600', color: '#334155',
                                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d51e37'; e.currentTarget.style.color = '#d51e37'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155'; }}
                        >
                            <i className='bx bx-time-five'></i> Ver Jornadas
                        </button>
                    </div>
                </div>

                {/* 2. GRID PRINCIPAL DE INFORMACIÓN */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                    
                    {/* Tarjeta Corporativa */}
                    <div style={cardBaseStyle}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', marginBottom: '25px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Datos Corporativos
                        </h3>
                        <InfoItem icon="bx-building" label="Unidad / Departamento" value={data.unidad_nombre} />
                        <InfoItem icon="bx-briefcase" label="Puesto" value={data.puesto_nombre} />
                        <InfoItem icon="bx-user-pin" label="Manager" value={data.manager_nombre} />
                        <InfoItem icon="bx-calendar-check" label="Fecha de Ingreso" value={fmtDate(data.fecha_ingreso)} />
                    </div>

                    {/* Tarjeta Personal */}
                    <div style={cardBaseStyle}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', marginBottom: '25px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Datos Personales
                        </h3>
                        <InfoItem icon="bx-envelope" label="Correo Electrónico" value={data.email} />
                        <InfoItem icon="bx-phone" label="Teléfono Móvil" value={data.telefono} />
                        <InfoItem icon="bx-map" label="Dirección" value={data.direccion} />
                        <InfoItem icon="bx-cake" label="Fecha de Nacimiento" value={fmtDate(data.fecha_nacimiento)} />
                    </div>
                </div>

                {/* 3. SECCIÓN INFERIOR: Documentos e Historial (NUEVO) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                    
                    {/* Documentos */}
                    <div style={cardBaseStyle}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', marginBottom: '20px' }}>
                            Documentos del Expediente
                        </h3>
                        {/* Datos simulados para llenar el espacio */}
                        <FileItem name="Contrato_Laboral_2024.pdf" type="Contrato" date="10 Ene, 2024" />
                        <FileItem name="Copia_Cedula.pdf" type="Identificación" date="10 Ene, 2024" />
                        <FileItem name="Titulo_Universitario.pdf" type="Certificado" date="15 Ene, 2024" />
                    </div>

                    {/* Historial */}
                    <div style={cardBaseStyle}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', marginBottom: '20px' }}>
                            Historial Reciente
                        </h3>
                        {/* Datos simulados para el timeline */}
                        <TimelineItem title="Actualización de Perfil" date="Hace 2 días" desc="Se actualizó la dirección domiciliaria del empleado." />
                        <TimelineItem title="Asignación de Puesto" date="10 Ene, 2024" desc={`Ingreso al puesto de ${data.puesto_nombre || 'empleado'}.`} />
                        <TimelineItem title="Creación de Expediente" date="10 Ene, 2024" desc="El usuario fue registrado en la plataforma." last={true} />
                    </div>

                </div>

            </div>
        )}
      </main>
    </div>
  );
}