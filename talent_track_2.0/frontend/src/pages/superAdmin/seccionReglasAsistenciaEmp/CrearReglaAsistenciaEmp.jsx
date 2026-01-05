import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { getAccessToken } from "../../../services/authStorage";
import { apiFetch } from "../../../services/api";

// Estilos
import "../../../assets/css/admin-empresas.css"; 
import "../../../assets/css/modal.css"; 

const API_BASE = "http://127.0.0.1:8000";

export default function CrearReglaAsistenciaEmp() {
  const navigate = useNavigate();
  
  // Datos
  const [empresas, setEmpresas] = useState([]);
  
  // Formulario
  const [form, setForm] = useState({
    empresa: "",
    considera_tardanza_desde_min: 0,
    calculo_horas_extra: "1", // String para el select, se convierte al enviar
  });

  // Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- CARGA DE EMPRESAS ---
  useEffect(() => {
    const loadEmpresas = async () => {
      try {
        const token = getAccessToken();
        if (!token) return navigate("/login");

        const res = await apiFetch(`${API_BASE}/api/listado-empresas/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            const data = await res.json();
            setEmpresas(data);
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
    setForm((p) => ({ ...p, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();

    const tardanza = parseInt(form.considera_tardanza_desde_min, 10);
    
    // Validaciones
    if (!form.empresa) return alert("Selecciona una empresa.");
    if (Number.isNaN(tardanza) || tardanza < 0) return alert("El umbral de tardanza debe ser un número positivo.");

    const payload = {
      empresa: parseInt(form.empresa, 10),
      considera_tardanza_desde_min: tardanza,
      calculo_horas_extra: parseInt(form.calculo_horas_extra, 10),
    };

    try {
      const token = getAccessToken();
      const res = await apiFetch(`${API_BASE}/api/reglas-asistencia/crear/`, {
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
        const data = await res.json().catch(() => ({}));
        alert(data?.detail || "Error creando la regla. Verifique si la empresa ya tiene una regla asignada.");
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
  const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.25rem', pointerEvents: 'none' };

  return (
    <div className="layout" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER */}
        <header style={{ background: 'white', padding: '0 32px', borderBottom: '1px solid #e2e8f0', height: '64px', display: 'flex', alignItems: 'center' }}>
            <nav style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                <Link to="/admin/reglas-asistencia" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>Reglas</Link>
                <i className='bx bx-chevron-right' style={{ fontSize: '1.2rem', margin: '0 8px' }}></i>
                <span style={{ color: '#0f172a', fontWeight: '600' }}>Crear Regla</span>
            </nav>
        </header>

        <div className="content-area" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Nueva Configuración de Asistencia</h1>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '1rem' }}>Define los parámetros globales para el control de asistencia de una empresa.</p>
            </div>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* --- FORMULARIO --- */}
                <div style={{ flex: '2', minWidth: '600px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                    <form onSubmit={submit} style={{ padding: '32px' }}>
                        
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Asignación
                        </h4>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Empresa <span style={{color:'#ef4444'}}>*</span></label>
                            <div style={{ position: 'relative' }}>
                                <i className='bx bxs-business' style={iconStyle}></i>
                                <select name="empresa" value={form.empresa} onChange={onChange} required style={{ ...inputStyle, appearance: 'none' }}>
                                    <option value="">Seleccionar Empresa...</option>
                                    {empresas.map(e => <option key={e.id} value={e.id}>{e.razon_social}</option>)}
                                </select>
                                <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>Solo puedes crear una configuración por empresa.</p>
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
                                        <option value="1">Corte Diario (Por Jornada)</option>
                                        <option value="2">Corte Semanal (Por Total)</option>
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
                                <i className='bx bx-save'></i> Guardar Regla
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- PANEL INFO --- */}
                <div style={{ flex: '0 0 320px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}><i className='bx bx-help-circle' style={{ fontSize: '20px' }}></i></div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, color: '#0f172a' }}>Ayuda de Conceptos</h3>
                    </div>
                    
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Umbral de Tardanza</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            Tiempo (en minutos) después de la hora de entrada y tolerancia del turno, a partir del cual se marca como "Atraso". Si pones 0, cualquier minuto extra cuenta.
                        </p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Cálculo de Horas Extra</h4>
                        <ul style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0, paddingLeft: '20px' }}>
                            <li style={{marginBottom:'6px'}}><strong>Diario:</strong> Se calculan si se excede la jornada del día.</li>
                            <li><strong>Semanal:</strong> Se acumulan y calculan si se excede el total de horas de la semana (ej: 40h).</li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>

        {/* MODAL DE ÉXITO */}
        {showSuccessModal && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><i className='bx bx-check' style={{ fontSize: '48px' }}></i></div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>¡Regla Creada!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>La política de asistencia ha sido aplicada correctamente.</p>
                    <button onClick={handleCloseSuccess} style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Continuar</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}