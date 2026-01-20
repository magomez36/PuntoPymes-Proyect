import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SidebarRRHH"; // Sidebar correcto
import { apiFetch } from "../../../services/api";
import "../../../assets/css/admin-empresas.css"; // Estilos globales

const UNIDADES = [
  { id: 1, label: "% (Porcentaje)" },
  { id: 2, label: "Puntos (Score)" },
  { id: 3, label: "Minutos" },
  { id: 4, label: "Horas" },
];

const ORIGENES = [
  { id: 1, label: "Asistencia (Automático)" },
  { id: 2, label: "Evaluación (Manual)" },
  { id: 3, label: "Mixto (Híbrido)" },
];

export default function CrearKPI() {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    unidad: 1,
    origen_datos: 1,
  });

  // Modal State
  const [modalConfig, setModalConfig] = useState({ show: false, type: 'success', title: '', message: '' });

  // --- HANDLERS ---
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const showModal = (type, title, message) => {
      setModalConfig({ show: true, type, title, message });
  };

  const closeModal = () => {
      setModalConfig({ ...modalConfig, show: false });
      if (modalConfig.type === 'success') {
          navigate("/rrhh/kpis");
      }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!form.codigo.trim()) return showModal('error', 'Campo Requerido', "El código del KPI es obligatorio.");
    if (!form.nombre.trim()) return showModal('error', 'Campo Requerido', "El nombre del KPI es obligatorio.");
    if (!form.descripcion.trim()) return showModal('error', 'Campo Requerido', "La descripción es obligatoria para entender el indicador.");

    const payload = {
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      unidad: Number(form.unidad),
      origen_datos: Number(form.origen_datos),
      // formula NO se envía (backend lo deja NULL)
    };

    try {
      const res = await apiFetch("/api/rrhh/kpis/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || JSON.stringify(data));
      }

      showModal('success', 'KPI Creado', 'El indicador de desempeño ha sido registrado correctamente.');
      
    } catch (e2) {
      showModal('error', 'Error', e2?.message || "No se pudo crear el KPI.");
    }
  };

  // --- ESTILOS ---
  const layoutWrapperStyle = { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', width: '100%' };
  const mainAreaStyle = { flex: 1, padding: '30px 30px 30px 110px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '25px' };
  
  const cardStyle = { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', maxWidth: '700px', width: '100%' };
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', color: '#1e293b', backgroundColor: '#fff' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', color: '#64748b', fontSize: '0.9rem' };

  return (
    <div className="layout layout-watermark" style={layoutWrapperStyle}>
      <Sidebar />
      <main style={mainAreaStyle}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Nuevo KPI</h1>
                <p style={{ color: '#64748b', marginTop: '4px', fontSize: '1rem' }}>Configura un nuevo indicador de desempeño.</p>
            </div>
            <Link to="/rrhh/kpis" style={{ display:'flex', alignItems:'center', textDecoration:'none', color:'#64748b', fontWeight:'600', gap:'5px' }}>
                <i className='bx bx-arrow-back'></i> Volver al catálogo
            </Link>
        </div>

        {/* FORMULARIO CARD */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', marginTop: '20px' }}>
            <div style={cardStyle}>
                <form onSubmit={onSubmit}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '20px' }}>
                        {/* Código */}
                        <div>
                            <label style={labelStyle}>Código <span style={{color:'#ef4444'}}>*</span></label>
                            <input 
                                name="codigo" 
                                value={form.codigo} 
                                onChange={onChange} 
                                placeholder="Ej: KPI-001" 
                                style={{ ...inputStyle, textTransform: 'uppercase', fontFamily: 'monospace' }} 
                            />
                        </div>
                        {/* Nombre */}
                        <div>
                            <label style={labelStyle}>Nombre del Indicador <span style={{color:'#ef4444'}}>*</span></label>
                            <input 
                                name="nombre" 
                                value={form.nombre} 
                                onChange={onChange} 
                                placeholder="Ej: Puntualidad Mensual" 
                                style={inputStyle} 
                            />
                        </div>
                    </div>

                    {/* Descripción */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Descripción <span style={{color:'#ef4444'}}>*</span></label>
                        <textarea 
                            name="descripcion" 
                            value={form.descripcion} 
                            onChange={onChange} 
                            rows={3} 
                            placeholder="Explica qué mide este indicador y cuál es su objetivo..."
                            style={{ ...inputStyle, resize: 'vertical' }} 
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                        {/* Unidad */}
                        <div>
                            <label style={labelStyle}>Unidad de Medida <span style={{color:'#ef4444'}}>*</span></label>
                            <select name="unidad" value={form.unidad} onChange={onChange} style={inputStyle}>
                                {UNIDADES.map((u) => (
                                    <option key={u.id} value={u.id}>{u.label}</option>
                                ))}
                            </select>
                        </div>
                        {/* Origen */}
                        <div>
                            <label style={labelStyle}>Fuente de Datos <span style={{color:'#ef4444'}}>*</span></label>
                            <select name="origen_datos" value={form.origen_datos} onChange={onChange} style={inputStyle}>
                                {ORIGENES.map((o) => (
                                    <option key={o.id} value={o.id}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Botones */}
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button 
                            type="button" 
                            onClick={() => navigate("/rrhh/kpis")} 
                            style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#D51F36', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(213, 31, 54, 0.2)' }}
                        >
                            <i className='bx bx-save'></i> Guardar KPI
                        </button>
                    </div>

                </form>
            </div>
        </div>

        {/* MODAL DE ÉXITO / ERROR */}
        {modalConfig.show && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ 
                        width: '80px', height: '80px', borderRadius: '50%', 
                        backgroundColor: modalConfig.type === 'success' ? '#dcfce7' : '#fee2e2', 
                        color: modalConfig.type === 'success' ? '#16a34a' : '#dc2626', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' 
                    }}>
                        <i className={`bx ${modalConfig.type === 'success' ? 'bx-check' : 'bx-x'}`} style={{ fontSize: '48px' }}></i>
                    </div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{modalConfig.title}</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.5', fontSize:'0.95rem' }}>{modalConfig.message}</p>
                    <button onClick={closeModal} style={{ width: '100%', padding: '12px', backgroundColor: modalConfig.type === 'success' ? '#16a34a' : '#374151', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>
                        {modalConfig.type === 'success' ? 'Continuar' : 'Cerrar'}
                    </button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}