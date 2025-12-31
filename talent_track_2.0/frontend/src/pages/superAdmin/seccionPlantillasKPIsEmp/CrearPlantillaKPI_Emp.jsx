import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const APLICA_A_OPS = [
  { id: 1, label: "puesto" },
  { id: 2, label: "unidad" },
  { id: 3, label: "empleado" },
];

export default function CrearPlantillaKPI_Emp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [empresas, setEmpresas] = useState([]);
  const [kpis, setKpis] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    empresa_id: searchParams.get("empresa_id") || "",
    nombre: "",
    aplica_a: 1,
  });

  // item temporal (para añadir)
  const [objTmp, setObjTmp] = useState({
    kpi_id: "",
    meta: 0,
    umbral_rojo: 0,
    umbral_amarillo: 0,
  });

  const [objetivos, setObjetivos] = useState([]);

  const loadEmpresas = async () => {
    const res = await apiFetch("/api/listado-empresas/");
    const data = await res.json();
    setEmpresas(Array.isArray(data) ? data : []);
  };

  const loadKPIs = async (empresaId) => {
    setKpis([]);
    if (!empresaId) return;
    const res = await apiFetch(`/api/helpers/kpis-por-empresa/?empresa_id=${empresaId}`);
    const data = await res.json();
    setKpis(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await loadEmpresas();
        if (form.empresa_id) {
          await loadKPIs(form.empresa_id);
        }
      } catch (e) {
        setErr(e?.message || "Error cargando data.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line
  }, []);

  const kpiOptions = useMemo(() => {
    return kpis.map((k) => ({
      id: k.id,
      label: `${k.codigo} - ${k.nombre}`,
    }));
  }, [kpis]);

  const onChangeForm = async (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));

    if (name === "empresa_id") {
      setObjetivos([]);
      setObjTmp({ kpi_id: "", meta: 0, umbral_rojo: 0, umbral_amarillo: 0 });
      await loadKPIs(value);
    }
  };

  const onChangeObjTmp = (e) => {
    const { name, value } = e.target;

    // enteros >=0
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

    if (!form.empresa_id) return setErr("Selecciona una empresa primero.");
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

  const quitarObjetivo = (kpi_id) => {
    setObjetivos((p) => p.filter((o) => o.kpi_id !== kpi_id));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.empresa_id) return setErr("Selecciona empresa.");
    if (!form.nombre.trim()) return setErr("Nombre es obligatorio.");
    if (!objetivos.length) return setErr("Debes agregar al menos 1 objetivo.");

    const payload = {
      empresa_id: Number(form.empresa_id),
      nombre: form.nombre.trim(),
      aplica_a: Number(form.aplica_a),
      objetivos,
    };

    try {
      const res = await apiFetch("/api/plantillas-kpi/crear/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(data));
      }

      alert("Plantilla KPI creada.");
      navigate("/admin/plantillas-kpi");
    } catch (e2) {
      setErr(e2?.message || "Error creando.");
    }
  };

  const kpiLabel = (id) => {
    const found = kpiOptions.find((k) => k.id === id);
    return found ? found.label : `KPI #${id}`;
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Crear Plantilla KPI</h2>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <form onSubmit={onSubmit}>
            <div>
              <label>Empresa *</label>
              <select name="empresa_id" value={form.empresa_id} onChange={onChangeForm}>
                <option value="">-- Selecciona --</option>
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.razon_social}
                  </option>
                ))}
              </select>
            </div>

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
              <select
                name="kpi_id"
                value={objTmp.kpi_id}
                onChange={onChangeObjTmp}
                disabled={!form.empresa_id}
              >
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
              <button type="button" onClick={agregarObjetivo} disabled={!form.empresa_id}>
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
                <p>No has agregado objetivos.</p>
              )}
            </div>

            <div style={{ marginTop: 12 }}>
              <Link to="/admin/plantillas-kpi">Cancelar</Link>{" "}
              <button type="submit">Crear</button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
