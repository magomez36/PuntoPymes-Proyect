import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { getAccessToken } from "../../../services/authStorage";
import { apiFetch } from "../../../services/api";

// Estilos
import "../../../assets/css/admin-empresas.css"; 
import "../../../assets/css/modal.css"; 

const API_BASE = "http://127.0.0.1:8000";

export default function EditarPuestoEmp() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  
  // Datos relacionales
  const [unidades, setUnidades] = useState([]); // Unidades de la empresa del puesto
  const [nombreEmpresa, setNombreEmpresa] = useState("Cargando..."); // Para mostrar solo lectura
  
  // Estado del Formulario
  const [form, setForm] = useState({
    empresa_id: "", // Guardamos ID aunque no se edite
    unidad: "",
    nombre: "",
    descripcion: "",
    nivel: "",
    salario_referencial: "",
  });

  // Estado Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const init = async () => {
      try {
        const token = getAccessToken();
        if (!token) { navigate("/login"); return; }
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Cargar el Puesto
        const resPuesto = await apiFetch(`${API_BASE}/api/puestos/${id}/`, { headers });
        if (!resPuesto.ok) throw new Error("No se pudo cargar el puesto.");
        const data = await resPuesto.json();

        // 2. Cargar Unidades de esa Empresa (para el select)
        const resUnidades = await apiFetch(`${API_BASE}/api/unidades-organizacionales/?empresa_id=${data.empresa}`, { headers });
        if (resUnidades.ok) {
            const dataUnidades = await resUnidades.json();
            setUnidades(Array.isArray(dataUnidades) ? dataUnidades : []);
        }

        // 3. Obtener Nombre de la Empresa (para mostrar bonito)
        const resEmpresas = await apiFetch(`${API_BASE}/api/listado-empresas/`, { headers });
        if (resEmpresas.ok) {
            const listaEmpresas = await resEmpresas.json();
            const emp = listaEmpresas.find(e => e.id === data.empresa);
            setNombreEmpresa(emp ? emp.razon_social : "Empresa Desconocida");
        }

        // 4. Llenar Formulario
        setForm({
          empresa_id: data.empresa,
          unidad: String(data.unidad || ""),
          nombre: data.nombre || "",
          descripcion: data.descripcion || "",
          nivel: data.nivel || "",
          salario_referencial: data.salario_referencial ?? "", // Puede ser null
        });

        setLoading(false);

      } catch (e) {
        console.error(e);
        alert("Error cargando datos del puesto.");
        navigate("/admin/puestos");
      }
    };

    init();
  }, [id, navigate]);

  // --- HANDLERS ---
  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    const token = getAccessToken();

    const payload = {
      unidad: parseInt(form.unidad, 10),
      nombre: form.nombre,
      descripcion: form.descripcion,
      nivel: form.nivel,
      salario_referencial: form.salario_referencial === "" ? null : parseFloat(form.salario_referencial),
    };

    try {
      const res = await apiFetch(`${API_BASE}/api/actualizar-puesto/${id}/`, {
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
    navigate("/admin/puestos");
  };

  // Estilos
  const inputStyle = { width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', color: '#1f2937', transition: 'border-color 0.2s', backgroundColor: 'white' };
  const readOnlyStyle = { ...inputStyle, backgroundColor: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' };
  const iconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.25rem', pointerEvents: 'none' };
  const textareaStyle = { ...inputStyle, padding: '10px 12px', minHeight: '80px', resize: 'vertical' };

  if (loading) return <div className="layout" style={{justifyContent:'center', alignItems:'center', background:'#f8fafc'}}>Cargando...</div>;

  return (
    // AQUÍ ESTÁ EL CAMBIO: layout-watermark AÑADIDO
    <div className="layout layout-watermark" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER */}
        <header style={{ background: 'white', padding: '0 32px', borderBottom: '1px solid #e2e8f0', height: '64px', display: 'flex', alignItems: 'center' }}>
            <nav style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                <Link to="/admin/puestos" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>Puestos</Link>
                <i className='bx bx-chevron-right' style={{ fontSize: '1.2rem', margin: '0 8px' }}></i>
                <span style={{ color: '#0f172a', fontWeight: '600' }}>Editar Puesto</span>
            </nav>
        </header>

        <div className="content-area" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Editar Puesto</h1>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '1rem' }}>Actualiza la información del cargo seleccionado.</p>
            </div>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* --- FORMULARIO --- */}
                <div style={{ flex: '2', minWidth: '600px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                    <form onSubmit={submit} style={{ padding: '32px' }}>
                        
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Ubicación Organizacional
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            {/* EMPRESA (READ ONLY) */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Empresa</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bxs-business' style={iconStyle}></i>
                                    <input 
                                        type="text" 
                                        value={nombreEmpresa} 
                                        readOnly 
                                        style={readOnlyStyle} 
                                    />
                                </div>
                            </div>

                            {/* UNIDAD (EDITABLE) */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Unidad Organizacional <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-sitemap' style={iconStyle}></i>
                                    <select 
                                        name="unidad" 
                                        value={form.unidad} 
                                        onChange={onChange}
                                        required
                                        style={{ ...inputStyle, appearance: 'none' }}
                                    >
                                        <option value="">Seleccionar Unidad...</option>
                                        {unidades.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>
                        </div>

                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', marginTop: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Detalles del Puesto
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            {/* NOMBRE */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Nombre del Cargo <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-id-card' style={iconStyle}></i>
                                    <input 
                                        type="text" 
                                        name="nombre" 
                                        value={form.nombre} 
                                        onChange={onChange} 
                                        required
                                        style={inputStyle} 
                                    />
                                </div>
                            </div>

                            {/* NIVEL */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Nivel Jerárquico</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-layer' style={iconStyle}></i>
                                    <input 
                                        type="text" 
                                        name="nivel" 
                                        value={form.nivel} 
                                        onChange={onChange} 
                                        style={inputStyle} 
                                    />
                                </div>
                            </div>

                            {/* SALARIO */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Salario Referencial</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-money' style={iconStyle}></i>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        min="0"
                                        name="salario_referencial" 
                                        placeholder="0.00" 
                                        value={form.salario_referencial} 
                                        onChange={onChange} 
                                        style={inputStyle} 
                                    />
                                </div>
                            </div>

                            {/* DESCRIPCIÓN */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Descripción del Puesto</label>
                                <textarea 
                                    name="descripcion" 
                                    value={form.descripcion} 
                                    onChange={onChange} 
                                    style={textareaStyle} 
                                />
                            </div>
                        </div>

                        {/* ACCIONES */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                            <Link to="/admin/puestos" style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#334155', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
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
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Empresa Bloqueada</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            No es posible cambiar el puesto a otra empresa directamente. Si necesita hacerlo, elimine este puesto y cree uno nuevo en la empresa destino.
                        </p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Cambio de Unidad</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            Sí puede reasignar el puesto a otra <strong>Unidad Organizacional</strong> dentro de la misma empresa (ej: Mover de "RRHH" a "Administración").
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
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>La información del puesto ha sido guardada correctamente.</p>
                    <button onClick={handleCloseSuccess} style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Continuar</button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}