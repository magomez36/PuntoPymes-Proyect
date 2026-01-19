import React, { useEffect, useState } from "react";
// import "../../../assets/css/manager-supervision.css";
import { Link, useNavigate } from "react-router-dom";
import SidebarManager from "../../../components/SidebarManager";
import { apiFetch } from "../../../services/api";

const TIPO = {
  1: "check_in",
  2: "check_out",
  3: "pausa_in",
  4: "pausa_out",
};

const FUENTE = {
  1: "app",
  2: "web",
  3: "lector",
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

export default function AsistenciaDia() {
  const navigate = useNavigate();

  const [fecha, setFecha] = useState(todayISO());
  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async (f) => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/manager/supervision-asistencia/eventos/?fecha=${encodeURIComponent(f)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data));

      setRows(Array.isArray(data?.results) ? data.results : []);
    } catch (e) {
      setRows([]);
      setErr(e?.message || "Error cargando eventos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // carga inicial (hoy)
    if (fecha) load(fecha);
    // eslint-disable-next-line
  }, []);

  const onBuscar = (e) => {
    e.preventDefault();
    if (!fecha) return setErr("Debes seleccionar una fecha.");
    load(fecha);
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
    header: {
      marginBottom: '32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: '800',
      color: '#1e293b',
      margin: 0,
    },
    controls: {
      display: 'flex',
      gap: '24px',
      alignItems: 'center',
      marginTop: '24px',
      marginBottom: '32px',
      backgroundColor: '#f8fafc',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
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
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
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
    },
    td: {
      padding: '16px',
      fontSize: '0.95rem',
      color: '#334155',
      borderBottom: '1px solid #f1f5f9',
    },
    badge: (type) => {
      let bg = '#f1f5f9';
      let text = '#475569';

      if (type === 'check_in' || type === 1) { bg = '#dcfce7'; text = '#166534'; }
      else if (type === 'check_out' || type === 2) { bg = '#fee2e2'; text = '#991b1b'; }
      else if (type === 'pausa_in' || type === 3) { bg = '#ffedd5'; text = '#9a3412'; }
      else if (type === 'pausa_out' || type === 4) { bg = '#e0f2fe'; text = '#075985'; }

      return {
        backgroundColor: bg,
        color: text,
        padding: '4px 10px',
        borderRadius: '9999px',
        fontSize: '0.8rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        display: 'inline-block'
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
              <h2 style={styles.title}>Supervisión de Asistencia</h2>
              <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '1.05rem' }}>Eventos diarios de entrada y salida.</p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={styles.buttonSecondary} onClick={() => navigate("/manager/supervision/jornadas")}>
                <i className='bx bx-time'></i> Ver Jornadas
              </button>
            </div>
          </div>

          {/* 2. Filters Section (Separate Card/Bar) */}
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
                <i className='bx bx-search'></i> Actualizar Lista
              </button>
            </form>

            {!loading && (
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                Mostrando <b>{rows.length}</b> eventos
              </div>
            )}
          </div>

          {/* 3. Data Table Section (Main Card) */}
          <div style={styles.card}>

            {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Cargando datos...</div>}
            {err && <div style={{ padding: '16px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', marginBottom: '24px' }}>{err}</div>}

            {!loading && (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Colaborador</th>
                      <th style={styles.th}>Tipo de Evento</th>
                      <th style={styles.th}>Hora Registro</th>
                      <th style={styles.th}>Fuente</th>
                      <th style={styles.th}>Info. Contacto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const tipoTexto = TIPO[r.tipo] || r.tipo_label || r.tipo;
                      const fuenteTexto = FUENTE[r.fuente] || r.fuente_label || r.fuente;

                      return (
                        <tr key={r.id} style={{ backgroundColor: 'white' }}>
                          <td style={styles.td}>
                            <div style={{ fontWeight: '600', color: '#0f172a' }}>{r.nombres} {r.apellidos}</div>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.badge(r.tipo)}>{tipoTexto}</span>
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontFamily: 'monospace', fontSize: '1rem', color: '#334155' }}>{fmtDT(r.registrado_el)}</div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                              <i className={`bx ${fuenteTexto === 'app' ? 'bx-mobile' : 'bx-desktop'}`}></i>
                              <span style={{ textTransform: 'capitalize' }}>{fuenteTexto}</span>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{r.email}</div>
                          </td>
                        </tr>
                      );
                    })}

                    {rows.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ ...styles.td, textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                          <i className='bx bx-calendar-x' style={{ fontSize: '3rem', marginBottom: '12px', display: 'block' }}></i>
                          No existen eventos registrados para la fecha seleccionada.
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
