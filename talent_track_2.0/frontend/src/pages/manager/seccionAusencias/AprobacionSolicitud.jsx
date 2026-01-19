
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SidebarManager from "../../../components/SidebarManager";
import { apiFetch } from "../../../services/api";
// import "../seccionMi_Equipo/DetalleSolicitud.css";

// Bloques visuales para mayor claridad
function Bloque({ title, children }) {
  return (
    <section className="solicitud-bloque">
      {title && <h3 className="solicitud-bloque-title">{title}</h3>}
      <div className="solicitud-bloque-content">{children}</div>
    </section>
  );
}

const fmtDate = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-EC");
};

const fmtDT = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleString("es-EC");
};

function buildDateRange(startIso, endIso) {
  if (!startIso || !endIso) return [];
  const start = new Date(`${startIso}T00:00:00`);
  const end = new Date(`${endIso}T00:00:00`);
  if (end < start) return [];

  const out = [];
  const cur = new Date(start);
  while (cur <= end) {
    out.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export default function AprobacionSolicitud() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 1 = Approve, 2 = Reject
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/manager/ausencias/solicitudes/${id}/`);
      const d = await res.json();
      if (!res.ok) throw new Error(d?.detail || "No se pudo cargar la solicitud.");
      setData(d);
    } catch (e) {
      setErr(e?.message || "Error cargando solicitud.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const rango = useMemo(() => {
    if (!data) return [];
    return buildDateRange(data.fecha_inicio, data.fecha_fin);
  }, [data]);

  const openModal = (type) => {
    setActionType(type);
    setComment("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActionType(null);
    setComment("");
  };

  const handleConfirm = async () => {
    if (!data || !actionType) return;
    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/api/manager/ausencias/solicitudes/${id}/decidir/`, {
        method: "PATCH",
        body: JSON.stringify({
          accion: actionType,
          comentario: comment.trim() ? comment.trim() : null,
        }),
      });

      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out?.detail || JSON.stringify(out));

      // Close modal first
      closeModal();

      // Could replace alert with a toast later, keeping simple specific alert for now but cleaner flow
      navigate("/manager/ausencias/solicitudes");
    } catch (e) {
      alert(e?.message || "Error al decidir solicitud.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Styles
  const styles = {
    layout: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
    },
    main: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '40px',
      marginLeft: '80px', // Adjusted for fixed sidebar width
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '40px',
      border: '1px solid #e2e8f0',
    },
    header: {
      marginBottom: '32px',
      paddingBottom: '24px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: '800',
      color: '#dc2626', // Red accent
      margin: 0,
    },
    backLink: {
      color: '#64748b',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.95rem',
      fontWeight: '500',
      transition: 'color 0.2s',
    },
    sectionTitle: {
      fontSize: '1.1rem',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '16px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderLeft: '4px solid #dc2626',
      paddingLeft: '12px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '32px',
      marginBottom: '40px',
    },
    infoGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    label: {
      fontSize: '0.85rem',
      color: '#64748b',
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    value: {
      fontSize: '1rem',
      color: '#0f172a',
      fontWeight: '500',
    },
    statusBadge: (status) => {
      const colors = {
        Pendiente: { bg: '#fff7ed', text: '#c2410c' },
        Aprobada: { bg: '#f0fdf4', text: '#15803d' },
        Rechazada: { bg: '#fef2f2', text: '#dc2626' },
      };
      const style = colors[status] || colors.Pendiente;
      return {
        backgroundColor: style.bg,
        color: style.text,
        padding: '4px 12px',
        borderRadius: '9999px',
        fontSize: '0.875rem',
        fontWeight: '600',
        display: 'inline-block',
      };
    },
    tableContainer: {
      marginTop: '24px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      backgroundColor: '#f8fafc',
      padding: '12px 16px',
      textAlign: 'left',
      fontSize: '0.85rem',
      fontWeight: '600',
      color: '#64748b',
      borderBottom: '1px solid #e2e8f0',
    },
    td: {
      padding: '12px 16px',
      fontSize: '0.95rem',
      color: '#334155',
      borderBottom: '1px solid #f1f5f9',
    },
    actions: {
      display: 'flex',
      gap: '16px',
      marginTop: '40px',
      paddingTop: '32px',
      borderTop: '1px solid #e2e8f0',
      justifyContent: 'flex-end',
    },
    button: (type) => {
      const base = {
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '1rem',
        border: 'none',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      };
      if (type === 'approve') return { ...base, backgroundColor: '#16a34a', color: 'white' }; // Green
      if (type === 'reject') return { ...base, backgroundColor: '#dc2626', color: 'white' }; // Red
      if (type === 'cancel') return { ...base, backgroundColor: '#f1f5f9', color: '#475569' }; // Gray
      return base;
    },
    // Modal Styles
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '32px',
      width: '90%',
      maxWidth: '500px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      animation: 'slideUp 0.3s ease-out',
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '16px',
    },
    modalLabel: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '0.95rem',
      color: '#475569',
      fontWeight: '500',
    },
    textarea: {
      width: '100%',
      minHeight: '120px',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #cbd5e1',
      fontSize: '1rem',
      fontFamily: 'inherit',
      resize: 'vertical',
      marginBottom: '24px',
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    modalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
    }
  };

  return (
    <div style={styles.layout}>
      <SidebarManager />
      <main style={styles.main}>
        <div style={styles.container}>
          <div style={styles.card}>
            <header style={styles.header}>
              <h2 style={styles.title}>Detalle de Solicitud</h2>
              <Link to="/manager/ausencias/solicitudes" style={styles.backLink}>
                <i className='bx bx-arrow-back'></i> Volver
              </Link>
            </header>

            {loading && <div style={{ textAlign: 'center', padding: '40px' }}>Cargando información...</div>}
            {err && <div style={{ color: '#dc2626', textAlign: 'center' }}>{err}</div>}

            {!loading && data && (
              <>
                <div style={styles.grid}>
                  {/* Columna Izquierda: Datos del Colaborador */}
                  <div>
                    <h3 style={styles.sectionTitle}>Datos del Colaborador</h3>
                    <div style={styles.infoGroup}>
                      <div style={{ marginBottom: '16px' }}>
                        <div style={styles.label}>Nombre Completo</div>
                        <div style={styles.value}>{data.nombres} {data.apellidos}</div>
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <div style={styles.label}>Email Corporativo</div>
                        <div style={styles.value}>{data.email}</div>
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <div style={styles.label}>Departamento</div>
                        <div style={styles.value}>{data.unidad_organizacional}</div>
                      </div>
                      <div>
                        <div style={styles.label}>Puesto Actual</div>
                        <div style={styles.value}>{data.puesto}</div>
                      </div>
                    </div>
                  </div>

                  {/* Columna Derecha: Datos de Solicitud */}
                  <div>
                    <h3 style={styles.sectionTitle}>Información de Ausencia</h3>
                    <div style={styles.infoGroup}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <div style={styles.label}>Tipo</div>
                          <div style={styles.value}>{data.tipo_ausencia}</div>
                        </div>
                        <div>
                          <div style={styles.label}>Estado Actual</div>
                          <div style={styles.statusBadge(data.estado_label)}>{data.estado_label}</div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <div style={styles.label}>Desde</div>
                          <div style={styles.value}>{fmtDate(data.fecha_inicio)}</div>
                        </div>
                        <div>
                          <div style={styles.label}>Hasta</div>
                          <div style={styles.value}>{fmtDate(data.fecha_fin)}</div>
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <div style={styles.label}>Motivo Declarado</div>
                        <div style={{ ...styles.value, fontStyle: 'italic', color: '#475569' }}>"{data.motivo || "Sin motivo especificado"}"</div>
                      </div>

                      <div>
                        <div style={styles.label}>Días Hábiles</div>
                        <div style={styles.value}>{data.dias_habiles} días</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección Calendario */}
                <div style={{ marginTop: '40px' }}>
                  <h3 style={styles.sectionTitle}>Desglose de Días</h3>
                  <div style={styles.tableContainer}>
                    {rango.length ? (
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>Fecha</th>
                            <th style={styles.th}>Día Semana</th>
                            <th style={styles.th}>Estado</th>
                            <th style={styles.th}>Observación</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rango.map((d, i) => {
                            const iso = d.toISOString().slice(0, 10);
                            const diaSemana = d.toLocaleDateString("es-EC", { weekday: 'long' });
                            return (
                              <tr key={iso} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                                <td style={styles.td}>{d.toLocaleDateString("es-EC")}</td>
                                <td style={{ ...styles.td, textTransform: 'capitalize' }}>{diaSemana}</td>
                                <td style={styles.td}><span style={{ color: '#64748b' }}>Ausente</span></td>
                                <td style={styles.td}>-</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ padding: '24px', color: '#64748b', textAlign: 'center' }}>No se pudo calcular el rango de fechas.</div>
                    )}
                  </div>
                </div>

                {/* Botones de Acción */}
                <div style={styles.actions}>
                  <button
                    style={styles.button('cancel')}
                    onClick={() => navigate("/manager/ausencias/solicitudes")}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  >
                    Volver
                  </button>
                  {/* Solo mostrar acciones si está pendiente (asumiendo lógica de negocio) o siempre */}
                  <button
                    style={styles.button('reject')}
                    onClick={() => openModal(2)}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  >
                    <i className='bx bx-x'></i> Rechazar
                  </button>
                  <button
                    style={styles.button('approve')}
                    onClick={() => openModal(1)}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                  >
                    <i className='bx bx-check'></i> Aprobar
                  </button>
                </div>

              </>
            )}
          </div>
        </div>

        {/* Modal de Confirmación */}
        {showModal && (
          <div style={styles.modalOverlay} onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}>
            <div style={styles.modalContent}>
              <h3 style={styles.modalTitle}>
                {actionType === 1 ? "Aprobar Solicitud" : "Rechazar Solicitud"}
              </h3>
              <p style={{ marginBottom: '20px', color: '#64748b' }}>
                {actionType === 1
                  ? "¿Estás seguro de que deseas aprobar esta solicitud? Puedes añadir un comentario opcional."
                  : "Indica el motivo del rechazo para notificar al colaborador."}
              </p>

              <label style={styles.modalLabel}>
                Comentario {actionType === 1 ? "(Opcional)" : "(Requerido para rechazo)"}
              </label>
              <textarea
                style={{
                  ...styles.textarea,
                  borderColor: (actionType === 2 && !comment.trim() && isSubmitting) ? '#dc2626' : '#cbd5e1'
                }}
                placeholder={actionType === 1 ? "Ej: Disfruta tus vacaciones..." : "Ej: Fechas cruzan con proyecto crítico..."}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                autoFocus
              />

              <div style={styles.modalActions}>
                <button
                  style={styles.button('cancel')}
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  style={{
                    ...styles.button(actionType === 1 ? 'approve' : 'reject'),
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => {
                    // Validación simple antes de enviar
                    if (actionType === 2 && !comment.trim()) {
                      alert("El comentario es obligatorio para rechazar.");
                      return;
                    }
                    handleConfirm();
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Procesando..." : (actionType === 1 ? "Confirmar Aprobación" : "Confirmar Rechazo")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
