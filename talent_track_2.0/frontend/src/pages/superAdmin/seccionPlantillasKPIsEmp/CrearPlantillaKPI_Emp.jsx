import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";
import { getAccessToken } from "../../../services/authStorage";

// Estilos
import "../../../assets/css/admin-empresas.css"; 
import "../../../assets/css/modal.css"; 

const API_BASE = "http://127.0.0.1:8000/api";

const APLICA_A_OPS = [
  { id: 1, label: "Puesto de Trabajo" },
  { id: 2, label: "Unidad Organizacional" },
  { id: 3, label: "Empleado Específico" },
];

export default function CrearPlantillaKPI_Emp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Estados de Carga
  const [loading, setLoading] = useState(true);
  const [empresas, setEmpresas] = useState([]);
  const [kpis, setKpis] = useState([]); 

  // Formulario Principal
  const [form, setForm] = useState({
    empresa_id: searchParams.get("empresa_id") || "",
    nombre: "",
    aplica_a: 1,
  });

  // Estado para Nuevo Objetivo (Temporal)
  const [objTmp, setObjTmp] = useState({
    kpi_id: "",
    meta: 0,
    umbral_rojo: 0,
    umbral_amarillo: 0,
  });

  // Lista de Objetivos Agregados
  const [objetivos, setObjetivos] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- CARGA INICIAL ---
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const token = getAccessToken();
        if (!token) return navigate("/login");

        // Cargar Empresas
        const resEmp = await apiFetch(`${API_BASE}/listado-empresas/`, { headers: { Authorization: `Bearer ${token}` } });
        if (resEmp.ok) setEmpresas(await resEmp.json());

        // Si ya hay empresa preseleccionada, cargar sus KPIs
        if (form.empresa_id) {
            await loadKPIs(form.empresa_id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate, form.empresa_id]);

  // --- CARGAR KPIs ---
  const loadKPIs = async (empresaId) => {
    setKpis([]); 
    if (!empresaId) return;
    
    try {
        const token = getAccessToken();
        const res = await apiFetch(`${API_BASE}/helpers/kpis-por-empresa/?empresa_id=${empresaId}`, { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        if (res.ok) {
            const data = await res.json();
            setKpis(Array.isArray(data) ? data : []);
        }
    } catch (e) { console.error("Error cargando KPIs", e); }
  };

  // --- HANDLERS ---
  const onChangeForm = async (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));

    if (name === "empresa_id") {
      setObjetivos([]); 
      setObjTmp({ kpi_id: "", meta: 0, umbral_rojo: 0, umbral_amarillo: 0 });
      await loadKPIs(value);
    }
  };

  const onChangeObjTmp = (e) => {
    const { name, value } = e.target;
    if (["meta", "umbral_rojo", "umbral_amarillo"].includes(name)) {
      const n = Number(value);
      if (Number.isNaN(n) || n < 0) return;
      setObjTmp(p => ({ ...p, [name]: n }));
    } else {
      setObjTmp(p => ({ ...p, [name]: value }));
    }
  };

  const agregarObjetivo = () => {
    if (!form.empresa_id) return alert("Selecciona una empresa primero.");
    if (!objTmp.kpi_id) return alert("Selecciona un KPI para el objetivo.");

    const kid = Number(objTmp.kpi_id);
    if (objetivos.some(o => o.kpi_id === kid)) return alert("Este KPI ya está agregado.");

    const nuevoObjetivo = {
      kpi_id: kid,
      meta: Number(objTmp.meta),
      umbral_rojo: Number(objTmp.umbral_rojo),
      umbral_amarillo: Number(objTmp.umbral_amarillo),
      kpi_label: kpis.find(k => k.id === kid)?.nombre 
    };

    setObjetivos([...objetivos, nuevoObjetivo]);
    setObjTmp({ kpi_id: "", meta: 0, umbral_rojo: 0, umbral_amarillo: 0 }); 
  };

  const quitarObjetivo = (kpi_id) => {
    setObjetivos(p => p.filter(o => o.kpi_id !== kpi_id));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.empresa_id) return alert("Selecciona una empresa.");
    if (!form.nombre.trim()) return alert("El nombre es obligatorio.");
    if (objetivos.length === 0) return alert("Debes agregar al menos un objetivo.");

    const payload = {
      empresa_id: Number(form.empresa_id),
      nombre: form.nombre.trim(),
      aplica_a: Number(form.aplica_a),
      objetivos: objetivos.map(o => ({ 
          kpi_id: o.kpi_id,
          meta: o.meta,
          umbral_rojo: o.umbral_rojo,
          umbral_amarillo: o.umbral_amarillo
      })),
    };

    try {
      const token = getAccessToken();
      const res = await apiFetch(`${API_BASE}/plantillas-kpi/crear/`, {
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
        alert(err?.detail || "Error al crear la plantilla.");
      }
    } catch (e) {
      alert("Error de conexión.");
    }
  };

  const handleCloseSuccess = () => {
      setShowSuccessModal(false);
      navigate("/admin/plantillas-kpi");
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
                <Link to="/admin/plantillas-kpi" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>Plantillas</Link>
                <i className='bx bx-chevron-right' style={{ fontSize: '1.2rem', margin: '0 8px' }}></i>
                <span style={{ color: '#0f172a', fontWeight: '600' }}>Nueva Plantilla</span>
            </nav>
        </header>

        <div className="content-area" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Crear Plantilla de Evaluación</h1>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '1rem' }}>Define un conjunto de objetivos para asignar a empleados o áreas.</p>
            </div>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* --- IZQUIERDA: CONFIGURACIÓN PLANTILLA --- */}
                <div style={{ flex: '1', minWidth: '400px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', padding: '32px', height: 'fit-content' }}>
                    <h4 style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '700', marginBottom: '20px', display:'flex', alignItems:'center', gap:'8px' }}>
                        <i className='bx bx-cog' style={{fontSize:'1.2rem', color:'#64748b'}}></i> Configuración General
                    </h4>

                    {/* EMPRESA */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Empresa <span style={{color:'#ef4444'}}>*</span></label>
                        <div style={{ position: 'relative' }}>
                            <i className='bx bxs-business' style={iconStyle}></i>
                            <select name="empresa_id" value={form.empresa_id} onChange={onChangeForm} style={{ ...inputStyle, appearance: 'none' }}>
                                <option value="">Seleccionar Empresa...</option>
                                {empresas.map(e => <option key={e.id} value={e.id}>{e.razon_social}</option>)}
                            </select>
                            <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                        </div>
                    </div>

                    {/* NOMBRE */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Nombre Plantilla <span style={{color:'#ef4444'}}>*</span></label>
                        <div style={{ position: 'relative' }}>
                            <i className='bx bx-tag' style={iconStyle}></i>
                            <input type="text" name="nombre" value={form.nombre} onChange={onChangeForm} required style={inputStyle} placeholder="Ej. Evaluación Ventas 2025" />
                        </div>
                    </div>

                    {/* APLICA A */}
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Nivel de Aplicación <span style={{color:'#ef4444'}}>*</span></label>
                        <div style={{ position: 'relative' }}>
                            <i className='bx bx-layer' style={iconStyle}></i>
                            <select name="aplica_a" value={form.aplica_a} onChange={onChangeForm} style={{ ...inputStyle, appearance: 'none' }}>
                                {APLICA_A_OPS.map(op => <option key={op.id} value={op.id}>{op.label}</option>)}
                            </select>
                            <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                        </div>
                    </div>

                    {/* BOTONES ACCIÓN (Guardar / Cancelar) */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Link 
                            to="/admin/plantillas-kpi"
                            style={{ 
                                flex: 1,
                                padding: '12px', 
                                borderRadius: '8px', 
                                border: '1px solid #cbd5e1', 
                                color: '#334155', 
                                textDecoration: 'none', 
                                fontWeight: 'bold', 
                                fontSize: '1rem',
                                textAlign: 'center',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent:'center'
                            }}
                        >
                            Cancelar
                        </Link>
                        <button 
                            onClick={onSubmit} 
                            style={{ 
                                flex: 2, 
                                padding: '12px', 
                                borderRadius: '8px', 
                                border: 'none', 
                                background: '#0f172a', 
                                color: 'white', 
                                fontWeight: 'bold', 
                                fontSize: '1rem', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent:'center', 
                                gap: '8px', 
                                boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.3)' 
                            }}
                        >
                            <i className='bx bx-save'></i> Guardar
                        </button>
                    </div>
                </div>

                {/* --- DERECHA: GESTOR DE OBJETIVOS --- */}
                <div style={{ flex: '2', minWidth: '500px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', padding: '32px' }}>
                    <h4 style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '700', marginBottom: '20px', display:'flex', alignItems:'center', gap:'8px' }}>
                        <i className='bx bx-target-lock' style={{fontSize:'1.2rem', color:'#dc2626'}}></i> Definición de Objetivos
                    </h4>

                    {/* FORMULARIO AGREGAR OBJETIVO */}
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.85rem' }}>Seleccionar KPI</label>
                            <select 
                                name="kpi_id" 
                                value={objTmp.kpi_id} 
                                onChange={onChangeObjTmp} 
                                disabled={!form.empresa_id}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', outline:'none', background:'white' }}
                            >
                                <option value="">-- Seleccionar KPI --</option>
                                {kpis.map(k => <option key={k.id} value={k.id}>{k.codigo} - {k.nombre}</option>)}
                            </select>
                            {!form.empresa_id && <p style={{ fontSize:'0.8rem', color:'#ef4444', margin:'4px 0 0 0' }}>Selecciona una empresa para ver sus KPIs.</p>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.85rem' }}>Meta</label>
                                <input type="number" name="meta" min="0" value={objTmp.meta} onChange={onChangeObjTmp} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db', outline:'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#dc2626', fontSize: '0.85rem' }}>Límite Rojo</label>
                                <input type="number" name="umbral_rojo" min="0" value={objTmp.umbral_rojo} onChange={onChangeObjTmp} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #fecaca', outline:'none', background:'#fef2f2' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#d97706', fontSize: '0.85rem' }}>Límite Amarillo</label>
                                <input type="number" name="umbral_amarillo" min="0" value={objTmp.umbral_amarillo} onChange={onChangeObjTmp} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #fde68a', outline:'none', background:'#fffbeb' }} />
                            </div>
                        </div>

                        <button 
                            onClick={agregarObjetivo} 
                            disabled={!form.empresa_id}
                            style={{ width:'100%', padding: '10px', borderRadius: '8px', border: 'none', background: form.empresa_id ? '#3b82f6' : '#cbd5e1', color: 'white', fontWeight: 'bold', cursor: form.empresa_id ? 'pointer' : 'not-allowed', fontSize:'0.9rem' }}
                        >
                            + Agregar Objetivo a la Lista
                        </button>
                    </div>

                    {/* TABLA DE OBJETIVOS */}
                    <div>
                        <h5 style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600', marginBottom: '12px' }}>Objetivos Agregados ({objetivos.length})</h5>
                        
                        {objetivos.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px', background: '#f1f5f9', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#94a3b8' }}>
                                <i className='bx bx-list-plus' style={{ fontSize: '2rem', marginBottom: '8px' }}></i>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>No has agregado objetivos aún.</p>
                            </div>
                        ) : (
                            <div style={{ overflow: 'hidden', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                        <tr>
                                            <th style={{ padding: '10px 16px', textAlign: 'left', color: '#475569' }}>KPI</th>
                                            <th style={{ padding: '10px', textAlign: 'center', color: '#475569' }}>Meta</th>
                                            <th style={{ padding: '10px', textAlign: 'center', color: '#dc2626' }}>Rojo</th>
                                            <th style={{ padding: '10px', textAlign: 'center', color: '#d97706' }}>Amarillo</th>
                                            <th style={{ padding: '10px', textAlign: 'center' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {objetivos.map((o, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '10px 16px', fontWeight: '600', color: '#334155' }}>{o.kpi_label || `KPI ID: ${o.kpi_id}`}</td>
                                                <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{o.meta}</td>
                                                <td style={{ padding: '10px', textAlign: 'center', color: '#dc2626' }}>{o.umbral_rojo}</td>
                                                <td style={{ padding: '10px', textAlign: 'center', color: '#d97706' }}>{o.umbral_amarillo}</td>
                                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                                    <button onClick={() => quitarObjetivo(o.kpi_id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem' }}>
                                                        <i className='bx bx-trash'></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>

        {/* MODAL DE ÉXITO */}
        {showSuccessModal && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><i className='bx bx-check' style={{ fontSize: '48px' }}></i></div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>¡Plantilla Creada!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>La plantilla ha sido guardada correctamente.</p>
                    <button onClick={handleCloseSuccess} style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Continuar</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}