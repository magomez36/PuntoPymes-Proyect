import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

export default function CrearAsignacionKPI() {
  const navigate = useNavigate();

  const [empleados, setEmpleados] = useState([]);
  const [plantillas, setPlantillas] = useState([]);

  const [empleadoId, setEmpleadoId] = useState("");
  const [plantillaId, setPlantillaId] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState(""); // opcional

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const loadHelpers = async () => {
    setErr("");
    setLoading(true);
    try {
      const [resE, resP] = await Promise.all([
        apiFetch("/api/rrhh/kpi/helpers/empleados/"),
        apiFetch("/api/rrhh/kpi/helpers/plantillas/"),
      ]);

      const dataE = await resE.json().catch(() => []);
      const dataP = await resP.json().catch(() => []);

      if (!resE.ok) throw new Error(dataE?.detail || "No se pudo cargar empleados.");
      if (!resP.ok) throw new Error(dataP?.detail || "No se pudo cargar plantillas KPI.");

      setEmpleados(Array.isArray(dataE) ? dataE : []);
      setPlantillas(Array.isArray(dataP) ? dataP : []);
    } catch (e) {
      setErr(e?.message || "Error cargando datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHelpers();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!empleadoId) return setErr("Debe seleccionar un empleado.");
    if (!plantillaId) return setErr("Debe seleccionar una plantilla KPI.");
    if (!desde) return setErr("Debe seleccionar la fecha 'desde'.");

    try {
      const res = await apiFetch("/api/rrhh/kpi/asignaciones/", {
        method: "POST",
        body: JSON.stringify({
          empleado_id: Number(empleadoId),
          plantilla_id: Number(plantillaId),
          desde,
          hasta: hasta ? hasta : null,
        }),
      });

      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out?.detail || JSON.stringify(out));

      alert("Asignación creada.");
      navigate("/rrhh/kpi/asignaciones");
    } catch (e2) {
      setErr(e2?.message || "Error creando asignación.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Crear Asignación KPI</h2>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <form onSubmit={submit} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
            <label>
              Empleado (email)
              <select value={empleadoId} onChange={(e) => setEmpleadoId(e.target.value)}>
                <option value="">-- Seleccione --</option>
                {empleados.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.email} ({e.nombres} {e.apellidos})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Plantilla KPI
              <select value={plantillaId} onChange={(e) => setPlantillaId(e.target.value)}>
                <option value="">-- Seleccione --</option>
                {plantillas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Desde
              <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
            </label>

            <label>
              Hasta (opcional)
              <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit">Guardar</button>
              <button type="button" onClick={() => navigate("/rrhh/kpi/asignaciones")}>
                Cancelar
              </button>
            </div>

            <Link to="/rrhh/kpi/asignaciones">Volver</Link>
          </form>
        )}
      </main>
    </div>
  );
}
