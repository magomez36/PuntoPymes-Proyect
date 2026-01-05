import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { getAccessToken } from "../../../services/authStorage";
import { apiFetch } from "../../../services/api";

// Estilos
import "../../../assets/css/admin-empresas.css"; 
import "../../../assets/css/modal.css"; 

const API_BASE = "http://127.0.0.1:8000/api";

export default function CrearTipoAusenciaEmp() {
  const navigate = useNavigate();
  
  // Datos
  const [empresas, setEmpresas] = useState([]);
  
  // Formulario
  const [form, setForm] = useState({
    empresa: "",
    nombre: "",
    afecta_sueldo: false,
    requiere_soporte: false,
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- CARGA DE EMPRESAS ---
  useEffect(() => {
    const loadEmpresas = async () => {
      try {
        const token = getAccessToken();
        if (!token) return navigate("/login");

        const res = await apiFetch(`http://127.0.0.1:8000/api/listado-empresas/`, {
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
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ 
        ...p, 
        [name]: type === "checkbox" ? checked : value 
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.empresa) return alert("Selecciona una empresa.");
    if (!form.nombre.trim()) return alert("El nombre es obligatorio.");

    const payload = {
      empresa: Number(form.empresa),
      nombre: form.nombre.trim(),
      afecta_sueldo: form.afecta_sueldo,
      requiere_soporte: form.requiere_soporte,
    };

    try {
      const token = getAccessToken();
      const res = await apiFetch(`${API_BASE}/tipos-ausencias/`, {
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
        alert(err?.detail || "No se pudo crear el tipo de ausencia.");
      }
    } catch (e) {
      alert("Error de conexión.");
    }
  };

  const handleCloseSuccess = () => {
      setShowSuccessModal(false);
      navigate("/admin/tipos-ausencias");
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
                <Link to="/admin/tipos-ausencias" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>Ausencias</Link>
                <i className='bx bx-chevron-right' style={{ fontSize: '1.2rem', margin: '0 8px' }}></i>
                <span style={{ color: '#0f172a', fontWeight: '600' }}>Crear Tipo</span>
            </nav>
        </header>

        <div className="content-area" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Nuevo Tipo de Ausencia</h1>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '1rem' }}>Define las categorías de permisos que pueden solicitar los empleados.</p>
            </div>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* --- FORMULARIO --- */}
                <div style={{ flex: '2', minWidth: '600px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                    <form onSubmit={submit} style={{ padding: '32px' }}>
                        
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Datos Básicos
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            {/* EMPRESA */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Empresa <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bxs-business' style={iconStyle}></i>
                                    <select name="empresa" value={form.empresa} onChange={onChange} required style={{ ...inputStyle, appearance: 'none' }}>
                                        <option value="">Seleccionar Empresa...</option>
                                        {empresas.map(e => <option key={e.id} value={e.id}>{e.razon_social}</option>)}
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>

                            {/* NOMBRE */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Nombre del Permiso <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-tag' style={iconStyle}></i>
                                    <input type="text" name="nombre" placeholder="Ej. Permiso Médico" value={form.nombre} onChange={onChange} required style={inputStyle} />
                                </div>
                            </div>
                        </div>

                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', marginTop: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Configuración
                        </h4>

                        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', flex: 1 }}>
                                <input type="checkbox" name="afecta_sueldo" checked={form.afecta_sueldo} onChange={onChange} style={{ width: '18px', height: '18px', accentColor: '#dc2626' }} />
                                <div>
                                    <span style={{ display: 'block', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Afecta Sueldo</span>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Se descontará del pago mensual.</span>
                                </div>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', flex: 1 }}>
                                <input type="checkbox" name="requiere_soporte" checked={form.requiere_soporte} onChange={onChange} style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} />
                                <div>
                                    <span style={{ display: 'block', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Requiere Soporte</span>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Exigir archivo adjunto (ej. certificado).</span>
                                </div>
                            </label>
                        </div>

                        {/* ACCIONES */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                            <Link to="/admin/tipos-ausencias" style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#334155', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                Cancelar
                            </Link>
                            <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)' }}>
                                <i className='bx bx-save'></i> Guardar Tipo
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- PANEL INFO --- */}
                <div style={{ flex: '0 0 320px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}><i className='bx bx-info-circle' style={{ fontSize: '20px' }}></i></div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, color: '#0f172a' }}>Ejemplos Comunes</h3>
                    </div>
                    
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Permiso Médico</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            Normalmente <strong>Requiere Soporte</strong> (certificado) y <strong>No Afecta Sueldo</strong> (si es cubierto por seguridad social).
                        </p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Asuntos Personales</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            Suele configurarse para que <strong>Afecte Sueldo</strong> o se descuente de vacaciones.
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
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>¡Creado Exitosamente!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>El nuevo tipo de ausencia está listo para usarse.</p>
                    <button onClick={handleCloseSuccess} style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Continuar</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}