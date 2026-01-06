import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
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

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Crear Evaluación de Desempeño</h2>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <form onSubmit={onSubmit}>
            <div>
              <label>Empleado (mi equipo) *</label>
              <select name="empleado_id" value={form.empleado_id} onChange={onChange}>
                <option value="">-- Selecciona --</option>
                {empleados.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.email} — {e.nombres} {e.apellidos}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 8 }}>
              <label>Periodo *</label>{" "}
              <select name="year" value={form.year} onChange={onChange}>
                {yearsRange().map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>{" "}
              <select name="quarter" value={form.quarter} onChange={onChange}>
                {QUARTERS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>{" "}
              <span style={{ marginLeft: 8 }}>
                <strong>{periodo}</strong>
              </span>
            </div>

            <div style={{ marginTop: 8 }}>
              <label>Tipo *</label>
              <select name="tipo" value={form.tipo} onChange={onChange}>
                {TIPOS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <hr />

            <h3>Instrumento (obligatorio, mínimo 1)</h3>

            <div>
              <label>Peso (decimal = 0)</label>
              <input type="number" step="0.01" min="0" name="peso" value={instTmp.peso} onChange={onChangeTmp} />
            </div>

            <div>
              <label>Competencia *</label>
              <input name="competencia" value={instTmp.competencia} onChange={onChangeTmp} />
            </div>

            <div style={{ marginTop: 8 }}>
              <button type="button" onClick={agregar}>
                + Añadir al instrumento
              </button>
            </div>

            <div style={{ marginTop: 12 }}>
              {instrumento.length ? (
                <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th>Competencia</th>
                      <th>Peso</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {instrumento.map((it, idx) => (
                      <tr key={idx}>
                        <td>{it.competencia}</td>
                        <td>{it.peso}</td>
                        <td>
                          <button type="button" onClick={() => quitar(idx)}>
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No has agregado ítems aún.</p>
              )}
            </div>

            <hr />

            <div>
              <label>Puntaje total (decimal = 0)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="puntaje_total"
                value={form.puntaje_total}
                onChange={onChange}
              />
            </div>

            <div style={{ marginTop: 8 }}>
              <label>Comentarios</label>
              <textarea name="comentarios" value={form.comentarios} onChange={onChange} rows="4" />
            </div>

            <div style={{ marginTop: 12 }}>
              <Link to="/manager/evaluaciones">Cancelar</Link>{" "}
              <button type="submit">Crear</button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
