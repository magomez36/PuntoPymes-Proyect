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

  // Datos
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Formulario
  const [form, setForm] = useState({
    empresa_id: "",
    nombre: "",
    tipo: 1,
    frecuencia_cron: "",
    formato: 1,
    activo: true,
  });

  const [emailInput, setEmailInput] = useState("");
  const [destinatarios, setDestinatarios] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- CARGA INICIAL ---
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

  // --- HANDLERS ---
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const addDestinatario = () => {
    const v = emailInput.trim();
    if (!v) return;
    if (!isValidEmail(v)) return alert("El correo ingresado no es válido.");
    if (destinatarios.includes(v)) return setEmailInput(""); // Ya existe, solo limpiar
    
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
    if (!form.frecuencia_cron.trim()) return alert("La frecuencia CRON es obligatoria.");
    if (destinatarios.length === 0) return alert("Agrega al menos un destinatario.");

    const payload = {
      empresa: Number(form.empresa_id),
      nombre: form.nombre.trim(),
      tipo: Number(form.tipo),
      frecuencia_cron: form.frecuencia_cron.trim(),
      formato: Number(form.formato),
      destinatarios,
      activo: Boolean(form.activo),
    };

    try {
      const res = await apiFetch(`${API_BASE}/reportes-programados/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
        
        {/* HEADER */}
        <header style={{ background: 'white', padding: '0 32px', borderBottom: '1px solid #e2e8f0', height: '64px', display: 'flex', alignItems: 'center' }}>
            <nav style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                <Link to="/admin/reportes-programados" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>Reportes</Link>
                <i className='bx bx-chevron-right' style={{ fontSize: '1.2rem', margin: '0 8px' }}></i>
                <span style={{ color: '#0f172a', fontWeight: '600' }}>Programar Envío</span>
            </nav>
        </header>

        <div className="content-area" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Programar Reporte</h1>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '1rem' }}>Configura el envío automático de informes periódicos.</p>
            </div>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* --- IZQUIERDA: DATOS BÁSICOS --- */}
                <div style={{ flex: '1', minWidth: '400px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', padding: '32px' }}>
                    <h4 style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '700', marginBottom: '20px', display:'flex', alignItems:'center', gap:'8px' }}>
                        <i className='bx bx-file' style={{fontSize:'1.2rem', color:'#64748b'}}></i> Configuración del Reporte
                    </h4>

                    {/* EMPRESA */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Empresa <span style={{color:'#ef4444'}}>*</span></label>
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
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Nombre de la Tarea <span style={{color:'#ef4444'}}>*</span></label>
                        <div style={{ position: 'relative' }}>
                            <i className='bx bx-tag' style={iconStyle}></i>
                            <input type="text" name="nombre" value={form.nombre} onChange={onChange} style={inputStyle} placeholder="Ej. Reporte Mensual Asistencia" />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        {/* TIPO */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Tipo de Reporte</label>
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
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Formato</label>
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
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.95rem', color: '#334155', fontWeight: '600' }}>
                            <input type="checkbox" name="activo" checked={form.activo} onChange={onChange} style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} />
                            Activar envío automático
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                        <Link 
                            to="/admin/reportes-programados"
                            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#334155', textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem', textAlign: 'center' }}
                        >
                            Cancelar
                        </Link>
                        <button 
                            onClick={submit} 
                            style={{ flex: 2, padding: '12px', borderRadius: '8px', border: 'none', background: '#0f172a', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent:'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.3)' }}
                        >
                            <i className='bx bx-save'></i> Guardar Programación
                        </button>
                    </div>
                </div>

                {/* --- DERECHA: ENTREGA Y FRECUENCIA --- */}
                <div style={{ flex: '1', minWidth: '400px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', padding: '32px' }}>
                    <h4 style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '700', marginBottom: '20px', display:'flex', alignItems:'center', gap:'8px' }}>
                        <i className='bx bx-paper-plane' style={{fontSize:'1.2rem', color:'#2563eb'}}></i> Entrega y Frecuencia
                    </h4>

                    {/* FRECUENCIA */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Frecuencia (Formato CRON) <span style={{color:'#ef4444'}}>*</span></label>
                        <div style={{ position: 'relative' }}>
                            <i className='bx bx-time' style={iconStyle}></i>
                            <input 
                                name="frecuencia_cron" 
                                value={form.frecuencia_cron} 
                                onChange={onChange} 
                                style={{ ...inputStyle, fontFamily: 'monospace' }} 
                                placeholder="0 8 * * 1 (Lunes 8am)" 
                            />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>Ej: <code>0 8 1 * *</code> (Día 1 del mes a las 8:00 AM)</p>
                    </div>

                    {/* DESTINATARIOS */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Destinatarios <span style={{color:'#ef4444'}}>*</span></label>
                        
                        {/* Input para agregar */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <i className='bx bx-envelope' style={iconStyle}></i>
                                <input 
                                    value={emailInput} 
                                    onChange={(e) => setEmailInput(e.target.value)} 
                                    onKeyDown={handleKeyDown}
                                    style={inputStyle} 
                                    placeholder="correo@ejemplo.com" 
                                />
                            </div>
                            <button 
                                type="button" 
                                onClick={addDestinatario}
                                style={{ padding: '0 16px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                <i className='bx bx-plus'></i>
                            </button>
                        </div>

                        {/* Lista de Chips */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '40px', padding: '10px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                            {destinatarios.length === 0 && <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Añade correos aquí...</span>}
                            {destinatarios.map((d, idx) => (
                                <div key={idx} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '4px 10px 4px 14px', fontSize: '0.85rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                    {d}
                                    <button 
                                        type="button" 
                                        onClick={() => removeDestinatario(d)} 
                                        style={{ background: '#fee2e2', border: 'none', color: '#ef4444', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1rem' }}
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </div>

        {/* MODAL DE ÉXITO */}
        {showSuccessModal && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><i className='bx bx-check' style={{ fontSize: '48px' }}></i></div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>¡Reporte Programado!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>La tarea ha sido creada y está activa.</p>
                    <button onClick={handleCloseSuccess} style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Continuar</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}