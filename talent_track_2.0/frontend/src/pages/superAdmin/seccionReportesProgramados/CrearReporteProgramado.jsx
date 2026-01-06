import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";
import { getAccessToken } from "../../../services/authStorage";

// Estilos
import "../../../assets/css/admin-empresas.css"; 
import "../../../assets/css/modal.css"; 

const API_BASE = "http://127.0.0.1:8000/api";

const TIPOS = [
  { id: 1, label: "Asistencia" },
  { id: 2, label: "KPI" },
  { id: 3, label: "Ausencias" },
];

const FORMATOS = [
  { id: 1, label: "CSV (Texto plano)" },
  { id: 2, label: "Excel (.xlsx)" },
  { id: 3, label: "PDF (Documento)" },
];

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function CrearReporteProgramado() {
  const navigate = useNavigate();
  const token = useMemo(() => getAccessToken(), []);

  // --- ESTADOS DE DATOS ---
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- FORMULARIO ---
  const [form, setForm] = useState({
    empresa_id: "",
    nombre: "",
    tipo: 1,
    formato: 3,
    activo: true,
  });

  // --- CRON VISUAL ---
  const [cronType, setCronType] = useState("diario");
  const [cronTime, setCronTime] = useState("08:00");
  const [cronDayWeek, setCronDayWeek] = useState("1");
  const [cronDayMonth, setCronDayMonth] = useState("1");
  const [finalCronString, setFinalCronString] = useState("* * * * *");

  // --- DESTINATARIOS ---
  const [emailInput, setEmailInput] = useState("");
  const [destinatarios, setDestinatarios] = useState([]);
  
  // --- MODAL ---
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 1. CARGA INICIAL
  useEffect(() => {
    const loadEmpresas = async () => {
      try {
        if (!token) return navigate("/login");
        const res = await apiFetch(`${API_BASE}/listado-empresas/`, { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        if (res.ok) {
            const data = await res.json();
            setEmpresas(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadEmpresas();
  }, [navigate, token]);

  // 2. GENERADOR DE CRON
  useEffect(() => {
    if (!cronTime) return;
    const [h, m] = cronTime.split(":");
    const min = parseInt(m, 10);
    const hour = parseInt(h, 10);
    
    let nuevoCron = "";
    if (cronType === "diario") {
        nuevoCron = `${min} ${hour} * * *`;
    } else if (cronType === "semanal") {
        nuevoCron = `${min} ${hour} * * ${cronDayWeek}`;
    } else if (cronType === "mensual") {
        nuevoCron = `${min} ${hour} ${cronDayMonth} * *`;
    }
    setFinalCronString(nuevoCron);
  }, [cronType, cronTime, cronDayWeek, cronDayMonth]);

  // HANDLERS
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const addDestinatario = () => {
    const v = emailInput.trim();
    if (!v) return;
    if (!isValidEmail(v)) return alert("El correo ingresado no es válido.");
    if (destinatarios.includes(v)) return setEmailInput(""); 
    setDestinatarios(prev => [...prev, v]);
    setEmailInput("");
  };

  const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          addDestinatario();
      }
  };

  const removeDestinatario = (v) => {
    setDestinatarios(prev => prev.filter(x => x !== v));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.empresa_id) return alert("Selecciona una empresa.");
    if (!form.nombre.trim()) return alert("El nombre es obligatorio.");
    if (destinatarios.length === 0) return alert("Agrega al menos un destinatario.");

    setSaving(true);
    const payload = {
      empresa: Number(form.empresa_id),
      nombre: form.nombre.trim(),
      tipo: Number(form.tipo),
      frecuencia_cron: finalCronString,
      formato: Number(form.formato),
      destinatarios,
      activo: Boolean(form.activo),
    };

    try {
      const res = await apiFetch(`${API_BASE}/reportes-programados/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowSuccessModal(true);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err?.detail || "Error al programar el reporte.");
      }
    } catch (e) {
      alert("Error de conexión.");
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSuccess = () => {
      setShowSuccessModal(false);
      navigate("/admin/reportes-programados");
  };

  // Estilos
  const inputStyle = { width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', color: '#1f2937', transition: 'border-color 0.2s', backgroundColor: '#f8fafc' };
  const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.25rem', pointerEvents: 'none' };

  if (loading) return <div className="layout" style={{justifyContent:'center', alignItems:'center', background:'#f8fafc'}}>Cargando...</div>;

  return (
    <div className="layout" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER SIMPLE (Solo Navegación) */}
        <header style={{ 
            backgroundColor: 'white', 
            padding: '16px 40px', 
            borderBottom: '1px solid #e2e8f0', 
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'0.85rem', color:'#64748b' }}>
                    <span 
                        style={{cursor:'pointer', textDecoration:'none', color:'#64748b'}} 
                        onClick={() => navigate('/admin/reportes-programados')}
                        onMouseOver={(e) => e.target.style.color = '#dc2626'}
                        onMouseOut={(e) => e.target.style.color = '#64748b'}
                    >
                        Reportes
                    </span>
                    <i className='bx bx-chevron-right' style={{fontSize:'1rem'}}></i>
                    <span style={{color:'#dc2626', fontWeight:'600', background:'#fef2f2', padding:'2px 8px', borderRadius:'4px'}}>Nueva Programación</span>
                </div>
            </div>
        </header>

        {/* CONTENEDOR PRINCIPAL */}
        <div className="content-area" style={{ padding: '32px 40px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
            
            {/* TÍTULO EN EL CUERPO (Fuera del Header) */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0, letterSpacing:'-0.5px' }}>Crear Reporte</h1>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize:'0.95rem' }}>Define los parámetros y la frecuencia para el envío automático.</p>
            </div>
            
            <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', alignItems: 'start' }}>
                
                {/* --- COLUMNA IZQUIERDA: CONFIGURACIÓN GENERAL --- */}
                <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', padding: '32px' }}>
                    
                    <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px', paddingBottom:'16px', borderBottom:'1px solid #f1f5f9' }}>
                        <div style={{background:'#eff6ff', color:'#3b82f6', width:'40px', height:'40px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                             <i className='bx bx-file' style={{fontSize:'1.4rem'}}></i>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin:0 }}>Información General</h3>
                            <span style={{ fontSize:'0.8rem', color:'#94a3b8' }}>Datos principales del reporte</span>
                        </div>
                    </div>

                    {/* EMPRESA */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Empresa <span style={{color:'#dc2626'}}>*</span></label>
                        <div style={{ position: 'relative' }}>
                            <i className='bx bxs-business' style={iconStyle}></i>
                            <select name="empresa_id" value={form.empresa_id} onChange={onChange} style={{ ...inputStyle, appearance: 'none' }}>
                                <option value="">Seleccionar Empresa...</option>
                                {empresas.map(e => <option key={e.id} value={e.id}>{e.razon_social}</option>)}
                            </select>
                            <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                        </div>
                    </div>

                    {/* NOMBRE */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Nombre de la Tarea <span style={{color:'#dc2626'}}>*</span></label>
                        <div style={{ position: 'relative' }}>
                            <i className='bx bx-tag' style={iconStyle}></i>
                            <input type="text" name="nombre" value={form.nombre} onChange={onChange} style={inputStyle} placeholder="Ej. Reporte Mensual Asistencia" />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                        {/* TIPO */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Tipo de Reporte</label>
                            <div style={{ position: 'relative' }}>
                                <i className='bx bx-category' style={iconStyle}></i>
                                <select name="tipo" value={form.tipo} onChange={onChange} style={{ ...inputStyle, appearance: 'none' }}>
                                    {TIPOS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                </select>
                                <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                            </div>
                        </div>

                        {/* FORMATO */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Formato</label>
                            <div style={{ position: 'relative' }}>
                                <i className='bx bx-file-blank' style={iconStyle}></i>
                                <select name="formato" value={form.formato} onChange={onChange} style={{ ...inputStyle, appearance: 'none' }}>
                                    {FORMATOS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                                </select>
                                <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                            </div>
                        </div>
                    </div>

                    {/* ACTIVO */}
                    <div style={{ marginBottom: '24px', padding:'16px', background:'#f8fafc', borderRadius:'8px', border:'1px solid #f1f5f9' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '0.95rem', color: '#334155', fontWeight: '600' }}>
                            <div style={{position:'relative', width:'40px', height:'20px'}}>
                                <input type="checkbox" name="activo" checked={form.activo} onChange={onChange} style={{ width: '100%', height: '100%', opacity:0, cursor:'pointer' }} />
                                <div style={{position:'absolute', top:0, left:0, right:0, bottom:0, background: form.activo ? '#dc2626' : '#cbd5e1', borderRadius:'20px', transition:'0.3s'}}></div>
                                <div style={{position:'absolute', top:'2px', left: form.activo ? '22px' : '2px', width:'16px', height:'16px', background:'white', borderRadius:'50%', transition:'0.3s', boxShadow:'0 1px 2px rgba(0,0,0,0.2)'}}></div>
                            </div>
                            Activar envío automático
                        </label>
                    </div>

                    {/* BOTONES (Reubicados Aquí) */}
                    <div style={{ display: 'flex', gap: '16px', marginTop: '32px', paddingTop:'24px', borderTop:'1px solid #f1f5f9' }}>
                        <button 
                            type="button" 
                            onClick={() => navigate("/admin/reportes-programados")}
                            style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 'bold', fontSize: '1rem', cursor:'pointer', transition:'0.2s' }}
                            onMouseOver={(e) => e.target.style.background = '#f8fafc'}
                            onMouseOut={(e) => e.target.style.background = 'white'}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={saving}
                            style={{ flex: 2, padding: '14px', borderRadius: '8px', border: 'none', background: saving ? '#fca5a5' : '#dc2626', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent:'center', gap: '8px', boxShadow: '0 4px 10px rgba(220, 38, 38, 0.2)' }}
                        >
                            {saving ? 'Guardando...' : <><i className='bx bx-save'></i> Guardar Programación</>}
                        </button>
                    </div>
                </div>

                {/* --- COLUMNA DERECHA: ENTREGA Y FRECUENCIA --- */}
                <div style={{ display:'flex', flexDirection:'column', gap:'32px' }}>
                    
                    {/* CARD 1: FRECUENCIA */}
                    <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', padding: '32px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px', paddingBottom:'16px', borderBottom:'1px solid #f1f5f9' }}>
                            <div style={{background:'#fef2f2', color:'#dc2626', width:'40px', height:'40px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                <i className='bx bx-time' style={{fontSize:'1.4rem'}}></i>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin:0 }}>Frecuencia</h3>
                                <span style={{ fontSize:'0.8rem', color:'#94a3b8' }}>¿Cuándo se enviará?</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight:'600', color: '#64748b', marginBottom: '6px', display: 'block' }}>REPETIR</label>
                                <select value={cronType} onChange={(e) => setCronType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline:'none' }}>
                                    <option value="diario">Diariamente</option>
                                    <option value="semanal">Semanalmente</option>
                                    <option value="mensual">Mensualmente</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight:'600', color: '#64748b', marginBottom: '6px', display: 'block' }}>HORA</label>
                                <input type="time" value={cronTime} onChange={(e) => setCronTime(e.target.value)} style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline:'none' }} />
                            </div>
                        </div>

                        {cronType === "semanal" && (
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight:'600', color: '#64748b', marginBottom: '6px', display: 'block' }}>DÍA DE LA SEMANA</label>
                                <select value={cronDayWeek} onChange={(e) => setCronDayWeek(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline:'none' }}>
                                    <option value="1">Lunes</option>
                                    <option value="2">Martes</option>
                                    <option value="3">Miércoles</option>
                                    <option value="4">Jueves</option>
                                    <option value="5">Viernes</option>
                                    <option value="6">Sábado</option>
                                    <option value="0">Domingo</option>
                                </select>
                            </div>
                        )}

                        {cronType === "mensual" && (
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight:'600', color: '#64748b', marginBottom: '6px', display: 'block' }}>DÍA DEL MES</label>
                                <select value={cronDayMonth} onChange={(e) => setCronDayMonth(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline:'none' }}>
                                    {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>Día {i+1}</option>)}
                                </select>
                            </div>
                        )}

                        <div style={{ marginTop: '20px', padding:'12px', background:'#f8fafc', borderRadius:'8px', border:'1px dashed #cbd5e1', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight:'600' }}>CÓDIGO CRON</span>
                            <code style={{ fontSize: '0.85rem', color: '#0f172a', background:'#e2e8f0', padding:'2px 8px', borderRadius:'4px', fontFamily:'monospace' }}>{finalCronString}</code>
                        </div>
                    </div>

                    {/* CARD 2: DESTINATARIOS */}
                    <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', padding: '32px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px', paddingBottom:'16px', borderBottom:'1px solid #f1f5f9' }}>
                            <div style={{background:'#fefce8', color:'#ca8a04', width:'40px', height:'40px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                <i className='bx bx-envelope' style={{fontSize:'1.4rem'}}></i>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin:0 }}>Destinatarios</h3>
                                <span style={{ fontSize:'0.8rem', color:'#94a3b8' }}>¿Quién recibe el reporte?</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <input 
                                    value={emailInput} 
                                    onChange={(e) => setEmailInput(e.target.value)} 
                                    onKeyDown={handleKeyDown}
                                    style={{...inputStyle, paddingLeft:'12px'}} 
                                    placeholder="correo@ejemplo.com" 
                                />
                            </div>
                            <button 
                                type="button" 
                                onClick={addDestinatario}
                                style={{ padding: '0 16px', borderRadius: '8px', border: 'none', background: '#eff6ff', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer', fontSize:'1.4rem', display:'flex', alignItems:'center', transition:'0.2s' }}
                                onMouseOver={(e) => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.color = 'white'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; }}
                            >
                                <i className='bx bx-plus'></i>
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '60px', padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            {destinatarios.length === 0 && <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle:'italic', margin:'auto' }}>Añade correos arriba...</span>}
                            {destinatarios.map((d, idx) => (
                                <div key={idx} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '6px 10px 6px 14px', fontSize: '0.85rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                    {d}
                                    <button 
                                        type="button" 
                                        onClick={() => removeDestinatario(d)} 
                                        style={{ background: '#fee2e2', border: 'none', color: '#dc2626', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </form>
        </div>

        {/* MODAL DE ÉXITO */}
        {showSuccessModal && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><i className='bx bx-check' style={{ fontSize: '48px' }}></i></div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>¡Reporte Programado!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>La tarea ha sido creada exitosamente.</p>
                    <button onClick={handleCloseSuccess} style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Continuar</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}