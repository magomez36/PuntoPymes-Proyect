import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiFetch } from "../../../services/api";
import { getAccessToken } from "../../../services/authStorage";
import Sidebar from "../../../components/Sidebar";
import "../../../assets/css/admin-empresas.css"; 

const API_BASE = "http://127.0.0.1:8000";

export default function EditarUnidadOrgEmp() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [unidadesEmpresa, setUnidadesEmpresa] = useState([]); // Lista para elegir padre
  const [nombreEmpresa, setNombreEmpresa] = useState("Cargando..."); // Solo lectura
  const [modal, setModal] = useState({ show: false, type: 'success', title: '', msg: '' });

  const [form, setForm] = useState({
    empresa_id: "",
    unidad_padre: "",
    nombre: "",
    tipo: "3",
    ubicacion: "",
    estado: "1",
  });

  const tiposOrganizacion = [
    { id: "1", label: "Sede / Sucursal" },
    { id: "2", label: "Área / División" },
    { id: "3", label: "Departamento" },
    { id: "4", label: "Equipo / Unidad" },
  ];

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const loadData = async () => {
        try {
            const token = getAccessToken();
            if (!token) { navigate("/login"); return; }
            const headers = { Authorization: `Bearer ${token}` };

            // 1. Obtener detalles de la unidad actual
            const resUnit = await apiFetch(`${API_BASE}/api/unidades-organizacionales/${id}/`, { headers });
            if (!resUnit.ok) throw new Error("No se pudo cargar la unidad");
            const data = await resUnit.json();

            // 2. Obtener lista de unidades de la misma empresa (para el select de padres)
            const resUnidades = await apiFetch(`${API_BASE}/api/unidades-organizacionales/?empresa_id=${data.empresa}`, { headers });
            
            if (resUnidades.ok) {
                const listaUnidades = await resUnidades.json();
                
                // IMPORTANTE: Filtrar para que la unidad NO pueda ser su propio padre
                const filtradas = listaUnidades.filter(u => String(u.id) !== String(id));
                setUnidadesEmpresa(filtradas);
                
                // Obtener nombre de empresa para mostrarlo (usamos el del primer elemento o el ID si falla)
                if (listaUnidades.length > 0 && listaUnidades[0].empresa_nombre) {
                    setNombreEmpresa(listaUnidades[0].empresa_nombre);
                } else {
                    setNombreEmpresa(`Empresa ID: ${data.empresa}`);
                }
            }

            // 3. Setear Formulario
            setForm({
                empresa_id: data.empresa,
                unidad_padre: data.unidad_padre ? String(data.unidad_padre) : "",
                nombre: data.nombre || "",
                tipo: String(data.tipo || "3"),
                ubicacion: data.ubicacion || "",
                estado: String(data.estado || "1"),
            });

            setLoading(false);

        } catch (e) {
            showModal('error', 'Error', "No se pudieron cargar los datos.");
            navigate("/admin/unidades-organizacionales");
        }
    };
    loadData();
  }, [id, navigate]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const showModal = (type, title, msg) => setModal({ show: true, type, title, msg });
  const closeModal = () => {
      setModal({ ...modal, show: false });
      if (modal.type === 'success') navigate("/admin/unidades-organizacionales");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getAccessToken();

    const payload = {
        empresa: parseInt(form.empresa_id),
        unidad_padre: form.unidad_padre ? parseInt(form.unidad_padre, 10) : null,
        nombre: form.nombre,
        tipo: parseInt(form.tipo, 10),
        ubicacion: form.ubicacion,
        estado: parseInt(form.estado, 10),
    };

    try {
        const res = await apiFetch(`${API_BASE}/api/unidades-organizacionales/${id}/`, {
            method: "PUT",
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.detail || "Error al actualizar");
        }

        showModal('success', 'Actualización Exitosa', 'La unidad organizacional ha sido modificada correctamente.');

    } catch (e) {
        showModal('error', 'Error', "No se pudo actualizar la unidad.");
    }
  };

  // --- ESTILOS ---
  const inputStyle = { width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', backgroundColor: 'white', color: '#1f2937' };
  const readOnlyStyle = { ...inputStyle, backgroundColor: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' };
  const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.25rem', pointerEvents: 'none' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' };

  return (
    <div className="layout layout-watermark" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, padding: '30px 30px 30px 110px' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Editar Unidad</h1>
                <p style={{ color: '#64748b', marginTop: '4px', fontSize: '1rem' }}>Modifica la configuración existente.</p>
            </div>
            <Link to="/admin/unidades-organizacionales" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className='bx bx-arrow-back'></i> Volver
            </Link>
        </div>

        {loading ? <p style={{textAlign:'center', color:'#64748b'}}>Cargando...</p> : (
            
            // LAYOUT FLEX PARA EL DISEÑO DE 2 COLUMNAS
            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* COLUMNA 1: FORMULARIO (ANCHO FLEXIBLE) */}
                <div style={{ flex: '1 1 500px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <form onSubmit={handleSubmit}>
                        
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Datos Básicos</h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            <div>
                                <label style={labelStyle}>Empresa</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bxs-business' style={iconStyle}></i>
                                    <input type="text" value={nombreEmpresa} readOnly style={readOnlyStyle} />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Nombre <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-sitemap' style={iconStyle}></i>
                                    <input type="text" name="nombre" value={form.nombre} onChange={onChange} required style={inputStyle} />
                                </div>
                            </div>
                        </div>

                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', marginTop: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Configuración</h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            <div>
                                <label style={labelStyle}>Unidad Padre (Opcional)</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-git-branch' style={iconStyle}></i>
                                    <select name="unidad_padre" value={form.unidad_padre} onChange={onChange} style={{ ...inputStyle, appearance: 'none' }}>
                                        <option value="">-- Nivel Raíz --</option>
                                        {unidadesEmpresa.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Tipo <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-tag-alt' style={iconStyle}></i>
                                    <select name="tipo" value={form.tipo} onChange={onChange} required style={{ ...inputStyle, appearance: 'none' }}>
                                        {tiposOrganizacion.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}> 
                                <label style={labelStyle}>Ubicación Física</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-map' style={iconStyle}></i>
                                    <input type="text" name="ubicacion" value={form.ubicacion} onChange={onChange} style={inputStyle} />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                            <button type="button" onClick={() => navigate("/admin/unidades-organizacionales")} style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#334155', fontWeight: '600', cursor:'pointer' }}>Cancelar</button>
                            <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', fontWeight: '600', cursor:'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className='bx bx-save'></i> Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>

                {/* COLUMNA 2: GUÍA (ANCHO FIJO 320PX) */}
                <div style={{ flex: '0 0 320px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', padding: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}><i className='bx bx-edit' style={{ fontSize: '1.2rem' }}></i></div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, color: '#0f172a' }}>Modo Edición</h3>
                    </div>
                    
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Restricciones</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                            La <strong>Empresa</strong> propietaria es fija y no se puede transferir. Si necesita mover esta unidad a otra empresa, elimínela y cree una nueva.
                        </p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Estructura</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                            Al modificar la <strong>Unidad Padre</strong>, asegúrese de no seleccionar la misma unidad o una de sus dependientes para evitar errores de jerarquía.
                        </p>
                    </div>

                    <div style={{ paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <i className='bx bx-info-circle' style={{ color: '#dc2626', fontSize: '1.1rem', marginTop: '1px' }}></i>
                            <span>Los cambios se reflejarán en el organigrama inmediatamente.</span>
                        </p>
                    </div>
                </div>

            </div>
        )}

        {/* MODAL */}
        {modal.show && (
            <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: modal.type === 'error' ? '#fee2e2' : '#dcfce7', color: modal.type === 'error' ? '#dc2626' : '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <i className={`bx ${modal.type === 'error' ? 'bx-x' : 'bx-check'}`} style={{ fontSize: '2rem' }}></i>
                    </div>
                    <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>{modal.title}</h3>
                    <p style={{ color: '#64748b', marginBottom: '25px' }}>{modal.msg}</p>
                    <button onClick={closeModal} style={{ width: '100%', padding: '12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Entendido</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}