import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

function splitPeriodo(p) {
  // "2025-Q4" -> {year: 2025, quarter: "Q4"}
  if (!p || typeof p !== "string") return { year: new Date().getFullYear(), quarter: "Q1" };
  const [y, q] = p.split("-");
  const year = Number(y);
  const quarter = q || "Q1";
  return {
    year: Number.isFinite(year) ? year : new Date().getFullYear(),
    quarter: QUARTERS.includes(quarter) ? quarter : "Q1",
  };
}

export default function EditarEvaluacionDesempeno() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    quarter: "Q1",
    tipo: 2,
    puntaje_total: 0,
    comentarios: "",
  });

  const [instTmp, setInstTmp] = useState({ peso: 0.1, competencia: "" });
  const [instrumento, setInstrumento] = useState([]);

  const periodo = useMemo(() => `${form.year}-${form.quarter}`, [form.year, form.quarter]);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/manager/evaluaciones/${id}/`);
      const d = await res.json();
      if (!res.ok) throw new Error(d?.detail || "No se pudo cargar.");

      setData(d);

      const sp = splitPeriodo(d.periodo);
      setForm({
        year: sp.year,
        quarter: sp.quarter,
        tipo: Number(d.tipo || 2),
        puntaje_total: Number(d.puntaje_total || 0),
        comentarios: d.comentarios || "",
      });

      const inst = Array.isArray(d.instrumento) ? d.instrumento : [];
      const mapped = inst
        .filter((x) => x && typeof x === "object")
        .map((x) => ({
          peso: Number(x.peso ?? 0),
          competencia: String(x.competencia ?? "").trim(),
        }))
        .filter((x) => x.competencia);

      setInstrumento(mapped);
    } catch (e) {
      setErr(e?.message || "Error cargando evaluación.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

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

    setInstrumento((p) => [...p, { peso, competencia: comp }]);
    setInstTmp({ peso: 0.1, competencia: "" });
  };

  const quitar = (idx) => {
    setInstrumento((p) => p.filter((_, i) => i !== idx));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!instrumento.length) return setErr("Instrumento debe tener al menos 1 ítem.");

    const payload = {
      periodo,
      tipo: Number(form.tipo),
      instrumento,
      puntaje_total: Number(form.puntaje_total),
      comentarios: form.comentarios || "",
    };

    try {
      const res = await apiFetch(`/api/manager/evaluaciones/${id}/`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out?.detail || JSON.stringify(out));

      alert("Evaluación actualizada.");
      navigate("/manager/evaluaciones");
    } catch (e2) {
      setErr(e2?.message || "Error actualizando.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Editar Evaluación de Desempeño</h2>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && data && (
          <>
            <div style={{ marginBottom: 12 }}>
              <p>
                <strong>Empleado:</strong> {data.email} — {data.nombres} {data.apellidos}
              </p>
              <p>
                <strong>Evaluador:</strong> {data.evaluador_nombre || "N/A"}
              </p>
            </div>

            <form onSubmit={onSubmit}>
              <div>
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
                  <p>No hay ítems en el instrumento.</p>
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
                <button type="submit">Guardar</button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
