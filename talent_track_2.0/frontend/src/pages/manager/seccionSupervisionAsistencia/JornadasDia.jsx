import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SidebarManager from "../../../components/SidebarManager";
import { apiFetch } from "../../../services/api";

const ESTADO = {
  1: "completo",
  2: "incompleto",
  3: "sin_registros",
};

const fmtDT = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleString("es-EC");
};

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function JornadasDia() {
  const navigate = useNavigate();

  const [fecha, setFecha] = useState(todayISO());
  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async (f) => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/manager/supervision-asistencia/jornadas/?fecha=${encodeURIComponent(f)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));

      setRows(Array.isArray(data?.results) ? data.results : []);
    } catch (e) {
      setRows([]);
      setErr(e?.message || "Error cargando jornadas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fecha) load(fecha);
    // eslint-disable-next-line
  }, []);

  const onBuscar = (e) => {
    e.preventDefault();
    if (!fecha) return setErr("Debes seleccionar una fecha.");
    load(fecha);
  };

  // Styles (Derived from AsistenciaDia.jsx)
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
      padding: '32px',
      border: '1px solid #e2e8f0',
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: '800',
      color: '#1e293b',
      margin: 0,
    },
    inputGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    input: {
      padding: '10px 16px',
      borderRadius: '6px',
      border: '1px solid #e2e8f0',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'border-color 0.2s',
      color: '#334155'
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
    tableContainer: {
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      overflowX: 'auto', // Add horizontal scroll for wide tables
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '1000px', // Ensure table doesn't shrink too much
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
      // 1: completo (green), 2: incompleto (red), 3: sin_registros (gray/orange)
      let bg = '#f1f5f9';
      let text = '#475569';

      // Match API state values/labels
      const e = String(estado).toLowerCase();

      if (e.includes('completo') && !e.includes('in')) { bg = '#dcfce7'; text = '#166534'; }
      else if (e.includes('incompleto')) { bg = '#fee2e2'; text = '#991b1b'; }
      else if (e.includes('sin')) { bg = '#ffedd5'; text = '#9a3412'; }

      return {
        backgroundColor: bg,
        color: text,
        padding: '4px 10px',
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
              <h2 style={styles.title}>Jornadas Calculadas</h2>
              <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '1.05rem' }}>Resumen de horas trabajadas y puntualidad.</p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={styles.buttonSecondary} onClick={() => navigate("/manager/supervision/asistencia")}>
                <i className='bx bx-list-ul'></i> Ver Eventos Individuales
              </button>
            </div>
          </div>

          {/* 2. Filters Section */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <form onSubmit={onBuscar} style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
              <div style={styles.inputGroup}>
                <label style={{ fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Fecha a consultar:</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <button type="submit" style={styles.buttonPrimary}>
                <i className='bx bx-search'></i> Actualizar Tabla
              </button>
            </form>

            {!loading && (
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                Jornadas encontradas: <b>{rows.length}</b>
              </div>
            )}
          </div>

          {/* 3. Data Table Section */}
          <div style={styles.card}>
            {loading && <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Calculando jornadas...</div>}
            {err && <div style={{ padding: '16px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', marginBottom: '24px' }}>{err}</div>}

            {!loading && (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Colaborador</th>
                      <th style={styles.th}>Estado Jornada</th>
                      <th style={styles.th}>Entrada / Salida</th>
                      <th style={styles.th} title="Minutos Trabajados">Trabajado</th>
                      <th style={styles.th} title="Minutos Tardanza">Tardanza</th>
                      <th style={styles.th} title="Minutos Extras">Extras</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const estadoTexto = ESTADO[r.estado] || r.estado_label || r.estado;
                      return (
                        <tr key={r.id} style={{ backgroundColor: 'white' }}>
                          <td style={styles.td}>
                            <div style={{ fontWeight: '600', color: '#0f172a' }}>{r.nombres} {r.apellidos}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{r.email}</div>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.badge(estadoTexto)}>{estadoTexto}</span>
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontSize: '0.9rem', color: '#334155' }}>
                              <div><i className='bx bx-log-in-circle' style={{ color: '#16a34a' }}></i> {fmtDT(r.hora_primera_entrada)}</div>
                              <div style={{ marginTop: '4px' }}><i className='bx bx-log-out-circle' style={{ color: '#dc2626' }}></i> {fmtDT(r.hora_ultimo_salida)}</div>
                            </div>
                          </td>
                          <td style={{ ...styles.td, fontWeight: '600' }}>{r.minutos_trabajados} min</td>
                          <td style={{ ...styles.td, color: r.minutos_tardanza > 0 ? '#dc2626' : '#64748b' }}>
                            {r.minutos_tardanza} min
                          </td>
                          <td style={{ ...styles.td, color: r.minutos_extra > 0 ? '#16a34a' : '#64748b' }}>
                            {r.minutos_extra} min
                          </td>
                        </tr>
                      );
                    })}

                    {rows.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ ...styles.td, textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                          <i className='bx bx-time-five' style={{ fontSize: '3rem', marginBottom: '12px', display: 'block' }}></i>
                          No se encontraron registros de jornadas para esta fecha.
                        </td>
                      </tr>
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
