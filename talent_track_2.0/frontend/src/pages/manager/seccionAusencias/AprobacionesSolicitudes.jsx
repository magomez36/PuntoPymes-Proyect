import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SidebarManager from "../../../components/SidebarManager";
import { apiFetch } from "../../../services/api";
// import "./solicitudes-ausencias.css";

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

export default function AprobacionesSolicitudes() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/manager/ausencias/aprobaciones/");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));
      setRows(Array.isArray(data?.results) ? data.results : []);
    } catch (e) {
      setRows([]);
      setErr(e?.message || "Error cargando aprobaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
      marginLeft: '80px', // Adjusted for fixed sidebar
    },
    container: {
      maxWidth: '1400px', // Wider container for history table
      width: '100%',
      margin: '0 auto'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '40px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden' // Contain table overflow
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: '800',
      color: '#1e293b',
      margin: 0,
    },
    subtitle: {
      fontSize: '1.1rem',
      color: '#64748b',
      marginTop: '4px'
    },
    buttonSecondary: {
      backgroundColor: 'white',
      color: '#64748b',
      border: '1px solid #e2e8f0',
      padding: '8px 16px',
      borderRadius: '6px',
      fontWeight: '500',
      cursor: 'pointer',
      fontSize: '0.9rem',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    },
    tableContainer: {
      borderRadius: '8px',
      overflowX: 'auto',
      border: '1px solid #e2e8f0',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '1400px', // Wide table
    },
    th: {
      backgroundColor: '#f8fafc',
      padding: '16px',
      textAlign: 'left',
      fontSize: '0.85rem',
      fontWeight: '600',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: '1px solid #e2e8f0',
      whiteSpace: 'nowrap',
    },
    td: {
      padding: '16px',
      fontSize: '0.95rem',
      color: '#334155',
      borderBottom: '1px solid #f1f5f9',
    },
    badge: (action) => {
      const a = (action || '').toLowerCase();
      let bg = '#f1f5f9';
      let text = '#475569';

      if (a.includes('aprobado') || a.includes('approve')) { bg = '#dcfce7'; text = '#166534'; }
      else if (a.includes('rechazado') || a.includes('reject')) { bg = '#fee2e2'; text = '#991b1b'; }
      else if (a.includes('modificado')) { bg = '#e0f2fe'; text = '#075985'; }

      return {
        backgroundColor: bg,
        color: text,
        padding: '4px 12px',
        borderRadius: '9999px',
        fontSize: '0.8rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        display: 'inline-block',
        whiteSpace: 'nowrap'
      };
    }
  };

  return (
    <div style={styles.layout}>
      <SidebarManager />
      <main style={styles.main}>
        <div style={styles.container}>

          {/* Header */}
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={styles.title}>Historial de Aprobaciones</h2>
              <div style={styles.subtitle}>Registro de acciones realizadas por usted.</div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/manager/ausencias/solicitudes" style={styles.buttonSecondary}>
                <i className='bx bx-list-ul'></i> Volver a Solicitudes
              </Link>
            </div>
          </div>

          {/* Content Card */}
          <div style={styles.card}>
            {loading && <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Cargando historial...</div>}
            {err && <div style={{ padding: '16px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', marginBottom: '24px' }}>{err}</div>}

            {!loading && (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Colaborador</th>
                      <th style={styles.th}>Tipo Ausencia</th>
                      <th style={styles.th}>Fecha Inicio</th>
                      <th style={styles.th}>Fecha Fin</th>
                      <th style={styles.th}>Días</th>
                      <th style={styles.th}>Motivo</th>
                      <th style={styles.th}>Acción Tomada</th>
                      <th style={styles.th}>Comentario (Feedback)</th>
                      <th style={styles.th}>Fecha Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ ...styles.td, textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                          <i className='bx bx-history' style={{ fontSize: '3rem', marginBottom: '12px', display: 'block', color: '#cbd5e1' }}></i>
                          No hay historial de aprobaciones registrado.
                        </td>
                      </tr>
                    ) : (
                      rows.map((r) => (
                        <tr key={r.id} style={{ backgroundColor: 'white' }}>
                          <td style={styles.td}>
                            <div style={{ fontWeight: '600', color: '#0f172a' }}>{r.nombres} {r.apellidos}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{r.email}</div>
                          </td>
                          <td style={styles.td}>{r.tipo_ausencia}</td>
                          <td style={styles.td}>{fmtDate(r.fecha_inicio)}</td>
                          <td style={styles.td}>{fmtDate(r.fecha_fin)}</td>
                          <td style={{ ...styles.td, fontWeight: '600' }}>{r.dias_habiles}</td>
                          <td style={styles.td}>
                            <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#64748b' }} title={r.motivo}>
                              {r.motivo || "—"}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.badge(r.accion_label || r.accion)}>{r.accion_label || r.accion}</span>
                          </td>
                          <td style={styles.td}>
                            <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#64748b' }} title={r.comentario}>
                              {r.comentario || "—"}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontSize: '0.9rem', color: '#334155' }}>{fmtDT(r.fecha)}</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
