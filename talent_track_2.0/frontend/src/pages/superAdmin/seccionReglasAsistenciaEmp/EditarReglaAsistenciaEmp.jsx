import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { getAccessToken } from "../../../services/authStorage";
import { apiFetch } from "../../../services/api";

// Estilos
import "../../../assets/css/admin-empresas.css"; 
import "../../../assets/css/modal.css"; 

const API_BASE = "http://127.0.0.1:8000";

export default function EditarReglaAsistenciaEmp() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [empresaLabel, setEmpresaLabel] = useState("");
  
  const [form, setForm] = useState({
    considera_tardanza_desde_min: 0,
    calculo_horas_extra: 1,
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const load = async () => {
      try {
        const token = getAccessToken();
        if (!token) return navigate("/login");

        const res = await apiFetch(`${API_BASE}/api/reglas-asistencia/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("No se pudo cargar la regla.");
        const data = await res.json();

        setEmpresaLabel(data.empresa_razon_social || "Empresa no identificada");
        
        setForm({
          considera_tardanza_desde_min: data.considera_tardanza_desde_min ?? 0,
          calculo_horas_extra: data.calculo_horas_extra ?? 1,
        });
        
        setLoading(false);

      } catch (e) {
        console.error(e);
        alert("Error cargando la regla.");
        navigate("/admin/reglas-asistencia");
      }
    };
    load();
  }, [id, navigate]);

  // --- HANDLERS ---
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();

    const tardanza = parseInt(form.considera_tardanza_desde_min, 10);
    if (Number.isNaN(tardanza) || tardanza < 0) return alert("El umbral de tardanza debe ser un número positivo.");

    const payload = {
      considera_tardanza_desde_min: tardanza,
      calculo_horas_extra: parseInt(form.calculo_horas_extra, 10),
    };

    try {
      const token = getAccessToken();
      const res = await apiFetch(`${API_BASE}/api/reglas-asistencia/${id}/actualizar/`, {
        method: "PUT",
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
        alert(err?.detail || "Error actualizando la regla.");
      }
    } catch (e) {
      alert("Error de conexión.");
    }
  };

  const handleCloseSuccess = () => {
      setShowSuccessModal(false);
      navigate("/admin/reglas-asistencia");
  };

  // Estilos
  const inputStyle = { width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', color: '#1f2937', transition: 'border-color 0.2s', backgroundColor: 'white' };
  const readOnlyStyle = { ...inputStyle, backgroundColor: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' };
  const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.25rem', pointerEvents: 'none' };

  if (loading) return <div className="layout" style={{justifyContent:'center', alignItems:'center', background:'#f8fafc'}}>Cargando...</div>;

  return (
    <div className="layout" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER */}
        <header style={{ background: 'white', padding: '0 32px', borderBottom: '1px solid #e2e8f0', height: '64px', display: 'flex', alignItems: 'center' }}>
            <nav style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                <Link to="/admin/reglas-asistencia" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>Reglas</Link>
                <i className='bx bx-chevron-right' style={{ fontSize: '1.2rem', margin: '0 8px' }}></i>
                <span style={{ color: '#0f172a', fontWeight: '600' }}>Editar Regla</span>
            </nav>
        </header>

        <div className="content-area" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Editar Configuración</h1>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '1rem' }}>Modifica los parámetros de control de asistencia para esta empresa.</p>
            </div>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* --- FORMULARIO --- */}
                <div style={{ flex: '2', minWidth: '600px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                    <form onSubmit={submit} style={{ padding: '32px' }}>
                        
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Empresa Asociada
                        </h4>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Empresa</label>
                            <div style={{ position: 'relative' }}>
                                <i className='bx bxs-business' style={iconStyle}></i>
                                <input 
                                    type="text" 
                                    value={empresaLabel} 
                                    readOnly 
                                    style={readOnlyStyle} 
                                />
                            </div>
                        </div>

                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', marginTop: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Parámetros de Cálculo
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            {/* TARDANZA */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Umbral de Tardanza (Min) <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-timer' style={iconStyle}></i>
                                    <input 
                                        type="number" 
                                        min="0"
                                        name="considera_tardanza_desde_min" 
                                        value={form.considera_tardanza_desde_min} 
                                        onChange={onChange} 
                                        required
                                        style={inputStyle} 
                                    />
                                </div>
                            </div>

                            {/* HORAS EXTRA */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Cálculo de Horas Extra</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-stopwatch' style={iconStyle}></i>
                                    <select 
                                        name="calculo_horas_extra" 
                                        value={form.calculo_horas_extra} 
                                        onChange={onChange}
                                        style={{ ...inputStyle, appearance: 'none' }}
                                    >
                                        <option value="1">Tope diario</option>
                                        <option value="2">Tope semanal</option>
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>
                        </div>

                        {/* ACCIONES */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                            <Link to="/admin/reglas-asistencia" style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#334155', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                Cancelar
                            </Link>
                            <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)' }}>
                                <i className='bx bx-save'></i> Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- PANEL INFO --- */}
                <div style={{ flex: '0 0 320px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}><i className='bx bx-edit' style={{ fontSize: '20px' }}></i></div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, color: '#0f172a' }}>Modo Edición</h3>
                    </div>
                    
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Impacto Inmediato</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            Los cambios realizados aquí se aplicarán a los cálculos de asistencia a partir del siguiente registro de marcación o cierre de periodo.
                        </p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Empresa Bloqueada</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            La regla pertenece a la empresa y no puede transferirse. Si necesita cambiar la empresa, elimine esta regla y cree una nueva.
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
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>¡Actualización Exitosa!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>La configuración de asistencia ha sido actualizada.</p>
                    <button onClick={handleCloseSuccess} style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Continuar</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}