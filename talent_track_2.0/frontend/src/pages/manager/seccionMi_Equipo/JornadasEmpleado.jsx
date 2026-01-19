import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SidebarManager from "../../../components/SidebarManager";
import { apiFetch } from "../../../services/api";
// import "./jornadas-empleado.css";

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

export default function JornadasEmpleado() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/manager/mi-equipo/empleados/${id}/jornadas/`);
      const d = await res.json();
      if (!res.ok) throw new Error(d?.detail || "No se pudo cargar jornadas.");
      setPayload(d);
    } catch (e) {
      setErr(e?.message || "Error cargando jornadas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const empleado = payload?.empleado;
  const contrato = payload?.contrato;
  const jornadas = Array.isArray(payload?.jornadas) ? payload.jornadas : [];

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
    summaryCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
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
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      overflowX: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '900px',
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
    badge: (estado) => {
      const e = (estado || '').toLowerCase();
      let bg = '#f1f5f9';
      let text = '#475569';

      if (e.includes('completo') && !e.includes('in')) { bg = '#dcfce7'; text = '#166534'; }
      else if (e.includes('incompleto')) { bg = '#fee2e2'; text = '#991b1b'; }
      else if (e.includes('sin')) { bg = '#ffedd5'; text = '#9a3412'; }

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

          {/* 1. Header Section */}
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={styles.title}>Historial de Jornadas</h2>
              <div style={styles.subtitle}>Detalle de asistencia calculada por día</div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={styles.buttonSecondary} onClick={() => navigate(`/manager/mi-equipo/empleados/${id}`)}>
                <i className='bx bx-user-circle'></i> Ver Perfil
              </button>
              <button style={styles.buttonSecondary} onClick={() => navigate("/manager/mi-equipo/empleados")}>
                <i className='bx bx-group'></i> Lista de Equipo
              </button>
            </div>
          </div>

          {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Cargando historial...</div>}
          {err && <div style={{ padding: '16px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', marginBottom: '24px' }}>{err}</div>}

          {!loading && (
            <>
              {/* 2. Summary Section (Employee Info) */}
              <div style={styles.summaryGrid}>
                <div style={styles.summaryCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <i className='bx bx-user' style={{ color: '#dc2626', fontSize: '1.2rem' }}></i>
                    <span style={styles.label}>Empleado</span>
                  </div>
                  <div style={{ ...styles.value, fontSize: '1.1rem' }}>{empleado?.nombre}</div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{empleado?.email}</div>
                </div>
                <div style={styles.summaryCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <i className='bx bx-file' style={{ color: '#dc2626', fontSize: '1.2rem' }}></i>
                    <span style={styles.label}>Contrato Vigente</span>
                  </div>
                  <div style={styles.value}>
                    {contrato ? contrato.resumen : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin contrato activo</span>}
                  </div>
                </div>
              </div>

              {/* 3. Table Card */}
              <div style={styles.card}>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Fecha</th>
                        <th style={styles.th}>Entrada / Salida</th>
                        <th style={styles.th}>Horas Trab.</th>
                        <th style={styles.th}>Tardanza</th>
                        <th style={styles.th}>Extras</th>
                        <th style={styles.th}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jornadas.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ ...styles.td, textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                            <i className='bx bx-calendar-x' style={{ fontSize: '3rem', marginBottom: '12px', display: 'block' }}></i>
                            No hay jornadas calculadas registradas.
                          </td>
                        </tr>
                      ) : (
                        jornadas.map(j => (
                          <tr key={j.id} style={{ backgroundColor: 'white' }}>
                            <td style={styles.td}>
                              <div style={{ fontWeight: '600', color: '#0f172a' }}>{fmtDate(j.fecha)}</div>
                            </td>
                            <td style={styles.td}>
                              <div style={{ fontSize: '0.9rem', color: '#334155' }}>
                                <div><i className='bx bx-log-in-circle' style={{ color: '#16a34a' }}></i> {fmtDT(j.hora_primera_entrada)}</div>
                                <div style={{ marginTop: '4px' }}><i className='bx bx-log-out-circle' style={{ color: '#dc2626' }}></i> {fmtDT(j.hora_ultimo_salida)}</div>
                              </div>
                            </td>
                            <td style={{ ...styles.td, fontWeight: '600' }}>{j.minutos_trabajados} min</td>
                            <td style={{ ...styles.td, color: j.minutos_tardanza > 0 ? '#dc2626' : '#64748b' }}>
                              {j.minutos_tardanza} min
                            </td>
                            <td style={{ ...styles.td, color: j.minutos_extra > 0 ? '#16a34a' : '#64748b' }}>
                              {j.minutos_extra} min
                            </td>
                            <td style={styles.td}>
                              <span style={styles.badge(j.estado_label)}>{j.estado_label || "N/A"}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
