import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { getAccessToken } from "../../../services/authStorage";
import { apiFetch } from "../../../services/api";

// Estilos
import "../../../assets/css/admin-empresas.css"; 
import "../../../assets/css/modal.css"; 

const API_BASE = "http://127.0.0.1:8000/api";

// Catálogos estáticos (Frontend)
const UNIDADES = [
  { id: 1, label: "Porcentaje (%)" },
  { id: 2, label: "Puntos / Score" },
  { id: 3, label: "Minutos" },
  { id: 4, label: "Horas" },
];

const ORIGEN = [
  { id: 1, label: "Manual (Evaluación)" },
  { id: 2, label: "Sistema (Asistencia)" },
  { id: 3, label: "Mixto / Calculado" },
];

export default function CrearKPI_Emp() {
  const navigate = useNavigate();
  
  // Datos
  const [empresas, setEmpresas] = useState([]);
  
  // Formulario
  const [form, setForm] = useState({
    empresa: "",
    codigo: "",
    nombre: "",
    descripcion: "",
    unidad: 1,
    origen_datos: 1,
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- CARGAR EMPRESAS ---
  useEffect(() => {
    const loadEmpresas = async () => {
      try {
        const token = getAccessToken();
        if (!token) return navigate("/login");

        const res = await apiFetch(`${API_BASE}/listado-empresas/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            const data = await res.json();
            setEmpresas(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadEmpresas();
  }, [navigate]);

  // --- HANDLERS ---
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.empresa) return alert("Selecciona una empresa.");
    if (!form.codigo.trim()) return alert("El código es obligatorio.");
    if (!form.nombre.trim()) return alert("El nombre es obligatorio.");

    const payload = {
      empresa: Number(form.empresa),
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      unidad: Number(form.unidad),
      origen_datos: Number(form.origen_datos),
    };

    try {
      const token = getAccessToken();
      const res = await apiFetch(`${API_BASE}/kpis/`, {
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
        alert(err?.detail || "No se pudo crear el KPI.");
      }
    } catch (e) {
      alert("Error de conexión.");
    }
  };

  const handleCloseSuccess = () => {
      setShowSuccessModal(false);
      navigate("/admin/kpis");
  };

  // Estilos
  const inputStyle = { width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', color: '#1f2937', transition: 'border-color 0.2s', backgroundColor: '#f8fafc' };
  const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.25rem', pointerEvents: 'none' };
  const textareaStyle = { ...inputStyle, padding: '10px 12px', minHeight: '80px', resize: 'vertical' };

  return (
    <div className="layout" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER */}
        <header style={{ background: 'white', padding: '0 32px', borderBottom: '1px solid #e2e8f0', height: '64px', display: 'flex', alignItems: 'center' }}>
            <nav style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                <Link to="/admin/kpis" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>KPIs</Link>
                <i className='bx bx-chevron-right' style={{ fontSize: '1.2rem', margin: '0 8px' }}></i>
                <span style={{ color: '#0f172a', fontWeight: '600' }}>Crear Indicador</span>
            </nav>
        </header>

        <div className="content-area" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Nuevo KPI</h1>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '1rem' }}>Define los métricas clave de desempeño para la organización.</p>
            </div>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* --- IZQUIERDA: FORMULARIO --- */}
                <div style={{ flex: '2', minWidth: '600px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                    <form onSubmit={submit} style={{ padding: '32px' }}>
                        
                        {/* LEYENDA */}
                        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'24px', fontSize:'0.85rem', color:'#64748b', background:'#f1f5f9', padding:'8px 12px', borderRadius:'6px', border:'1px solid #e2e8f0', width:'fit-content' }}>
                            <i className='bx bx-info-circle' style={{fontSize:'1.1rem', color:'#3b82f6'}}></i>
                            <span>Los campos con <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize:'1rem' }}>*</span> son obligatorios.</span>
                        </div>

                        {/* SECCIÓN 1: Contexto */}
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Contexto Organizacional
                        </h4>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Empresa Asignada <span style={{color:'#ef4444'}}>*</span></label>
                            <div style={{ position: 'relative' }}>
                                <i className='bx bxs-business' style={iconStyle}></i>
                                <select name="empresa" value={form.empresa} onChange={onChange} required style={{ ...inputStyle, appearance: 'none' }}>
                                    <option value="">Seleccionar Empresa...</option>
                                    {empresas.map(e => <option key={e.id} value={e.id}>{e.razon_social}</option>)}
                                </select>
                                <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                            </div>
                        </div>

                        {/* SECCIÓN 2: Definición */}
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Definición del Indicador
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '24px' }}>
                            {/* CÓDIGO */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Código <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-hash' style={iconStyle}></i>
                                    <input 
                                        type="text" 
                                        name="codigo" 
                                        value={form.codigo} 
                                        onChange={onChange} 
                                        required 
                                        style={inputStyle} 
                                        placeholder="Ej. KPI-001" 
                                    />
                                </div>
                            </div>

                            {/* NOMBRE */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Nombre del Indicador <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-tag-alt' style={iconStyle}></i>
                                    <input 
                                        type="text" 
                                        name="nombre" 
                                        value={form.nombre} 
                                        onChange={onChange} 
                                        required 
                                        style={inputStyle} 
                                        placeholder="Ej. Puntualidad Mensual" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Descripción / Objetivo</label>
                            <textarea name="descripcion" value={form.descripcion} onChange={onChange} style={textareaStyle} placeholder="Describe qué mide este indicador..." />
                        </div>

                        {/* SECCIÓN 3: Configuración */}
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Parámetros de Medición
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            {/* UNIDAD */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Unidad de Medida</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-ruler' style={iconStyle}></i>
                                    <select name="unidad" value={form.unidad} onChange={onChange} style={{ ...inputStyle, appearance: 'none' }}>
                                        {UNIDADES.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>

                            {/* ORIGEN */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Origen de Datos</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-data' style={iconStyle}></i>
                                    <select name="origen_datos" value={form.origen_datos} onChange={onChange} style={{ ...inputStyle, appearance: 'none' }}>
                                        {ORIGEN.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>
                        </div>

                        {/* ACCIONES */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                            <Link to="/admin/kpis" style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#334155', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>Cancelar</Link>
                            <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)' }}>
                                <i className='bx bx-save'></i> Guardar KPI
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- DERECHA: PANEL DE TIPS --- */}
                <div style={{ flex: '0 0 320px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}><i className='bx bx-bulb' style={{ fontSize: '20px' }}></i></div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, color: '#0f172a' }}>Guía de Configuración</h3>
                    </div>
                    
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Código Único</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            Use un código corto y único (ej. <code>AST-01</code>) para identificar este indicador en reportes y fórmulas.
                        </p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Origen de Datos</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            <strong>Sistema:</strong> Se calcula automáticamente (ej. % de Asistencia).<br/>
                            <strong>Manual:</strong> Requiere que un supervisor ingrese el valor periódicamente.
                        </p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Unidad</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            Define cómo se mostrará el valor en los dashboards (ej. 95% vs 40 horas).
                        </p>
                    </div>
                </div>

            </div>
        </div>

        {/* MODAL DE ÉXITO */}
        {showSuccessModal && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><i className='bx bx-check' style={{ fontSize: '48px' }}></i></div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>¡KPI Creado!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>El indicador ha sido registrado exitosamente.</p>
                    <button onClick={handleCloseSuccess} style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Continuar</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}