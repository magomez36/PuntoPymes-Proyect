import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar"; // Sidebar de Admin General
import { apiFetch } from "../../../services/api";
import "../../../assets/css/admin-empresas.css"; // Estilos globales

const ROLES = [
  { id: 1, label: "Super Admin" },
  { id: 2, label: "RRHH (Recursos Humanos)" },
  { id: 3, label: "Manager / Supervisor" },
  { id: 4, label: "Empleado" },
  { id: 5, label: "Auditor" },
];

export default function EditarRolEmp() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    nombre: 2,
    descripcion: "",
  });

  // Modal State
  const [modalConfig, setModalConfig] = useState({ show: false, type: 'success', title: '', message: '' });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/roles-empresa/${id}/`);
        const data = await res.json();
        if (!res.ok) throw new Error(JSON.stringify(data));

        setForm({
          nombre: Number(data.nombre_id || 2),
          descripcion: data.descripcion || "",
        });
      } catch (e) {
        showModal('error', 'Error', e?.message || "Error cargando la información del rol.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

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
          navigate("/admin/roles");
      }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      nombre: String(form.nombre),  // "1".."5"
      descripcion: form.descripcion || "",
    };

    try {
      const res = await apiFetch(`/api/roles-empresa/${id}/`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(JSON.stringify(data));

      showModal('success', 'Rol Actualizado', 'Los cambios en el rol han sido guardados correctamente.');
      
    } catch (e2) {
      showModal('error', 'Error', e2?.message || "No se pudo actualizar el rol.");
    }
  };

  // --- ESTILOS ---
  const layoutWrapperStyle = { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', width: '100%' };
  const mainAreaStyle = { flex: 1, padding: '30px 30px 30px 110px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '25px' };
  
  const cardStyle = { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' };
  
  // Estilo para el panel de ayuda (Tips)
  const tipsPanelStyle = { 
    backgroundColor: '#f8fafc', 
    borderRadius: '16px', 
    border: '1px dashed #cbd5e1', 
    padding: '30px',
    height: 'fit-content'
  };

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', color: '#1e293b', backgroundColor: '#fff' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', color: '#64748b', fontSize: '0.9rem' };

  return (
    <div className="layout layout-watermark" style={layoutWrapperStyle}>
      <Sidebar />
      <main style={mainAreaStyle}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Editar Rol</h1>
                <p style={{ color: '#64748b', marginTop: '4px', fontSize: '1rem' }}>Modifica los permisos o descripción de un rol existente.</p>
            </div>
            <Link to="/admin/roles" style={{ display:'flex', alignItems:'center', textDecoration:'none', color:'#64748b', fontWeight:'600', gap:'5px' }}>
                <i className='bx bx-arrow-back'></i> Volver
            </Link>
        </div>

        {loading ? (
             <p style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>Cargando datos...</p>
        ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', alignItems: 'start' }}>
                
                {/* COLUMNA IZQUIERDA: FORMULARIO */}
                <div style={cardStyle}>
                    <form onSubmit={onSubmit}>
                        
                        {/* Nota: En editar solemos bloquear la empresa, por eso no está el select de empresa aquí, asumiendo que un rol no cambia de empresa */}
                        
                        <div style={{ marginBottom: '25px' }}>
                            <label style={labelStyle}>Tipo de Rol <span style={{color:'#ef4444'}}>*</span></label>
                            <select 
                                name="nombre" 
                                value={form.nombre} 
                                onChange={onChange} 
                                style={inputStyle}
                            >
                                {ROLES.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={labelStyle}>Descripción</label>
                            <textarea 
                                name="descripcion" 
                                value={form.descripcion} 
                                onChange={onChange} 
                                rows={4} 
                                placeholder="Detalles sobre las responsabilidades de este rol..."
                                style={{ ...inputStyle, resize: 'vertical' }} 
                            />
                        </div>

                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button 
                                type="button" 
                                onClick={() => navigate("/admin/roles")} 
                                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#D51F36', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(213, 31, 54, 0.2)' }}
                            >
                                <i className='bx bx-save'></i> Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>

                {/* COLUMNA DERECHA: TIPS Y GUÍA */}
                <div style={tipsPanelStyle}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className='bx bx-bulb' style={{ color: '#D51F36', fontSize: '1.4rem' }}></i> Recordatorio
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '20px' }}>
                        Modificar el tipo de rol afectará inmediatamente los permisos del usuario asociado la próxima vez que inicie sesión.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#475569' }}>
                                <i className='bx bx-edit-alt'></i>
                            </div>
                            <div>
                                <strong style={{ display: 'block', fontSize: '0.9rem', color: '#334155' }}>Edición Segura</strong>
                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>La empresa asignada no se puede cambiar.</span>
                            </div>
                        </div>
                    </div>
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