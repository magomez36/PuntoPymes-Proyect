import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

export default function EditarPlantillaKPI_Emp() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados de Carga
  const [loading, setLoading] = useState(true);
  const [empresaId, setEmpresaId] = useState("");
  const [empresaNombre, setEmpresaNombre] = useState(""); // Para mostrar contexto
  const [kpis, setKpis] = useState([]); // KPIs disponibles para esa empresa

  // Formulario Principal
  const [form, setForm] = useState({
    nombre: "",
    aplica_a: 1,
  });

  // Objetivo Temporal
  const [objTmp, setObjTmp] = useState({
    kpi_id: "",
    meta: 0,
    umbral_rojo: 0,
    umbral_amarillo: 0,
  });

  // Lista de Objetivos
  const [objetivos, setObjetivos] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- CARGAR DATOS INICIALES ---
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = getAccessToken();
        if (!token) return navigate("/login");

        // 1. Cargar la Plantilla
        const res = await apiFetch(`${API_BASE}/plantillas-kpi/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error("Error cargando plantilla");
        const data = await res.json();

        setEmpresaId(String(data.empresa_id || ""));
        setEmpresaNombre(data.empresa_razon_social || "Empresa Desconocida"); 
        
        setForm({
          nombre: data.nombre || "",
          aplica_a: Number(data.aplica_a || 1),
        });

        // 2. Mapear Objetivos existentes
        const rawObjs = Array.isArray(data.objetivos) ? data.objetivos : [];
        const initialObjs = rawObjs.map(o => ({
            kpi_id: Number(o.kpi_id),
            meta: Number(o.meta),
            umbral_rojo: Number(o.umbral_rojo),
            umbral_amarillo: Number(o.umbral_amarillo),
            kpi_label: o.kpi_nombre || o.kpi_label || `KPI #${o.kpi_id}`
        }));
        setObjetivos(initialObjs);

        // 3. Cargar KPIs disponibles para esa empresa
        if (data.empresa_id) {
            await loadKPIs(data.empresa_id);
        }

      } catch (e) {
        console.error(e);
        alert("No se pudo cargar la información.");
        navigate("/admin/plantillas-kpi");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  // --- CARGAR KPIs ---
  const loadKPIs = async (eid) => {
    try {
        const token = getAccessToken();
        const res = await apiFetch(`${API_BASE}/helpers/kpis-por-empresa/?empresa_id=${eid}`, { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        if (res.ok) {
            setKpis(await res.json());
        }
    } catch (e) { console.error("Error KPIs", e); }
  };

  // --- HANDLERS ---
  const onChangeForm = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
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
    if (!objTmp.kpi_id) return alert("Selecciona un KPI.");
    const kid = Number(objTmp.kpi_id);

    if (objetivos.some(o => o.kpi_id === kid)) return alert("Este KPI ya está agregado.");

    const kpiInfo = kpis.find(k => k.id === kid);
    
    const nuevo = {
      kpi_id: kid,
      meta: Number(objTmp.meta),
      umbral_rojo: Number(objTmp.umbral_rojo),
      umbral_amarillo: Number(objTmp.umbral_amarillo),
      kpi_label: kpiInfo ? `${kpiInfo.codigo} - ${kpiInfo.nombre}` : `KPI #${kid}`
    };

    setObjetivos([...objetivos, nuevo]);
    setObjTmp({ kpi_id: "", meta: 0, umbral_rojo: 0, umbral_amarillo: 0 });
  };

  const quitarObjetivo = (kid) => {
    setObjetivos(p => p.filter(o => o.kpi_id !== kid));
  };

  // --- SUBMIT ---
  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim()) return alert("Nombre obligatorio.");
    if (!objetivos.length) return alert("Debe haber al menos 1 objetivo.");

    const payload = {
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
      const res = await apiFetch(`${API_BASE}/plantillas-kpi/${id}/`, {
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
        alert(err?.detail || "Error al actualizar.");
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
                <Link to="/admin/plantillas-kpi" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>Plantillas</Link>
                <i className='bx bx-chevron-right' style={{ fontSize: '1.2rem', margin: '0 8px' }}></i>
                <span style={{ color: '#0f172a', fontWeight: '600' }}>Editar Plantilla</span>
            </nav>
        </header>

        <div className="content-area" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Editar Plantilla</h1>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '1rem' }}>Modifica los objetivos y parámetros de evaluación.</p>
            </div>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* --- IZQUIERDA: CONFIGURACIÓN --- */}
                <div style={{ flex: '1', minWidth: '400px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', padding: '32px', height: 'fit-content' }}>
                    <h4 style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '700', marginBottom: '20px', display:'flex', alignItems:'center', gap:'8px' }}>
                        <i className='bx bx-cog' style={{fontSize:'1.2rem', color:'#64748b'}}></i> Configuración General
                    </h4>

                    {/* EMPRESA (READ ONLY) */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Empresa</label>
                        <div style={{ position: 'relative' }}>
                            <i className='bx bxs-business' style={iconStyle}></i>
                            <input type="text" value={empresaNombre} readOnly style={readOnlyStyle} />
                        </div>
                        <p style={{ fontSize:'0.75rem', color:'#94a3b8', marginTop:'4px' }}>La empresa no se puede cambiar en edición.</p>
                    </div>

                    {/* NOMBRE */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Nombre Plantilla <span style={{color:'#ef4444'}}>*</span></label>
                        <div style={{ position: 'relative' }}>
                            <i className='bx bx-tag' style={iconStyle}></i>
                            <input type="text" name="nombre" value={form.nombre} onChange={onChangeForm} required style={inputStyle} />
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

                    {/* BOTONES ACCIÓN (Identidad Corporativa: Rojo/Blanco) */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Link 
                            to="/admin/plantillas-kpi"
                            style={{ 
                                flex: 1, 
                                padding: '12px', 
                                borderRadius: '8px', 
                                border: '1px solid #dc2626', // Borde Rojo
                                color: '#dc2626', // Texto Rojo
                                background: 'white',
                                textDecoration: 'none', 
                                fontWeight: 'bold', 
                                fontSize: '1rem', 
                                textAlign: 'center', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent:'center',
                                transition: '0.2s'
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
                                background: '#dc2626', // Fondo Rojo
                                color: 'white', 
                                fontWeight: 'bold', 
                                fontSize: '1rem', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent:'center', 
                                gap: '8px', 
                                boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.3)' 
                            }}
                        >
                            <i className='bx bx-save'></i> Guardar Cambios
                        </button>
                    </div>
                </div>

                {/* --- DERECHA: GESTOR DE OBJETIVOS --- */}
                <div style={{ flex: '2', minWidth: '500px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', padding: '32px' }}>
                    <h4 style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '700', marginBottom: '20px', display:'flex', alignItems:'center', gap:'8px' }}>
                        <i className='bx bx-target-lock' style={{fontSize:'1.2rem', color:'#dc2626'}}></i> Definición de Objetivos
                    </h4>

                    {/* FORMULARIO AGREGAR */}
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.85rem' }}>Seleccionar KPI</label>
                            <select 
                                name="kpi_id" 
                                value={objTmp.kpi_id} 
                                onChange={onChangeObjTmp} 
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', outline:'none', background:'white' }}
                            >
                                <option value="">-- Seleccionar KPI --</option>
                                {kpis.map(k => <option key={k.id} value={k.id}>{k.codigo} - {k.nombre}</option>)}
                            </select>
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
                            style={{ 
                                width:'100%', 
                                padding: '10px', 
                                borderRadius: '8px', 
                                border: '1px dashed #dc2626', // Estilo "Ghost" rojo
                                background: 'white', 
                                color: '#dc2626', 
                                fontWeight: 'bold', 
                                cursor: 'pointer', 
                                fontSize:'0.9rem',
                                transition: '0.2s' 
                            }}
                        >
                            + Agregar Objetivo
                        </button>
                    </div>

                    {/* TABLA DE OBJETIVOS */}
                    <div>
                        <h5 style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600', marginBottom: '12px' }}>Objetivos Agregados ({objetivos.length})</h5>
                        
                        {objetivos.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px', background: '#f1f5f9', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#94a3b8' }}>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>Sin objetivos. Agregue uno arriba.</p>
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
                                        {objetivos.map((o, idx) => {
                                            const label = o.kpi_label || kpis.find(k => k.id === o.kpi_id)?.nombre || `KPI #${o.kpi_id}`;
                                            return (
                                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '10px 16px', fontWeight: '600', color: '#334155' }}>{label}</td>
                                                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{o.meta}</td>
                                                    <td style={{ padding: '10px', textAlign: 'center', color: '#dc2626' }}>{o.umbral_rojo}</td>
                                                    <td style={{ padding: '10px', textAlign: 'center', color: '#d97706' }}>{o.umbral_amarillo}</td>
                                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                                        <button onClick={() => quitarObjetivo(o.kpi_id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem' }}>
                                                            <i className='bx bx-trash'></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
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
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>¡Actualización Exitosa!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>Los cambios han sido guardados.</p>
                    <button onClick={handleCloseSuccess} style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Continuar</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}