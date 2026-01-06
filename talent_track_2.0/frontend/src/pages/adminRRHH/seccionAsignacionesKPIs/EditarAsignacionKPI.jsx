import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

export default function EditarAsignacionKPI() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plantillas, setPlantillas] = useState([]);
  const [empleadoInfo, setEmpleadoInfo] = useState(null);

  const [plantillaId, setPlantillaId] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const [resDetalle, resPlantillas] = await Promise.all([
        apiFetch(`/api/rrhh/kpi/asignaciones/${id}/`),
        apiFetch("/api/rrhh/kpi/helpers/plantillas/"),
      ]);

      const detalle = await resDetalle.json().catch(() => ({}));
      const pls = await resPlantillas.json().catch(() => []);

      if (!resDetalle.ok) throw new Error(detalle?.detail || "No se pudo cargar la asignación.");
      if (!resPlantillas.ok) throw new Error(pls?.detail || "No se pudo cargar plantillas KPI.");

      setPlantillas(Array.isArray(pls) ? pls : []);

      setEmpleadoInfo({
        nombres: detalle.empleado_nombres,
        apellidos: detalle.empleado_apellidos,
        email: detalle.empleado_email,
      });

      setPlantillaId(String(detalle.plantilla || ""));
      setDesde(detalle.desde || "");
      setHasta(detalle.hasta || "");
    } catch (e) {
      setErr(e?.message || "Error cargando datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!plantillaId) return setErr("Debe seleccionar una plantilla KPI.");
    if (!desde) return setErr("Debe seleccionar la fecha 'desde'.");

    try {
      const res = await apiFetch(`/api/rrhh/kpi/asignaciones/${id}/`, {
        method: "PUT",
        body: JSON.stringify({
          plantilla_id: Number(plantillaId),
          desde,
          hasta: hasta ? hasta : null,
        }),
      });

      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out?.detail || JSON.stringify(out));

      alert("Asignación actualizada.");
      navigate("/rrhh/kpi/asignaciones");
    } catch (e2) {
      setErr(e2?.message || "Error actualizando.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Editar Asignación KPI</h2>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <form onSubmit={submit} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
            {empleadoInfo && (
              <div style={{ padding: 10, border: "1px solid #ddd" }}>
                <p style={{ margin: 0 }}>
                  <strong>Empleado:</strong> {empleadoInfo.nombres} {empleadoInfo.apellidos}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Email:</strong> {empleadoInfo.email}
                </p>
              </div>
            )}

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
