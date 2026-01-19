import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SidebarManager from "../../../components/SidebarManager";
import { apiFetch } from "../../../services/api";

const TIPOS = [
  { id: 1, label: "auto" },
  { id: 2, label: "manager" },
  { id: 3, label: "360" },
];

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

function yearsRange() {
  const y = new Date().getFullYear();
  const out = [];
  for (let i = y - 2; i <= y + 2; i++) out.push(i);
  return out;
}

export default function CrearEvaluacionDesempeno() {
  const navigate = useNavigate();

  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    empleado_id: "",
    year: new Date().getFullYear(),
    quarter: "Q1",
    tipo: 2,
    puntaje_total: 0,
    comentarios: "",
  });

  const [instTmp, setInstTmp] = useState({ peso: 0.1, competencia: "" });
  const [instrumento, setInstrumento] = useState([]);

  const periodo = useMemo(() => `${form.year}-${form.quarter}`, [form.year, form.quarter]);

  const loadEmpleados = async () => {
    const res = await apiFetch("/api/manager/helpers/mi-equipo/empleados/");
    const data = await res.json();
    setEmpleados(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await loadEmpleados();
      } catch (e) {
        setErr(e?.message || "Error cargando empleados.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "puntaje_total") {
      const n = Number(value);
      if (Number.isNaN(n) || n < 0) return;
      setForm((p) => ({ ...p, [name]: n }));
      return;
    }
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onChangeTmp = (e) => {
    const { name, value } = e.target;
    if (name === "peso") {
      const n = Number(value);
      if (Number.isNaN(n) || n < 0) return;
      setInstTmp((p) => ({ ...p, peso: n }));
      return;
    }
    setInstTmp((p) => ({ ...p, competencia: value }));
  };

  const agregar = () => {
    setErr("");
    const comp = (instTmp.competencia || "").trim();
    const peso = Number(instTmp.peso);

    if (!comp) return setErr("Competencia es obligatoria.");
    if (Number.isNaN(peso) || peso < 0) return setErr("Peso inválido.");

    const item = { peso, competencia: comp };
    setInstrumento((p) => [...p, item]);
    setInstTmp({ peso: 0.1, competencia: "" });
  };

  const quitar = (idx) => {
    setInstrumento((p) => p.filter((_, i) => i !== idx));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.empleado_id) return setErr("Selecciona un empleado.");
    if (!instrumento.length) return setErr("Instrumento debe tener al menos 1 ítem.");

    const payload = {
      empleado_id: Number(form.empleado_id),
      periodo,
      tipo: Number(form.tipo),
      instrumento,
      puntaje_total: Number(form.puntaje_total),
      comentarios: form.comentarios || "",
    };

    try {
      const res = await apiFetch("/api/manager/evaluaciones/crear/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out?.detail || JSON.stringify(out));

      alert("Evaluación creada.");
      navigate("/manager/evaluaciones");
    } catch (e2) {
      setErr(e2?.message || "Error creando evaluación.");
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
      marginLeft: '80px', // Adjusted for fixed sidebar
      maxWidth: '1200px',
      width: '100%',
      margin: '0 auto'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '32px',
      border: '1px solid #e2e8f0',
      marginBottom: '24px'
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
    sectionTitle: {
      fontSize: '1.1rem',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '0.85rem',
      fontWeight: '600',
      color: '#475569',
      marginBottom: '8px',
      textTransform: 'uppercase'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '6px',
      border: '1px solid #cbd5e1',
      fontSize: '0.95rem',
      color: '#1e293b',
      transition: 'border-color 0.2s'
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '6px',
      border: '1px solid #cbd5e1',
      fontSize: '0.95rem',
      color: '#1e293b',
      backgroundColor: 'white'
    },
    row: {
      display: 'flex',
      gap: '24px',
      flexWrap: 'wrap'
    },
    col: {
      flex: 1,
      minWidth: '250px'
    },
    buttonPrimary: {
      backgroundColor: '#dc2626',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'background-color 0.2s',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    },
    buttonSecondary: {
      backgroundColor: 'white',
      color: '#475569',
      border: '1px solid #cbd5e1',
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'background-color 0.2s',
      marginRight: '12px'
    },
    buttonSmall: {
      backgroundColor: '#f1f5f9',
      color: '#475569',
      border: '1px solid #cbd5e1',
      padding: '8px 16px',
      borderRadius: '6px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '0.9rem',
    },
    tableBox: {
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      overflow: 'hidden',
      marginTop: '16px'
    }
  };

  return (
    <div style={styles.layout}>
      <SidebarManager />
      <main style={styles.main}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={styles.title}>Nueva Evaluación</h2>
          <div style={styles.subtitle}>Complete los datos para generar una nueva evaluación de desempeño.</div>
        </div>

        {loading && <p>Cargando información...</p>}
        {err && <div style={{ padding: '16px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', marginBottom: '24px', border: '1px solid #fecaca' }}>{err}</div>}

        {!loading && (
          <form onSubmit={onSubmit}>

            {/* Card 1: General Info */}
            <div style={styles.card}>
              <div style={styles.sectionTitle}>
                <i className='bx bx-user-pin' style={{ color: '#dc2626', fontSize: '1.2rem' }}></i>
                Información General
              </div>

              <div style={styles.row}>
                <div style={styles.col}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Empleado a Evaluar *</label>
                    <select name="empleado_id" value={form.empleado_id} onChange={onChange} style={styles.select}>
                      <option value="">-- Seleccione un colaborador --</option>
                      {empleados.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.nombres} {e.apellidos} ({e.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.col}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Periodo (Año - Cuarto) *</label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <select name="year" value={form.year} onChange={onChange} style={styles.select}>
                        {yearsRange().map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <select name="quarter" value={form.quarter} onChange={onChange} style={styles.select}>
                        {QUARTERS.map((q) => <option key={q} value={q}>{q}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div style={styles.col}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Tipo de Evaluación *</label>
                    <select name="tipo" value={form.tipo} onChange={onChange} style={styles.select}>
                      {TIPOS.map((t) => (
                        <option key={t.id} value={t.id}>{t.label.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Instrument Builder */}
            <div style={styles.card}>
              <div style={styles.sectionTitle}>
                <i className='bx bx-list-check' style={{ color: '#dc2626', fontSize: '1.2rem' }}></i>
                Definición de Instrumento (Competencias)
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={styles.row}>
                  <div style={{ flex: 1 }}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Competencia *</label>
                      <input name="competencia" value={instTmp.competencia} onChange={onChangeTmp} placeholder="Ej: Trabajo en equipo" style={styles.input} />
                    </div>
                  </div>
                  <div style={{ width: '150px' }}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Peso (0-1)</label>
                      <input type="number" step="0.01" min="0" name="peso" value={instTmp.peso} onChange={onChangeTmp} style={styles.input} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '14px' }}>
                    <button type="button" onClick={agregar} style={{ ...styles.buttonSmall, backgroundColor: '#1e293b', color: 'white', border: 'none' }}>
                      <i className='bx bx-plus'></i> Añadir
                    </button>
                  </div>
                </div>
              </div>

              {/* Table of items */}
              {instrumento.length > 0 ? (
                <div style={styles.tableBox}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', color: '#64748b' }}>COMPETENCIA</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.85rem', color: '#64748b' }}>PESO</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.85rem', color: '#64748b' }}>ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {instrumento.map((it, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 16px', color: '#334155' }}>{it.competencia}</td>
                          <td style={{ padding: '12px 16px', color: '#334155' }}>{it.peso}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button type="button" onClick={() => quitar(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>
                              <i className='bx bx-trash'></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontStyle: 'italic', border: '2px dashed #e2e8f0', borderRadius: '8px' }}>
                  No se han añadido competencias al instrumento aún. Añada al menos una arriba.
                </div>
              )}
            </div>

            {/* Card 3: Results & Comments */}
            <div style={styles.card}>
              <div style={styles.sectionTitle}>
                <i className='bx bx-bar-chart-alt-2' style={{ color: '#dc2626', fontSize: '1.2rem' }}></i>
                Resultados y Feedback
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Puntaje Total (0 - 100)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  name="puntaje_total"
                  value={form.puntaje_total}
                  onChange={onChange}
                  style={{ ...styles.input, maxWidth: '200px', fontSize: '1.1rem', fontWeight: 'bold' }}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Comentarios Finales</label>
                <textarea
                  name="comentarios"
                  value={form.comentarios}
                  onChange={onChange}
                  rows="4"
                  style={{ ...styles.input, fontFamily: 'inherit' }}
                  placeholder="Ingrese feedback cualitativo aquí..."
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '40px' }}>
              <button type="button" onClick={() => navigate("/manager/evaluaciones")} style={styles.buttonSecondary}>
                Cancelar
              </button>
              <button type="submit" style={styles.buttonPrimary}>
                Guardar Evaluación
              </button>
            </div>

          </form>
        )}
      </main>
    </div>
  );
}
