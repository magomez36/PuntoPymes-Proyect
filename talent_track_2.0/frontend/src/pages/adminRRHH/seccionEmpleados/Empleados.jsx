import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SidebarRRHH"; 
import { apiFetch } from "../../../services/api";
import logoWatermark from "../../../assets/img/talentrack_small.svg";

const ESTADO = { 1: "Activo", 2: "Suspendido", 3: "Baja" };

function fmtDate(iso) {
  if (!iso) return "N/A";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-EC", { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Empleados() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Estados Modales
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/rrhh/empleados/");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr("Error cargando empleados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openDeleteModal = (id) => {
    setIdToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    try {
      const res = await apiFetch(`/api/rrhh/empleados/${idToDelete}/`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar.");
      await load();
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (e) {
      alert("Error eliminando.");
    }
  };

  const getInitials = (nombre, apellido) => {
    const n = nombre ? nombre.charAt(0).toUpperCase() : "";
    const a = apellido ? apellido.charAt(0).toUpperCase() : "";
    return n + a;
  };

  // --- Estilos de Layout Uniformes ---
  const layoutWrapperStyle = {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    width: '100%',
  };

  const mainAreaStyle = {
    paddingLeft: '110px', // Espacio uniforme para todas las páginas
    paddingRight: '40px',
    paddingTop: '40px',
    paddingBottom: '40px',
    position: 'relative',
    zIndex: 1,
  };

  const watermarkStyle = {
    position: 'fixed', bottom: '-80px', right: '-80px', width: '450px',
    opacity: '0.04', zIndex: 0, pointerEvents: 'none'
  };

  const renderEstadoBadge = (estadoCode, estadoLabel) => {
    const label = ESTADO[estadoCode] || estadoLabel || "N/A";
    let bg = "#f1f5f9";
    let color = "#475569";

    if (label.toLowerCase() === "activo") { bg = "#dcfce7"; color = "#166534"; }
    else if (label.toLowerCase() === "suspendido") { bg = "#fef9c3"; color = "#854d0e"; }
    else if (label.toLowerCase() === "baja") { bg = "#fee2e2"; color = "#b91c1c"; }

    return (
      <span style={{ 
        backgroundColor: bg, color: color, padding: '4px 12px', 
        borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' 
      }}>
        {label}
      </span>
    );
  };

  return (
    <div style={layoutWrapperStyle}>
      <Sidebar />
      <img src={logoWatermark} alt="watermark" style={watermarkStyle} />
      
      <main style={mainAreaStyle}>
        {/* Encabezado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Directorio de Empleados</h1>
            <p style={{ color: '#64748b', marginTop: '8px', fontSize: '1.05rem' }}>Gestión del personal, contratos y perfiles laborales.</p>
          </div>
          <button 
            onClick={() => navigate("/rrhh/empleados/crear")}
            style={{ 
              backgroundColor: '#d51e37', color: 'white', border: 'none', 
              padding: '14px 28px', borderRadius: '12px', fontWeight: '700', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
              boxShadow: '0 10px 15px -3px rgba(213, 30, 55, 0.2)'
            }}
          >
            <i className='bx bx-user-plus' style={{ fontSize: '1.2rem' }}></i> Nuevo Empleado
          </button>
        </div>

        {/* Card de Tabla */}
        <div style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 4px 25px rgba(0,0,0,0.04)', padding: '35px', border: '1px solid #f1f5f9' }}>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
            <div style={{ position: 'relative' }}>
              <i className='bx bx-search' style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
              <input 
                type="text" 
                placeholder="Buscar por nombre..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  padding: '12px 20px 12px 45px', borderRadius: '12px', 
                  border: '1px solid #e2e8f0', width: '320px', outline: 'none',
                  fontSize: '0.95rem', backgroundColor: '#fcfcfd'
                }}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Cargando directorio...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                <thead>
                  <tr style={{ textAlign: 'left' }}>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Colaborador</th>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Puesto</th>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Unidad</th>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>Ingreso</th>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>Estado</th>
                    <th style={{ padding: '0 15px 15px 15px', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.filter(r => r.nombres.toLowerCase().includes(searchTerm.toLowerCase())).map((r) => (
                    <tr key={r.id} style={{ transition: 'all 0.2s' }}>
                      <td style={{ padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#475569', border: '1px solid #e2e8f0' }}>
                            {getInitials(r.nombres, r.apellidos)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: '#1e293b' }}>{r.nombres} {r.apellidos}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '15px', color: '#475569', borderBottom: '1px solid #f1f5f9' }}>{r.puesto_nombre || "-"}</td>
                      <td style={{ padding: '15px', color: '#475569', borderBottom: '1px solid #f1f5f9' }}>{r.unidad_nombre || "-"}</td>
                      <td style={{ padding: '15px', color: '#475569', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>{fmtDate(r.fecha_ingreso)}</td>
                      <td style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        {renderEstadoBadge(r.estado, r.estado_label)}
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button onClick={() => navigate(`/rrhh/empleados/editar/${r.id}`)} style={{ border: '1px solid #e2e8f0', background: '#fff', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: '#3b82f6' }}>
                            <i className='bx bx-pencil' style={{ fontSize: '1.2rem' }}></i>
                          </button>
                          <button onClick={() => openDeleteModal(r.id)} style={{ border: '1px solid #e2e8f0', background: '#fff', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: '#ef4444' }}>
                            <i className='bx bx-trash' style={{ fontSize: '1.2rem' }}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* --- MODALES --- */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderRadius: '20px' }}>
            <div className="modal-icon-warning"><i className='bx bx-user-x'></i></div>
            <h3 className="modal-title">¿Eliminar empleado?</h3>
            <p className="modal-text">Esta acción es irreversible y afectará los registros históricos.</p>
            <div className="modal-actions">
              <button className="btn-modal btn-cancel" onClick={() => setShowConfirmModal(false)}>Cancelar</button>
              <button className="btn-modal btn-confirm-delete" onClick={confirmDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderRadius: '20px' }}>
            <div className="modal-icon-success"><i className='bx bx-check-circle'></i></div>
            <h3 className="modal-title">¡Directorio Actualizado!</h3>
            <p className="modal-text">El empleado ha sido removido del sistema.</p>
            <div className="modal-actions">
              <button className="btn-modal" style={{ backgroundColor: '#d51e37', color: 'white' }} onClick={() => setShowSuccessModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}