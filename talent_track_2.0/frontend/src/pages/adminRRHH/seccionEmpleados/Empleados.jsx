import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SidebarRRHH"; 
import { apiFetch } from "../../../services/api";
import "../../../assets/css/admin-empresas.css";

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
      setErr(e?.message || "Error cargando empleados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // --- LÓGICA MODALES ---
  const openDeleteModal = (id) => {
    setIdToDelete(id);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setIdToDelete(null);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;

    try {
      const res = await apiFetch(`/api/rrhh/empleados/${idToDelete}/`, { method: "DELETE" });

      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        alert(data?.detail || "No se puede eliminar: tiene registros asociados.");
        closeConfirmModal();
        return;
      }

      if (!res.ok) throw new Error("No se pudo eliminar.");
      
      await load();
      closeConfirmModal();
      setShowSuccessModal(true);

    } catch (e) {
      alert(e?.message || "Error eliminando.");
      closeConfirmModal();
    }
  };

  const renderEstado = (estadoCode, estadoLabel) => {
    const label = ESTADO[estadoCode] || estadoLabel || "N/A";
    let claseColor = "status-inactive"; 

    if (label.toLowerCase() === "activo") claseColor = "status-active";
    if (label.toLowerCase() === "suspendido") claseColor = "status-inactive";

    return <span className={`status-badge ${claseColor}`}>{label}</span>;
  };

  // --- NUEVA FUNCIÓN: OBTENER INICIALES ---
  const getInitials = (nombre, apellido) => {
    const n = nombre ? nombre.charAt(0).toUpperCase() : "";
    const a = apellido ? apellido.charAt(0).toUpperCase() : "";
    return n + a;
  };

  // Estilo en línea para el avatar (para no tocar el CSS de nuevo)
  const avatarStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9', // Gris muy suave
    color: '#475569',           // Gris oscuro para texto
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px',
    border: '1px solid #e2e8f0',
    flexShrink: 0 // Evita que se aplaste
  };

  return (
    <div className="layout-wrapper">
      <Sidebar />
      
      <main className="page-content">
        
        {/* Header */}
        <div className="page-header-section">
            <div>
                <h1 className="page-main-title">Directorio de Empleados</h1>
                <p className="page-subtitle">Gestión del personal, contratos y asignaciones.</p>
            </div>
            <button 
                className="btn-create-company" 
                onClick={() => navigate("/rrhh/empleados/crear")}
            >
                <i className='bx bx-user-plus'></i> Nuevo Empleado
            </button>
        </div>

        {/* Tabla */}
        <div className="table-card">
            {loading && <div className="loading-state"><i className='bx bx-loader-alt bx-spin'></i> Cargando...</div>}
            {err && <div className="error-state"><i className='bx bx-error'></i> {err}</div>}

            {!loading && !err && (
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Colaborador</th>
                                <th>Puesto / Cargo</th>
                                <th>Unidad / Área</th>
                                <th>Contacto</th>
                                <th>Fecha Ingreso</th>
                                <th style={{ textAlign: 'center' }}>Estado</th>
                                <th style={{ textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length > 0 ? (
                                rows.map((r) => (
                                    <tr key={r.id}>
                                        {/* COLUMNA 1: AVATAR + NOMBRE */}
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                
                                                {/* Círculo con Iniciales */}
                                                <div style={avatarStyle}>
                                                    {getInitials(r.nombres, r.apellidos)}
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span className="fw-bold" style={{ fontSize: '0.95rem', color: '#1e293b' }}>
                                                        {r.nombres} {r.apellidos}
                                                    </span>
                                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                        {r.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td>{r.puesto_nombre || <span className="text-muted">-</span>}</td>
                                        
                                        <td>
                                            {r.unidad_nombre ? (
                                                <span style={{ fontWeight: 500 }}>{r.unidad_nombre}</span>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>

                                        <td>{r.telefono || "-"}</td>
                                        
                                        <td style={{ fontSize: '0.9rem', color: '#475569' }}>{fmtDate(r.fecha_ingreso)}</td>
                                        
                                        <td style={{ textAlign: 'center' }}>
                                            {renderEstado(r.estado, r.estado_label)}
                                        </td>
                                        
                                        <td style={{ textAlign: 'center' }}>
                                            <div className="action-buttons" style={{ justifyContent: 'center' }}>
                                                <button 
                                                    className="btn-action btn-edit" 
                                                    onClick={() => navigate(`/rrhh/empleados/editar/${r.id}`)}
                                                    title="Editar Ficha"
                                                >
                                                    <i className='bx bx-pencil'></i>
                                                </button>
                                                <button 
                                                    className="btn-action btn-delete" 
                                                    onClick={() => openDeleteModal(r.id)}
                                                    title="Eliminar Empleado"
                                                >
                                                    <i className='bx bx-trash'></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="empty-state">
                                        No hay empleados registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

        {/* --- MODAL 1: CONFIRMACIÓN --- */}
        {showConfirmModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-icon-warning">
                        <i className='bx bx-user-x'></i>
                    </div>
                    <h3 className="modal-title">¿Eliminar empleado?</h3>
                    <p className="modal-text">
                        Esta acción eliminará también el contrato asociado. ¿Estás seguro?
                    </p>
                    <div className="modal-actions">
                        <button className="btn-modal btn-cancel" onClick={closeConfirmModal}>
                            Cancelar
                        </button>
                        <button className="btn-modal btn-confirm-delete" onClick={confirmDelete}>
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- MODAL 2: ÉXITO --- */}
        {showSuccessModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-icon-success">
                        <i className='bx bx-check-circle'></i>
                    </div>
                    <h3 className="modal-title">¡Eliminado!</h3>
                    <p className="modal-text">
                        El registro del empleado ha sido eliminado correctamente.
                    </p>
                    <div className="modal-actions">
                        <button 
                            className="btn-modal" 
                            style={{ backgroundColor: '#d51e37', color: 'white' }}
                            onClick={closeSuccessModal}
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}