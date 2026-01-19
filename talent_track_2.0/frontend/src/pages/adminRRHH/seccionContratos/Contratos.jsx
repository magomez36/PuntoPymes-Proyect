import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SidebarRRHH"; // Asegúrate del path correcto
import { apiFetch } from "../../../services/api";

// Estilos globales
import "../../../assets/css/admin-empresas.css";

const TIPO = { 1: "Indefinido", 2: "Plazo Fijo", 3: "Temporal", 4: "Prácticas" };
const ESTADO = { 1: "Activo", 2: "Inactivo" };

// Formateador de Fechas
function fmtDate(iso) {
  if (!iso) return <span className="text-muted" style={{ fontSize: '0.85rem' }}>-</span>;
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-EC", { year: 'numeric', month: 'short', day: 'numeric' });
}

// Formateador de Moneda
const formatCurrency = (amount) => {
    if (!amount) return "-";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function Contratos() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Estados Modal Cambio de Estado
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [idToToggle, setIdToToggle] = useState(null);
  const [currentStatusLabel, setCurrentStatusLabel] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/rrhh/contratos/");
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando contratos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // --- LÓGICA MODALES ---

  const openToggleModal = (id, estadoActual) => {
    setIdToToggle(id);
    const label = ESTADO[estadoActual] || "Desconocido";
    setCurrentStatusLabel(label);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setIdToToggle(null);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const confirmToggle = async () => {
    if (!idToToggle) return;

    try {
      const res = await apiFetch(`/api/rrhh/contratos/${idToToggle}/`, {
        method: "PATCH",
        body: JSON.stringify({}), // toggle automático en backend
      });

      if (!res.ok) throw new Error("No se pudo cambiar el estado del contrato.");
      
      await load();
      closeConfirmModal();
      setShowSuccessModal(true);

    } catch (e) {
      alert(e?.message || "Error cambiando estado.");
      closeConfirmModal();
    }
  };

  // Renderizador de Estado con colores
  const renderEstado = (estadoCode) => {
    const label = ESTADO[estadoCode] || "Desconocido";
    let claseColor = "status-inactive"; 

    if (estadoCode === 1) claseColor = "status-active"; // Activo
    if (estadoCode === 2) claseColor = "status-inactive"; // Inactivo

    return <span className={`status-badge ${claseColor}`}>{label}</span>;
  };

  return (
    <div className="layout-wrapper">
      <Sidebar />
      
      <main className="page-content">
        
        {/* Header */}
        <div className="page-header-section">
            <div>
                <h1 className="page-main-title">Gestión de Contratos</h1>
                <p className="page-subtitle">Administración de relaciones laborales y condiciones contractuales.</p>
            </div>
            <button 
                className="btn-create-company" 
                onClick={() => navigate("/rrhh/contratos/crear")}
            >
                <i className='bx bx-file-plus'></i> Nuevo Contrato
            </button>
        </div>

        {/* Tabla */}
        <div className="table-card">
            {loading && <div className="loading-state"><i className='bx bx-loader-alt bx-spin'></i> Cargando datos...</div>}
            {err && <div className="error-state"><i className='bx bx-error'></i> {err}</div>}

            {!loading && !err && (
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Colaborador</th>
                                <th>Tipo Contrato</th>
                                <th>Vigencia (Inicio - Fin)</th>
                                <th>Salario Base</th>
                                <th>Jornada (Hs)</th>
                                <th style={{ textAlign: 'center' }}>Estado</th>
                                <th style={{ textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length > 0 ? (
                                rows.map((r) => (
                                    <tr key={r.id}>
                                        {/* Columna Colaborador (Nombre + Email) */}
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span className="fw-bold" style={{ fontSize: '0.95rem' }}>
                                                    {r.empleado_nombres} {r.empleado_apellidos}
                                                </span>
                                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                    {r.empleado_email}
                                                </span>
                                            </div>
                                        </td>

                                        <td>{TIPO[r.tipo] || r.tipo_label || "N/A"}</td>
                                        
                                        {/* Fechas en una sola columna para ahorrar espacio */}
                                        <td style={{ fontSize: '0.9rem', color: '#475569' }}>
                                            <div><i className='bx bx-calendar-check' style={{color:'#10b981'}}></i> {fmtDate(r.fecha_inicio)}</div>
                                            <div style={{ marginTop: '4px' }}>
                                                <i className='bx bx-calendar-x' style={{color:'#ef4444'}}></i> {r.fecha_fin ? fmtDate(r.fecha_fin) : "Indefinido"}
                                            </div>
                                        </td>
                                        
                                        <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1e293b' }}>
                                            {formatCurrency(r.salario_base)}
                                        </td>

                                        <td style={{ textAlign: 'center' }}>{r.jornada_semanal_horas} h</td>
                                        
                                        <td style={{ textAlign: 'center' }}>
                                            {renderEstado(r.estado)}
                                        </td>
                                        
                                        <td style={{ textAlign: 'center' }}>
                                            <div className="action-buttons" style={{ justifyContent: 'center' }}>
                                                <button 
                                                    className="btn-action btn-edit" 
                                                    onClick={() => navigate(`/rrhh/contratos/editar/${r.id}`)}
                                                    title="Editar Contrato"
                                                >
                                                    <i className='bx bx-pencil'></i>
                                                </button>
                                                
                                                {/* Botón Toggle Estado (Switch) */}
                                                <button 
                                                    className="btn-action" 
                                                    style={{ backgroundColor: r.estado === 1 ? '#fee2e2' : '#d1fae5', color: r.estado === 1 ? '#dc2626' : '#059669' }}
                                                    onClick={() => openToggleModal(r.id, r.estado)}
                                                    title={r.estado === 1 ? "Desactivar Contrato" : "Activar Contrato"}
                                                >
                                                    <i className={`bx ${r.estado === 1 ? 'bx-power-off' : 'bx-check-circle'}`}></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="empty-state">
                                        No hay contratos registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

        {/* --- MODAL 1: CONFIRMACIÓN CAMBIO ESTADO --- */}
        {showConfirmModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-icon-warning" style={{ color: '#f59e0b' }}> {/* Amarillo advertencia */}
                        <i className='bx bx-refresh'></i>
                    </div>
                    <h3 className="modal-title">¿Cambiar Estado?</h3>
                    <p className="modal-text">
                        El contrato pasará de <strong>{currentStatusLabel}</strong> a <strong>{currentStatusLabel === "Activo" ? "Inactivo" : "Activo"}</strong>.
                        <br/>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            (Esto podría afectar el acceso y pagos del empleado).
                        </span>
                    </p>
                    <div className="modal-actions">
                        <button className="btn-modal btn-cancel" onClick={closeConfirmModal}>
                            Cancelar
                        </button>
                        <button 
                            className="btn-modal" 
                            style={{ backgroundColor: '#0f172a', color: 'white' }} // Botón oscuro
                            onClick={confirmToggle}
                        >
                            Confirmar Cambio
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
                    <h3 className="modal-title">¡Estado Actualizado!</h3>
                    <p className="modal-text">
                        El estado del contrato ha sido modificado exitosamente.
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