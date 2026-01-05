import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiFetch } from "../../../services/api";
import { getAccessToken } from "../../../services/authStorage";
import Sidebar from "../../../components/Sidebar";

// Estilos
import "../../../assets/css/admin-empresas.css"; 
import "../../../assets/css/modal.css"; // Asegúrate de tener los estilos del modal

const API_BASE = "http://127.0.0.1:8000";

export default function EditarUnidadOrgEmp() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [unidadesEmpresa, setUnidadesEmpresa] = useState([]); // Posibles padres
  const [nombreEmpresa, setNombreEmpresa] = useState("Cargando..."); // Para mostrar solo lectura
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    empresa_id: "", // Guardamos el ID aunque no lo editemos
    unidad_padre: "",
    nombre: "",
    tipo: "3",
    ubicacion: "",
    estado: "1", // Guardamos el estado para el payload
  });

  // Tipos para el select
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

            // 2. Obtener detalles de la empresa (para mostrar el nombre)
            // Asumimos que data.empresa es el ID. Si el backend devuelve el nombre directo, mejor.
            // Si no, hacemos un fetch rápido o usamos la lista si la tuviéramos.
            // Aquí haremos un fetch a la lista de unidades de esa empresa, que es lo que necesitamos para el select de padres.
            
            const resUnidades = await apiFetch(`${API_BASE}/api/unidades-organizacionales/?empresa_id=${data.empresa}`, { headers });
            let listaUnidades = [];
            if (resUnidades.ok) {
                listaUnidades = await resUnidades.json();
                // IMPORTANTE: Excluir la unidad actual de la lista de padres para evitar ciclos
                const filtradas = listaUnidades.filter(u => String(u.id) !== String(id));
                setUnidadesEmpresa(filtradas);
                
                // Intentamos sacar el nombre de la empresa de la primera unidad encontrada (truco si no tenemos endpoint de empresa individual a mano)
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
                tipo: String(data.tipo || "3"), // Asegurar string para el select
                ubicacion: data.ubicacion || "",
                estado: String(data.estado || "1"),
            });

            setLoading(false);

        } catch (e) {
            console.error(e);
            alert("Error cargando datos.");
            navigate("/admin/unidades-organizacionales");
        }
    };
    loadData();
  }, [id, navigate]);

  // --- HANDLERS ---
  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getAccessToken();

    const payload = {
        empresa: parseInt(form.empresa_id), // El backend suele requerir la empresa en PUT también
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
            alert(err?.detail || "Error al actualizar");
            return;
        }

        setShowSuccessModal(true); // Mostrar modal de éxito

    } catch (e) {
        alert("Error de conexión");
    }
  };

  const handleCloseSuccess = () => {
      setShowSuccessModal(false);
      navigate("/admin/unidades-organizacionales");
  };

  // Estilos
  const inputStyle = { width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', color: '#1f2937', transition: 'border-color 0.2s', backgroundColor: 'white' };
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
                <Link to="/admin/unidades-organizacionales" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '500' }}>Unidades Org.</Link>
                <i className='bx bx-chevron-right' style={{ fontSize: '1.2rem', margin: '0 8px' }}></i>
                <span style={{ color: '#0f172a', fontWeight: '600' }}>Editar Unidad</span>
            </nav>
        </header>

        <div className="content-area" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Editar Unidad Organizacional</h1>
                <p style={{ color: '#64748b', marginTop: '6px', fontSize: '1rem' }}>Modifica la información o jerarquía de la unidad.</p>
            </div>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* --- FORMULARIO (IZQUIERDA) --- */}
                <div style={{ flex: '2', minWidth: '600px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                    <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
                        
                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Datos Básicos
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

                            {/* NOMBRE */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Nombre de Unidad <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-sitemap' style={iconStyle}></i>
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
                        </div>

                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '20px', marginTop: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                            Jerarquía y Configuración
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            {/* UNIDAD PADRE */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Unidad Padre (Opcional)</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-git-branch' style={iconStyle}></i>
                                    <select 
                                        name="unidad_padre" 
                                        value={form.unidad_padre} 
                                        onChange={onChange}
                                        style={{ ...inputStyle, appearance: 'none' }}
                                    >
                                        <option value="">Ninguna (Nivel Raíz)</option>
                                        {unidadesEmpresa.map(u => (
                                            <option key={u.id} value={u.id}>{u.nombre}</option>
                                        ))}
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>

                            {/* TIPO */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Tipo de Unidad <span style={{color:'#ef4444'}}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-tag-alt' style={iconStyle}></i>
                                    <select 
                                        name="tipo" 
                                        value={form.tipo} 
                                        onChange={onChange}
                                        required
                                        style={{ ...inputStyle, appearance: 'none' }}
                                    >
                                        {tiposOrganizacion.map(t => (
                                            <option key={t.id} value={t.id}>{t.label}</option>
                                        ))}
                                    </select>
                                    <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}></i>
                                </div>
                            </div>

                            {/* UBICACIÓN */}
                            <div style={{ gridColumn: '1 / -1' }}> 
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>Ubicación Física</label>
                                <div style={{ position: 'relative' }}>
                                    <i className='bx bx-map' style={iconStyle}></i>
                                    <input 
                                        type="text" 
                                        name="ubicacion" 
                                        value={form.ubicacion} 
                                        onChange={onChange} 
                                        style={inputStyle} 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ACCIONES */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                            <Link to="/admin/unidades-organizacionales" style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#334155', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
                                Cancelar
                            </Link>
                            <button type="submit" style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)' }}>
                                <i className='bx bx-save'></i> Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- PANEL DERECHO (INFO) --- */}
                <div style={{ flex: '0 0 320px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}><i className='bx bx-edit' style={{ fontSize: '20px' }}></i></div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, color: '#0f172a' }}>Modo Edición</h3>
                    </div>
                    
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Restricciones</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            No es posible cambiar la empresa propietaria de una unidad ya creada. Si necesita moverla a otra organización, deberá crear una nueva.
                        </p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Estructura</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                            Tenga cuidado al cambiar la <strong>Unidad Padre</strong> para no crear ciclos (que una unidad sea padre de sí misma o de sus ancestros).
                        </p>
                    </div>

                    <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: '16px' }}>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <i className='bx bx-info-circle' style={{ color: '#0284c7', fontSize: '1.1rem', marginTop: '1px' }}></i>
                            <span>El cambio de estado se realiza desde el listado principal.</span>
                        </p>
                    </div>
                </div>

            </div>
        </div>

        {/* MODAL DE ÉXITO */}
        {showSuccessModal && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div className="modal-content" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <i className='bx bx-check' style={{ fontSize: '48px' }}></i>
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>¡Actualización Exitosa!</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>La unidad organizacional ha sido modificada correctamente.</p>
                    <button onClick={handleCloseSuccess} style={{ width: '100%', padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>
                        Continuar
                    </button>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}

