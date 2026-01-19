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

const fmtMoney = (amount) => {
  if (amount === undefined || amount === null) return "N/A";
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function ContratoEmpleado() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/auditor/expedientes/empleados/${id}/contrato/`);
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d?.detail || JSON.stringify(d));
      setData(d);
    } catch (e) {
      setErr(e?.message || "Error cargando contrato.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  // --- Estilos ---
  const watermarkStyle = {
    position: 'fixed', bottom: '-80px', right: '-80px', width: '450px', height: 'auto', opacity: '0.04', zIndex: 0, pointerEvents: 'none'
  };

  const cardBaseStyle = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    padding: '40px',
    maxWidth: '900px', 
    margin: '0 auto',  
    position: 'relative'
  };

  const getStatusBadge = (status) => {
    const s = status ? status.toUpperCase() : "DESCONOCIDO";
    let bg = '#f1f5f9'; let color = '#475569';

    if (s === 'VIGENTE' || s === 'ACTIVO') { bg = '#dcfce7'; color = '#15803d'; }
    else if (s === 'FINALIZADO' || s === 'INACTIVO') { bg = '#fee2e2'; color = '#b91c1c'; }

    return (
      <span style={{ 
        backgroundColor: bg, color: color, 
        padding: '6px 16px', borderRadius: '30px', 
        fontSize: '0.8rem', fontWeight: '700', 
        textTransform: 'uppercase', letterSpacing: '0.5px',
        display: 'flex', alignItems: 'center', gap: '6px'
      }}>
        <span style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color}}></span>
        {s}
      </span>
    );
  };

  // Componente para items de fecha/condición
  const DetailItem = ({ icon, title, subtitle, desc }) => (
    <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
        <div style={{ 
            width: '45px', height: '45px', borderRadius: '10px', 
            backgroundColor: '#f1f5f9', color: '#3b82f6', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' 
        }}>
            <i className={`bx ${icon}`}></i>
        </div>
        <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                {title}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>
                {subtitle}
            </div>
            {desc && <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{desc}</div>}
        </div>
    </div>
  );

  return (
    <div className="layout" style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <img src={logoWatermark} alt="Marca de Agua" style={watermarkStyle} />

      <main className="main-content" style={{ position: 'relative', zIndex: 1, padding: '30px' }}>
        
        {/* Header Superior: Volver y Botón Principal */}
        <div style={{ maxWidth: '900px', margin: '0 auto 30px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
                onClick={() => navigate(`/auditor/expedientes/empleados/${id}`)}
                style={{ 
                    background: 'none', border: 'none', cursor: 'pointer', 
                    color: '#64748b', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px',
                    padding: 0, fontWeight: '500'
                }}
            >
                <i className='bx bx-arrow-back'></i> Volver al Perfil
            </button>
            
            <button 
                onClick={() => navigate(`/auditor/expedientes/empleados/${id}/jornadas`)}
                style={{ 
                    background: '#fff', border: '1px solid #d51e37', borderRadius: '8px',
                    padding: '10px 20px', cursor: 'pointer', fontWeight: '600', color: '#d51e37',
                    display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                    boxShadow: '0 2px 5px rgba(213, 30, 55, 0.1)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#d51e37'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#d51e37'; }}
            >
                <i className='bx bx-time-five'></i> Ver Jornadas Laborales
            </button>
        </div>

        {loading && <p style={{ textAlign:'center' }}>Cargando contrato...</p>}
        {err && <p style={{ color: "crimson", textAlign:'center' }}>{err}</p>}

        {!loading && data && (
            <div style={cardBaseStyle}>
                
                {/* 1. Encabezado del Contrato */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        {/* Icono Grande */}
                        <div style={{ 
                            width: '60px', height: '60px', borderRadius: '12px', 
                            backgroundColor: '#fef2f2', color: '#d51e37', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' 
                        }}>
                            <i className='bx bxs-file-doc'></i>
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1e293b', margin: '0 0 5px 0' }}>
                                {data.tipo_label || "Contrato Laboral"}
                            </h1>
                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                Ref: CNT-{new Date().getFullYear()}-{data.id} • Recursos Humanos
                            </div>
                        </div>
                    </div>
                    {getStatusBadge(data.estado_label)}
                </div>

                {/* 2. Bloque de Salario (Estilo destacado) */}
                <div style={{ 
                    backgroundColor: '#f8fafc', borderRadius: '12px', padding: '30px', 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '40px', border: '1px solid #e2e8f0'
                }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px' }}>
                            Salario Base Mensual
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', letterSpacing: '-1px' }}>
                            {fmtMoney(data.salario_base)}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Moneda local (USD)</div>
                    </div>
                    <div style={{ 
                        width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fff', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        color: '#64748b', fontSize: '1.8rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' 
                    }}>
                        <i className='bx bx-money'></i>
                    </div>
                </div>

                {/* 3. Grid de Detalles (Vigencia y Condiciones) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', borderTop: '1px solid #f1f5f9', paddingTop: '40px' }}>
                    
                    {/* Columna Izquierda: Vigencia */}
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className='bx bx-calendar' style={{ color: '#d51e37' }}></i> Vigencia del Contrato
                        </h3>
                        
                        <DetailItem 
                            icon="bx-calendar-check" 
                            title="Fecha Inicio" 
                            subtitle={fmtDate(data.fecha_inicio)} 
                            desc="Inicio de labores" 
                        />
                        <DetailItem 
                            icon="bx-calendar-x" 
                            title="Fecha Fin" 
                            subtitle={data.fecha_fin_label || "Indefinido"} 
                            desc="Sin fecha de término" 
                        />
                    </div>

                    {/* Columna Derecha: Condiciones */}
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className='bx bx-briefcase' style={{ color: '#d51e37' }}></i> Condiciones Laborales
                        </h3>

                        <DetailItem 
                            icon="bx-time" 
                            title="Jornada Semanal" 
                            subtitle={`${data.jornada_semanal_horas} Horas`} 
                            desc="Lunes a Viernes" 
                        />

                        {/* Caja de cita o nota legal */}
                        <div style={{ 
                            backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', 
                            fontSize: '0.85rem', color: '#475569', fontStyle: 'italic', borderLeft: '3px solid #cbd5e1'
                        }}>
                            "El empleado se compromete a cumplir con el horario establecido y las normativas internas de la organización durante la vigencia de este contrato."
                        </div>
                    </div>

                </div>

                {/* Footer del Documento */}
                <div style={{ marginTop: '40px', borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Última actualización: {new Date().toLocaleDateString("es-EC")}
                    </div>
                    <button style={{ 
                        background: 'none', border: 'none', color: '#d51e37', fontWeight: '600', 
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' 
                    }}>
                        Descargar PDF <i className='bx bx-download'></i>
                    </button>
                </div>

            </div>
        )}
      </main>
    </div>
  );
}