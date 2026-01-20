import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/SidebarRRHH"; // Sidebar correcto
import { apiFetch } from "../../../services/api";
import "../../../assets/css/admin-empresas.css"; // Estilos globales

export default function CrearAsignacionKPI() {
  const navigate = useNavigate();

  const [empleados, setEmpleados] = useState([]);
  const [plantillas, setPlantillas] = useState([]);

  const [empleadoId, setEmpleadoId] = useState("");
  const [plantillaId, setPlantillaId] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState(""); // opcional

  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalConfig, setModalConfig] = useState({ show: false, type: 'success', title: '', message: '' });

  // --- CARGA DE DATOS ---
  const loadHelpers = async () => {
    setLoading(true);
    try {
      const [resE, resP] = await Promise.all([
        apiFetch("/api/rrhh/kpi/helpers/empleados/"),
        apiFetch("/api/rrhh/kpi/helpers/plantillas/"),
      ]);

      const dataE = await resE.json().catch(() => []);
      const dataP = await resP.json().catch(() => []);

      if (!resE.ok) throw new Error(dataE?.detail || "No se pudo cargar empleados.");
      if (!resP.ok) throw new Error(dataP?.detail || "No se pudo cargar plantillas KPI.");

      setEmpleados(Array.isArray(dataE) ? dataE : []);
      setPlantillas(Array.isArray(dataP) ? dataP : []);
    } catch (e) {
      showModal('error', 'Error', e?.message || "Error cargando datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHelpers();
  }, []);

  // --- HANDLERS ---
  const showModal = (type, title, message) => {
      setModalConfig({ show: true, type, title, message });
  };

  const closeModal = () => {
      setModalConfig({ ...modalConfig, show: false });
      if (modalConfig.type === 'success') {
          navigate("/rrhh/kpi/asignaciones");
      }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!empleadoId) return showModal('error', 'Faltan datos', "Debe seleccionar un empleado.");
    if (!plantillaId) return showModal('error', 'Faltan datos', "Debe seleccionar una plantilla KPI.");
    if (!desde) return showModal('error', 'Faltan datos', "Debe seleccionar la fecha 'desde'.");

    try {
      const res = await apiFetch("/api/rrhh/kpi/asignaciones/", {
        method: "POST",
        body: JSON.stringify({
          empleado_id: Number(empleadoId),
          plantilla_id: Number(plantillaId),
          desde,
          hasta: hasta ? hasta : null,
        }),
      });

      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out?.detail || JSON.stringify(out));

      showModal('success', 'Asignación Creada', 'La plantilla de objetivos ha sido vinculada al colaborador.');
      
    } catch (e2) {
      showModal('error', 'Error', e2?.message || "No se pudo crear la asignación.");
    }
  };

  // --- ESTILOS ---
  const layoutWrapperStyle = { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', width: '100%' };
  const mainAreaStyle = { flex: 1, padding: '30px 30px 30px 110px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '25px' };
  
  const cardStyle = { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', maxWidth: '600px', width: '100%' };
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', color: '#1e293b', backgroundColor: '#fff' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', color: '#64748b', fontSize: '0.9rem' };

  return (
    <div className="layout layout-watermark" style={layoutWrapperStyle}>
      <Sidebar />
      <main style={mainAreaStyle}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Crear Asignación</h1>
                <p style={{ color: '#64748b', marginTop: '4px', fontSize: '1rem' }}>Vincula objetivos a un colaborador.</p>
            </div>
            <Link to="/rrhh/kpi/asignaciones" style={{ display:'flex', alignItems:'center', textDecoration:'none', color:'#64748b', fontWeight:'600', gap:'5px' }}>
                <i className='bx bx-arrow-back'></i> Volver
            </Link>
        </div>

        {/* LOADING STATE */}
        {loading && <p style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>Cargando datos...</p>}

        {/* FORMULARIO CARD */}
        {!loading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', marginTop: '20px' }}>
                <div style={cardStyle}>
                    <form onSubmit={submit}>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Empleado <span style={{color:'#ef4444'}}>*</span></label>
                            <select 
                                value={empleadoId} 
                                onChange={(e) => setEmpleadoId(e.target.value)} 
                                style={inputStyle}
                            >
                                <option value="">-- Seleccione Colaborador --</option>
                                {empleados.map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.nombres} {e.apellidos} ({e.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={labelStyle}>Plantilla KPI <span style={{color:'#ef4444'}}>*</span></label>
                            <select 
                                value={plantillaId} 
                                onChange={(e) => setPlantillaId(e.target.value)} 
                                style={inputStyle}
                            >
                                <option value="">-- Seleccione Plantilla --</option>
                                {plantillas.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                            <div>
                                <label style={labelStyle}>Desde <span style={{color:'#ef4444'}}>*</span></label>
                                <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Hasta (Opcional)</label>
                                <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} style={inputStyle} />
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button 
                                type="button" 
                                onClick={() => navigate("/rrhh/kpi/asignaciones")} 
                                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#D51F36', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(213, 31, 54, 0.2)' }}
                            >
                                <i className='bx bx-check-circle'></i> Crear Asignación
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        )}

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