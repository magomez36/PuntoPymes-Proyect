import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const APLICA_A_OPS = [
  { id: 1, label: "puesto" },
  { id: 2, label: "unidad" },
  { id: 3, label: "empleado" },
];

export default function EditarPlantillaKPI_Emp() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [kpis, setKpis] = useState([]);
  const [empresaId, setEmpresaId] = useState("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    aplica_a: 1,
  });

  const [objTmp, setObjTmp] = useState({
    kpi_id: "",
    meta: 0,
    umbral_rojo: 0,
    umbral_amarillo: 0,
  });

  const [objetivos, setObjetivos] = useState([]);

  const loadKPIs = async (eid) => {
    setKpis([]);
    if (!eid) return;
    const res = await apiFetch(`/api/helpers/kpis-por-empresa/?empresa_id=${eid}`);
    const data = await res.json();
    setKpis(Array.isArray(data) ? data : []);
  };

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/plantillas-kpi/${id}/`);
      const data = await res.json();

      const eid = String(data.empresa_id || "");
      setEmpresaId(eid);
      await loadKPIs(eid);

      setForm({
        nombre: data.nombre || "",
        aplica_a: Number(data.aplica_a || 1),
      });

      // objetivos vienen como lista (para edición)
      const raw = Array.isArray(data.objetivos) ? data.objetivos : [];
      const mapped = raw
        .filter((o) => o && typeof o === "object")
        .map((o) => ({
          kpi_id: Number(o.kpi_id),
          meta: Number(o.meta),
          umbral_rojo: Number(o.umbral_rojo),
          umbral_amarillo: Number(o.umbral_amarillo),
        }));
      setObjetivos(mapped);
    } catch (e) {
      setErr(e?.message || "Error cargando plantilla.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const kpiOptions = useMemo(() => {
    return kpis.map((k) => ({
      id: k.id,
      label: `${k.codigo} - ${k.nombre}`,
    }));
  }, [kpis]);

  const kpiLabel = (kid) => {
    const found = kpiOptions.find((k) => k.id === kid);
    return found ? found.label : `KPI #${kid}`;
  };

  const onChangeForm = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onChangeObjTmp = (e) => {
    const { name, value } = e.target;

    if (["meta", "umbral_rojo", "umbral_amarillo"].includes(name)) {
      const n = Number(value);
      if (Number.isNaN(n) || n < 0) return;
      setObjTmp((p) => ({ ...p, [name]: n }));
      return;
    }

    setObjTmp((p) => ({ ...p, [name]: value }));
  };

  const agregarObjetivo = () => {
    setErr("");

    if (!objTmp.kpi_id) return setErr("Selecciona un KPI.");
    const kid = Number(objTmp.kpi_id);

    if (objetivos.some((o) => o.kpi_id === kid)) {
      return setErr("Ya agregaste ese KPI en objetivos.");
    }

    const item = {
      kpi_id: kid,
      meta: Number(objTmp.meta),
      umbral_rojo: Number(objTmp.umbral_rojo),
      umbral_amarillo: Number(objTmp.umbral_amarillo),
    };

    setObjetivos((p) => [...p, item]);
    setObjTmp({ kpi_id: "", meta: 0, umbral_rojo: 0, umbral_amarillo: 0 });
  };

  const quitarObjetivo = (kid) => {
    setObjetivos((p) => p.filter((o) => o.kpi_id !== kid));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.nombre.trim()) return setErr("Nombre es obligatorio.");
    if (!objetivos.length) return setErr("Debes agregar al menos 1 objetivo.");

    const payload = {
      nombre: form.nombre.trim(),
      aplica_a: Number(form.aplica_a),
      objetivos,
    };

    try {
      const res = await apiFetch(`/api/plantillas-kpi/${id}/`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(data));
      }

      alert("Plantilla KPI actualizada.");
      navigate("/admin/plantillas-kpi");
    } catch (e2) {
      setErr(e2?.message || "Error actualizando.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Editar Plantilla KPI</h2>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <form onSubmit={onSubmit}>
            {/* Empresa no se edita y no se muestra, pero se usa para filtrar KPIs */}
            <div>
              <label>Nombre *</label>
              <input name="nombre" value={form.nombre} onChange={onChangeForm} />
            </div>

            <div>
              <label>Aplica a *</label>
              <select name="aplica_a" value={form.aplica_a} onChange={onChangeForm}>
                {APLICA_A_OPS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            <hr />

            <h3>Objetivos (mínimo 1)</h3>

            <div>
              <label>KPI *</label>
              <select name="kpi_id" value={objTmp.kpi_id} onChange={onChangeObjTmp} disabled={!empresaId}>
                <option value="">-- Selecciona --</option>
                {kpiOptions.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Meta (entero no negativo)</label>
              <input type="number" name="meta" min="0" step="1" value={objTmp.meta} onChange={onChangeObjTmp} />
            </div>

            <div>
              <label>Umbral rojo (entero no negativo)</label>
              <input
                type="number"
                name="umbral_rojo"
                min="0"
                step="1"
                value={objTmp.umbral_rojo}
                onChange={onChangeObjTmp}
              />
            </div>

            <div>
              <label>Umbral amarillo (entero no negativo)</label>
              <input
                type="number"
                name="umbral_amarillo"
                min="0"
                step="1"
                value={objTmp.umbral_amarillo}
                onChange={onChangeObjTmp}
              />
            </div>

            <div style={{ marginTop: 8 }}>
              <button type="button" onClick={agregarObjetivo}>
                + Añadir objetivo
              </button>
            </div>

            <div style={{ marginTop: 12 }}>
              {objetivos.length ? (
                <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th>KPI</th>
                      <th>Meta</th>
                      <th>Rojo</th>
                      <th>Amarillo</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {objetivos.map((o) => (
                      <tr key={o.kpi_id}>
                        <td>{kpiLabel(o.kpi_id)}</td>
                        <td>{o.meta}</td>
                        <td>{o.umbral_rojo}</td>
                        <td>{o.umbral_amarillo}</td>
                        <td>
                          <button type="button" onClick={() => quitarObjetivo(o.kpi_id)}>
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No hay objetivos.</p>
              )}
            </div>

            <div style={{ marginTop: 12 }}>
              <Link to="/admin/plantillas-kpi">Cancelar</Link>{" "}
              <button type="submit">Guardar</button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
