import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SidebarRRHH"; 
import { apiFetch } from "../../../services/api";
import "../../../assets/css/admin-empresas.css"; 

export default function Puestos() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // --- ESTADOS DE LOS MODALES ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/rrhh/puestos/");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando puestos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // --- LÓGICA DE MODALES ---

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
      const res = await apiFetch(`/api/rrhh/puestos/${idToDelete}/`, { method: "DELETE" });

      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        alert(data?.detail || "No se puede eliminar: el puesto está asignado a empleados.");
        closeConfirmModal();
        return;
      }

      if (!res.ok) throw new Error("No se pudo eliminar.");

      // Éxito
      await load();
      closeConfirmModal();
      setShowSuccessModal(true); // Abrir modal verde

    } catch (e) {
      alert(e?.message || "Error eliminando.");
      closeConfirmModal();
    }
  };

  // --- UTILIDADES DE FORMATO ---
  
  // Formato de Moneda (Ej: $ 1,200.00)
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "-";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Capitalizar texto (Ej: "senior" -> "Senior")
  const formatText = (text) => {
    if (!text) return "-";
    const str = String(text);
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <div className="layout-wrapper">
      <Sidebar />
      
      <main className="page-content">
        
        {/* Header */}
        <div className="page-header-section">
            <div>
                <h1 className="page-main-title">Gestión de Puestos</h1>
                <p className="page-subtitle">Administra los cargos, niveles salariales y descripciones de funciones.</p>
            </div>
            <button 
                className="btn-create-company" 
                onClick={() => navigate("/rrhh/puestos/crear")}
            >
                <i className='bx bx-plus'></i> Crear Puesto
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
                                <th>Nombre del Puesto</th>
                                <th>Unidad Organizacional</th>
                                <th>Descripción</th>
                                <th>Nivel</th>
                                <th>Salario Referencial</th>
                                <th style={{ textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length > 0 ? (
                                rows.map((r) => (
                                    <tr key={r.id}>
                                        <td className="fw-bold">{r.nombre}</td>
                                        
                                        {/* Unidad con estilo suave si es N/A */}
                                        <td>
                                            {r.unidad_nombre ? (
                                                <span style={{ fontWeight: 500 }}>{r.unidad_nombre}</span>
                                            ) : (
                                                <span className="text-muted" style={{color:'#9ca3af'}}>-</span>
                                            )}
                                        </td>
                                        
                                        {/* Descripción truncada visualmente si es muy larga */}
                                        <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#64748b' }}>
                                            {r.descripcion || "-"}
                                        </td>

                                        <td>{formatText(r.nivel)}</td>
                                        
                                        {/* Salario en verde oscuro */}
                                        <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#059669' }}>
                                            {formatCurrency(r.salario_referencial)}
                                        </td>

                                        <td style={{ textAlign: 'center' }}>
                                            <div className="action-buttons" style={{ justifyContent: 'center' }}>
                                                <button 
                                                    className="btn-action btn-edit" 
                                                    onClick={() => navigate(`/rrhh/puestos/editar/${r.id}`)}
                                                    title="Editar"
                                                >
                                                    <i className='bx bx-pencil'></i>
                                                </button>
                                                <button 
                                                    className="btn-action btn-delete" 
                                                    onClick={() => openDeleteModal(r.id)}
                                                    title="Eliminar"
                                                >
                                                    <i className='bx bx-trash'></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="empty-state">
                                        No hay puestos registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

        {/* --- MODAL 1: CONFIRMACIÓN (Rojo) --- */}
        {showConfirmModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-icon-warning">
                        <i className='bx bx-error-circle'></i>
                    </div>
                    <h3 className="modal-title">¿Eliminar puesto?</h3>
                    <p className="modal-text">
                        Esta acción es irreversible. ¿Estás seguro de continuar?
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

        {/* --- MODAL 2: ÉXITO (Verde) --- */}
        {showSuccessModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-icon-success">
                        <i className='bx bx-check-circle'></i>
                    </div>
                    <h3 className="modal-title">¡Eliminado!</h3>
                    <p className="modal-text">
                        El puesto se ha eliminado correctamente.
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