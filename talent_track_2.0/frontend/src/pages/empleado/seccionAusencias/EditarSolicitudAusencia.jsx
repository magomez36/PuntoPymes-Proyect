import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/SidebarEmpleado"; 
import { apiFetch } from "../../../services/api";
import "../../../assets/css/admin-empresas.css"; // Estilos globales

// --- HELPERS ---
async function safeJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { _non_json: true, raw: text };
  }
}

function calcDias(fi, ff) {
  if (!fi) return 0;
  const start = new Date(fi);
  const end = new Date(ff || fi);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff + 1 : 0;
}

// --- CALENDARIO VISUAL ---
const CalendarPreview = ({ startDateStr, endDateStr }) => {
    const [viewDate, setViewDate] = useState(new Date());

    useEffect(() => {
        if (startDateStr) {
            const [y, m, d] = startDateStr.split('-').map(Number);
            setViewDate(new Date(y, m - 1, 1));
        }
    }, [startDateStr]);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth(); 

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let startDay = new Date(year, month, 1).getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const renderDays = () => {
        const days = [];
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} style={{ height: '32px' }}></div>);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const currentStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            let bg = 'transparent';
            let color = '#64748b'; 
            let fontWeight = '400';
            const borderRadius = '50%'; 

            const start = startDateStr;
            const end = endDateStr || startDateStr; 

            if (start && currentStr === start) {
                bg = '#D51F36'; color = 'white'; fontWeight = '700'; 
            } else if (end && currentStr === end) {
                bg = '#D51F36'; color = 'white'; fontWeight = '700'; 
            } else if (start && end && currentStr > start && currentStr < end) {
                bg = '#ffe4e6'; color = '#be123c'; fontWeight = '600'; 
            }

            days.push(
                <div key={d} style={{ 
                    height: '32px', width: '32px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                    fontSize: '0.8rem', backgroundColor: bg, color: color, borderRadius: borderRadius, fontWeight: fontWeight,
                    transition: 'all 0.2s'
                }}>
                    {d}
                </div>
            );
        }
        return days;
    };

    return (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginTop: '20px', backgroundColor: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}><i className='bx bx-chevron-left' style={{fontSize:'1.2rem'}}></i></button>
                <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' }}>{monthNames[month]} {year}</span>
                <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}><i className='bx bx-chevron-right' style={{fontSize:'1.2rem'}}></i></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '8px', textAlign: 'center' }}>
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                    <span key={i} style={{ fontSize: '0.7rem', fontWeight: '700', color: '#cbd5e1' }}>{day}</span>
                ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '4px' }}>
                {renderDays()}
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
export default function EditarSolicitudAusencia() {
  const { id } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tipos, setTipos] = useState([]);

  // Estado del Modal
  const [modalConfig, setModalConfig] = useState({
    show: false,
    type: 'success', 
    title: '',
    message: ''
  });

  const [form, setForm] = useState({
    id_tipo_ausencia: "",
    fecha_inicio: "",
    fecha_fin: "",
    motivo: "",
    estado: null,
    estado_label: "",
  });

  const diasPreview = useMemo(() => {
    const fi = form.fecha_inicio;
    const ff = form.fecha_fin || form.fecha_inicio;
    return calcDias(fi, ff);
  }, [form.fecha_inicio, form.fecha_fin]);

  const loadTipos = async () => {
    const res = await apiFetch("/api/empleado/tipos-ausencia/");
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.detail || "Error cargando tipos.");
    setTipos(Array.isArray(data) ? data : []);
  };

  const loadSolicitud = async () => {
    const res = await apiFetch("/api/empleado/ausencias/");
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.detail || "Error cargando solicitudes.");

    const found = Array.isArray(data) ? data.find((x) => String(x.id) === String(id)) : null;
    if (!found) throw new Error("Solicitud no encontrada.");

    if (Number(found.estado) !== 1) {
      throw new Error("Solo puedes editar solicitudes en estado pendiente.");
    }

    setForm({
      id_tipo_ausencia: String(found.tipo_ausencia || ""),
      fecha_inicio: found.fecha_inicio || "",
      fecha_fin: found.fecha_fin || "",
      motivo: found.motivo || "",
      estado: found.estado,
      estado_label: found.estado_label || "",
    });
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await loadTipos();
        await loadSolicitud();
      } catch (e) {
        showModal('error', 'Error de Carga', e?.message || "No se pudo cargar la solicitud.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => {
      const next = { ...p, [name]: value };
      if (name === "fecha_inicio" && next.fecha_fin) {
        if (new Date(next.fecha_fin) < new Date(value)) next.fecha_fin = "";
      }
      return next;
    });
  };

  const showModal = (type, title, message) => {
      setModalConfig({ show: true, type, title, message });
  };

  const closeModal = () => {
      setModalConfig({ ...modalConfig, show: false });
      if (modalConfig.type === 'success') {
          nav("/empleado/ausencias");
      }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.id_tipo_ausencia) return showModal('error', 'Faltan datos', "Selecciona un tipo de ausencia.");
    if (!form.fecha_inicio) return showModal('error', 'Faltan datos', "Selecciona fecha de inicio.");
    if (!form.motivo.trim()) return showModal('error', 'Faltan datos', "El motivo es obligatorio.");
    if (form.fecha_fin && new Date(form.fecha_fin) < new Date(form.fecha_inicio)) {
      return showModal('error', 'Fechas inválidas', "La fecha de fin no puede ser menor a fecha de inicio.");
    }

    const payload = {
      id_tipo_ausencia: Number(form.id_tipo_ausencia),
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin ? form.fecha_fin : null,
      motivo: form.motivo.trim(),
    };

    try {
      const res = await apiFetch(`/api/empleado/ausencias/${id}/`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);
      if (!res.ok) {
        const msg = data?._non_json ? "Error de servidor." : (data?.detail || JSON.stringify(data || {}));
        throw new Error(msg);
      }

      showModal('success', '¡Actualización Exitosa!', 'Tu solicitud ha sido modificada correctamente.');
      
    } catch (e2) {
      showModal('error', 'Error al guardar', e2?.message || "No se pudo actualizar la solicitud.");
    }
  };

  // --- ESTILOS ---
  const layoutWrapperStyle = {
    display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', width: '100%',
  };

  const mainAreaStyle = {
    flex: 1,
    padding: '30px 30px 30px 110px', 
    position: 'relative', zIndex: 1,
    display: 'flex', flexDirection: 'column', gap: '25px'
  };

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', color: '#1f2937' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' };

  return (
    <div className="layout layout-watermark" style={layoutWrapperStyle}>
      <Sidebar />
      <main style={mainAreaStyle}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Editar Solicitud</h1>
                <p style={{ color: '#64748b', marginTop: '4px', fontSize: '1rem' }}>Modifica los detalles de tu ausencia.</p>
            </div>
            <Link to="/empleado/ausencias" style={{ display:'flex', alignItems:'center', textDecoration:'none', color:'#64748b', fontWeight:'600', gap:'5px' }}>
                <i className='bx bx-arrow-back'></i> Volver
            </Link>
        </div>

        {loading ? (
             <p style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>Cargando...</p>
        ) : (
            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* TARJETA FORMULARIO */}
                <div style={{ flex: '2', minWidth: '400px', backgroundColor: '#fff', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <form onSubmit={onSubmit}>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Tipo de Ausencia <span style={{color:'#ef4444'}}>*</span></label>
                            <select name="id_tipo_ausencia" value={form.id_tipo_ausencia} onChange={onChange} style={inputStyle} required>
                                <option value="">-- Selecciona una opción --</option>
                                {tipos.map((t) => (
                                    <option key={t.id} value={t.id}>{t.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <label style={labelStyle}>Fecha Inicio <span style={{color:'#ef4444'}}>*</span></label>
                                <input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={onChange} style={inputStyle} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Fecha Fin <span style={{color:'#94a3b8', fontWeight:'400'}}>(Opcional)</span></label>
                                <input 
                                    type="date" 
                                    name="fecha_fin" 
                                    value={form.fecha_fin} 
                                    onChange={onChange} 
                                    min={form.fecha_inicio || undefined} 
                                    style={inputStyle} 
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Motivo / Justificación <span style={{color:'#ef4444'}}>*</span></label>
                            <textarea 
                                name="motivo" 
                                value={form.motivo} 
                                onChange={onChange} 
                                rows="4" 
                                style={{ ...inputStyle, resize: 'vertical' }}
                                required
                            />
                        </div>

                        <div style={{ marginTop: '30px', borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                            <Link to="/empleado/ausencias" style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#334155', textDecoration: 'none', fontWeight: '600' }}>Cancelar</Link>
                            
                            <button 
                                type="submit" 
                                style={{ 
                                    padding: '10px 24px', borderRadius: '8px', border: 'none', 
                                    backgroundColor: '#D51F36', // Rojo Talentrack
                                    color: 'white', fontWeight: '600', cursor: 'pointer',
                                    boxShadow: '0 4px 6px rgba(213, 31, 54, 0.2)'
                                }}
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>

                {/* PANEL LATERAL */}
                <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#fff', borderRadius: '16px', padding: '25px', border: '1px solid #e2e8f0' }}>
                    <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '5px' }}>Resumen de Fechas</h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Vista previa de la modificación.</p>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Días Totales</span>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: diasPreview > 0 ? '#D51F36' : '#cbd5e1', lineHeight: '1' }}>
                            {diasPreview}
                        </div>
                    </div>

                    <CalendarPreview 
                        startDateStr={form.fecha_inicio} 
                        endDateStr={form.fecha_fin} 
                    />
                </div>

            </div>
        )}

        {/* --- MODAL --- */}
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
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{modalConfig.title}</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.5' }}>{modalConfig.message}</p>
                    <button 
                        onClick={closeModal} 
                        style={{ 
                            width: '100%', padding: '12px', 
                            backgroundColor: modalConfig.type === 'success' ? '#16a34a' : '#dc2626', 
                            color: 'white', border: 'none', borderRadius: '8px', 
                            fontWeight: '600', cursor: 'pointer', fontSize: '1rem' 
                        }}
                    >
                        {modalConfig.type === 'success' ? 'Continuar' : 'Cerrar'}
                    </button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}