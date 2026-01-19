import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";
import { getAccessToken } from "../../../services/authStorage";

// Estilos compartidos
import "../../../assets/css/admin-empresas.css"; 
import "../../../assets/css/modal.css"; 

const API_BASE = "http://127.0.0.1:8000/api";

export default function EditarPermisoRolEmp() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => getAccessToken(), []);

  // --- ESTADOS ---
  const [empresas, setEmpresas] = useState([]);
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    empresa_id: "",
    rol_id: "",
    codigo: "",
    descripcion: "",
  });

  // --- CARGA DE DATOS ---
  
  // 1. Cargar lista de empresas
  const loadEmpresas = async () => {
    try {
      const res = await apiFetch(`${API_BASE}/listado-empresas/`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setEmpresas(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error cargando empresas", e);
    }
  };

  // 2. Cargar roles por empresa
  const loadRoles = async (empresaId) => {
    setRoles([]);
    if (!empresaId) return;
    setRolesLoading(true);
    try {
        const res = await apiFetch(`${API_BASE}/helpers/roles-por-empresa/?empresa_id=${empresaId}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setRoles(Array.isArray(data) ? data : []);
    } catch (e) {
        console.error(e);
    } finally {
        setRolesLoading(false);
    }
  };

  // 3. Cargar datos del permiso y orquestar todo
  const load = async () => {
    setLoading(true);
    try {
      await loadEmpresas();

      const res = await apiFetch(`${API_BASE}/permisos/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Permiso no encontrado");
      const data = await res.json();

      const eid = searchParams.get("empresa_id") || String(data.empresa_id || "");
      
      await loadRoles(eid);

      setForm({
        empresa_id: eid,
        rol_id: String(data.rol_id || ""),
        codigo: data.codigo || "",
        descripcion: data.descripcion || "",
      });
    } catch (e) {
      alert(e.message || "Error cargando permiso.");
      navigate("/admin/permisos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    load();
    // eslint-disable-next-line
  }, [id, token]);

  // --- HANDLERS ---

  const onChange = async (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));

    if (name === "empresa_id") {
      setForm((p) => ({ ...p, rol_id: "" })); 
      await loadRoles(value);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.empresa_id) return alert("Selecciona empresa.");
    if (!form.rol_id) return alert("Selecciona rol.");
    if (!form.codigo.trim()) return alert("Código es obligatorio.");

    setSaving(true);
    const payload = {
      empresa_id: Number(form.empresa_id),
      rol_id: Number(form.rol_id),
      codigo: form.codigo.trim(),
      descripcion: form.descripcion.trim(),
    };

    try {
      const res = await apiFetch(`${API_BASE}/permisos/${id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || JSON.stringify(data));
      }

      setShowSuccessModal(true);
    } catch (e2) {
      alert(e2.message || "Error actualizando.");
    } finally {
        setSaving(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    navigate("/admin/permisos");
  };

  // --- ESTILOS ---
  const inputStyle = { width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', color: '#1f2937', transition: 'border-color 0.2s', backgroundColor: '#f8fafc' };
  const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.25rem', pointerEvents: 'none' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem', textAlign: 'left' };

  if (loading) return <div className="layout" style={{justifyContent:'center', alignItems:'center', background:'#f8fafc'}}>Cargando datos...</div>;

  return (
    <div className="layout" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* === HEADER (Ancho completo, alineado a la izquierda) === */}
        <header style={{ width: '100%', backgroundColor: 'white', padding: '16px 32px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'0.85rem', color:'#64748b' }}>
                <span style={{cursor:'pointer'}} onClick={() => navigate('/admin/permisos')}>Permisos</span>
                <i className='bx bx-chevron-right'></i>
                <span style={{color:'#dc2626', fontWeight:'600'}}>Editar Permiso</span> {/* Color corporativo rojo */}
            </div>
        </header>

        {/* === CONTENIDO PRINCIPAL (Centrado, Max 1100px) === */}
        <div className="content-area" style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', width: '100%' }}>
            
            {/* TÍTULO HERO (Alineado a la izquierda) */}
            <div style={{ marginBottom: '32px', textAlign: 'left' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0', letterSpacing:'-0.5px' }}>
                    Editar Permiso
                </h1>
                <p style={{ color: '#64748b', margin: 0, fontSize:'0.95rem' }}>
                    Modifica los detalles del permiso o reasígnalo a otro rol.
                </p>
            </div>

            {/* GRID 2 COLUMNAS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px', alignItems: 'start' }}>
                
                {/* COLUMNA IZQUIERDA: FORMULARIO */}
                <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', padding: '32px' }}>
                    <form onSubmit={onSubmit} style={{ display: 'grid', gap: '24px' }}>
                        
                        {/* Asignación */}
                        <div style={{ paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom: '20px', textAlign: 'left' }}>
                                Configuración de Acceso
                            </h3>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                {/* Empresa */}
                                <div>
                                    <label style={labelStyle}>Empresa <span style={{color:'#dc2626'}}>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <i className='bx bxs-business' style={iconStyle}></i>
                                        <select name="empresa_id" value={form.empresa_id} onChange={onChange} style={{ ...inputStyle, appearance: 'none' }}>
                                            <option value="">Seleccionar...</option>
                                            {empresas.map(e => <option key={e.id} value={e.id}>{e.razon_social}</option>)}
                                        </select>
                                        <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                    </div>
                                </div>

                                {/* Rol */}
                                <div>
                                    <label style={labelStyle}>Rol <span style={{color:'#dc2626'}}>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <i className='bx bx-user-badge' style={iconStyle}></i>
                                        <select 
                                            name="rol_id" 
                                            value={form.rol_id} 
                                            onChange={onChange} 
                                            disabled={!form.empresa_id || rolesLoading}
                                            style={{ 
                                                ...inputStyle, 
                                                appearance: 'none', 
                                                backgroundColor: (!form.empresa_id || rolesLoading) ? '#f1f5f9' : '#f8fafc',
                                                cursor: (!form.empresa_id || rolesLoading) ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            <option value="">
                                                {rolesLoading ? "Cargando..." : "Seleccionar..."}
                                            </option>
                                            {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                                        </select>
                                        <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detalles */}
                        <div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>Código del Permiso <span style={{color:'#dc2626'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-code-alt' style={iconStyle}></i>
                                    <input 
                                        type="text" 
                                        name="codigo" 
                                        value={form.codigo} 
                                        onChange={onChange} 
                                        style={inputStyle} 
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Descripción</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-text' style={{...iconStyle, top:'20px', transform:'none'}}></i>
                                    <textarea 
                                        name="descripcion" 
                                        value={form.descripcion} 
                                        onChange={onChange} 
                                        rows="3" 
                                        style={{ ...inputStyle, paddingLeft: '40px', paddingTop: '10px', resize:'vertical', minHeight:'80px' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botones */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', paddingTop:'24px', borderTop:'1px solid #f1f5f9' }}>
                            <button 
                                type="button" 
                                onClick={() => navigate("/admin/permisos")}
                                style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 'bold', fontSize: '0.95rem', cursor:'pointer', transition:'0.2s' }}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                disabled={saving}
                                style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: saving ? '#fca5a5' : '#dc2626', color: 'white', fontWeight: 'bold', fontSize: '0.95rem', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 10px rgba(220, 38, 38, 0.2)', transition:'0.2s' }}
                            >
                                {saving ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* COLUMNA DERECHA: AYUDA (Usando Rojo Corporativo) */}
                <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', padding: '24px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                        <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'#fef2f2', color:'#dc2626', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <i className='bx bx-edit-alt' style={{fontSize:'1.2rem'}}></i>
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', margin:0, textAlign: 'left' }}>Edición de Permiso</h3>
                    </div>
                    
                    <div style={{ fontSize: '0.85rem', color: '#64748b', display:'flex', flexDirection:'column', gap:'16px', textAlign: 'left' }}>
                        <p style={{ margin: 0 }}>
                            Estás editando el permiso <strong>{form.codigo}</strong>. Asegúrate de que los cambios sean necesarios.
                        </p>
                        
                        <div style={{ background:'#fffbeb', padding:'12px', borderRadius:'8px', border:'1px solid #fcd34d', color:'#b45309' }}>
                            <i className='bx bx-alarm-exclamation' style={{marginRight:'4px'}}></i>
                            <strong>¡Atención!</strong><br/>
                            Modificar el código del permiso podría afectar funcionalidades que dependan de él en el código fuente.
                        </div>

                        <div style={{ background:'#eff6ff', padding:'12px', borderRadius:'8px', border:'1px solid #dbeafe', color:'#1e40af' }}>
                            <i className='bx bx-user-check' style={{marginRight:'4px'}}></i>
                            Si cambias el <strong>Rol</strong>, todos los usuarios con el rol anterior perderán este permiso inmediatamente.
                        </div>
                    </div>
                </div>

            </div>
        </div>

        {/* MODAL ÉXITO */}
        {showSuccessModal && (
            <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <i className='bx bx-check' style={{ fontSize: '48px' }}></i>
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>¡Permiso Actualizado!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>Los cambios se han guardado correctamente.</p>
                    <button onClick={handleCloseSuccess} style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Volver al Listado</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}