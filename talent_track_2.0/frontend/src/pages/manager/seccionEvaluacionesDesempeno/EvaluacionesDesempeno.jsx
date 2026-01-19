import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SidebarManager from "../../../components/SidebarManager"; // Correct component
import { apiFetch } from "../../../services/api";

const TIPO = {
  1: "auto",
  2: "manager",
  3: "360",
};

const fmtDT = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleString("es-EC");
};

export default function EvaluacionesDesempeno() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/manager/evaluaciones/");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "No se pudo cargar.");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando evaluaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar evaluación de desempeño?")) return;
    try {
      const res = await apiFetch(`/api/manager/evaluaciones/${id}/`, { method: "DELETE" });
      if (!res.ok) {
        const out = await res.json().catch(() => ({}));
        throw new Error(out?.detail || "No se pudo eliminar.");
      }
      await load();
    } catch (e) {
      alert(e?.message || "Error eliminando.");
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
      padding: '24px',
      marginLeft: '80px', // FIX: Offset for fixed sidebar (72px + spacing)
      overflowX: 'hidden',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '24px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
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
    buttonPrimary: {
      backgroundColor: '#dc2626',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '0.95rem',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
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
    actionBtn: (type) => ({
      backgroundColor: type === 'edit' ? '#fff7ed' : '#fee2e2',
      color: type === 'edit' ? '#c2410c' : '#991b1b',
      border: 'none',
      width: '32px',
      height: '32px',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.1rem',
      transition: 'all 0.2s',
    }),
    tableContainer: {
      borderRadius: '8px',
      overflowX: 'auto',
      border: '1px solid #e2e8f0',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      backgroundColor: '#f8fafc',
      padding: '12px',
      textAlign: 'left',
      fontSize: '0.8rem',
      fontWeight: '600',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: '1px solid #e2e8f0',
      whiteSpace: 'nowrap',
    },
    td: {
      padding: '12px',
      fontSize: '0.9rem',
      color: '#334155',
      borderBottom: '1px solid #f1f5f9',
      verticalAlign: 'top'
    },
    badge: {
      backgroundColor: '#e0f2fe',
      color: '#0369a1',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '0.8rem',
      fontWeight: '600',
      textTransform: 'uppercase'
    }
  };

  return (
    <div style={styles.layout}>
      <SidebarManager />
      <main style={styles.main}>

        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={styles.title}>Evaluaciones de Desempeño</h2>
            <div style={styles.subtitle}>Gestione las evaluaciones trimestrales de su equipo.</div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={styles.buttonPrimary} onClick={() => navigate("/manager/evaluaciones/crear")}>
              <i className='bx bx-plus'></i> Nueva Evaluación
            </button>
          </div>
        </div>

        {/* Content Card */}
        <div style={styles.card}>
          {loading && <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Cargando evaluaciones...</div>}
          {err && <div style={{ padding: '16px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', marginBottom: '24px' }}>{err}</div>}

          {!loading && (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Colaborador</th>
                    <th style={styles.th}>Periodo / Tipo</th>
                    <th style={styles.th}>Evaluador Principal</th>
                    <th style={{ ...styles.th, minWidth: '300px' }}>Resumen Instrumento</th>
                    <th style={styles.th}>Puntaje Final</th>
                    <th style={styles.th}>Comentarios</th>
                    <th style={styles.th}>Fecha Registro</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ ...styles.td, textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                        <i className='bx bx-clipboard' style={{ fontSize: '3rem', marginBottom: '12px', display: 'block', color: '#cbd5e1' }}></i>
                        No hay evaluaciones de desempeño registradas.
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.id} style={{ backgroundColor: 'white' }}>
                        <td style={styles.td}>
                          <div style={{ fontWeight: '600', color: '#0f172a' }}>{r.nombres} {r.apellidos}</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{r.email}</div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: '600', color: '#475569' }}>{r.periodo}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'capitalize' }}>{TIPO[r.tipo] || r.tipo_label || r.tipo}</div>
                        </td>
                        <td style={styles.td}>
                          {r.evaluador_nombre || <span style={{ color: '#94a3b8' }}>N/A</span>}
                        </td>
                        <td style={styles.td}>
                          {Array.isArray(r.instrumento_resumen) && r.instrumento_resumen.length ? (
                            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.85rem', color: '#475569' }}>
                              {r.instrumento_resumen.slice(0, 3).map((it, idx) => (
                                <li key={`${r.id}-${idx}`} style={{ marginBottom: '2px' }}>
                                  <strong>{it.competencia}</strong>: {it.peso_pct}%
                                </li>
                              ))}
                              {r.instrumento_resumen.length > 3 && <li>...</li>}
                            </ul>
                          ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin detalle</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.1rem' }}>{r.puntaje_total}</span>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/100</span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#64748b' }} title={r.comentarios}>
                            {r.comentarios || "—"}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontSize: '0.9rem', color: '#334155' }}>{fmtDT(r.fecha)}</div>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              style={styles.actionBtn('edit')}
                              onClick={() => navigate(`/manager/evaluaciones/editar/${r.id}`)}
                              title="Editar Evaluación"
                            >
                              <i className='bx bx-edit-alt'></i>
                            </button>
                            <button
                              style={styles.actionBtn('delete')}
                              onClick={() => eliminar(r.id)}
                              title="Eliminar Evaluación"
                            >
                              <i className='bx bx-trash'></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
