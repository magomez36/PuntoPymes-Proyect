import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const fmtDate = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-EC");
};

export default function AsignacionesKPI() {
  const navigate = useNavigate();

  const [asignaciones, setAsignaciones] = useState([]);
  const [plantillas, setPlantillas] = useState([]);
  const [kpis, setKpis] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const [r1, r2, r3] = await Promise.all([
        apiFetch("/api/auditor/desempeno/asignaciones-kpi/"),
        apiFetch("/api/auditor/desempeno/plantillas-kpi/"),
        apiFetch("/api/auditor/desempeno/kpis/"),
      ]);

      const d1 = await r1.json().catch(() => []);
      const d2 = await r2.json().catch(() => []);
      const d3 = await r3.json().catch(() => []);

      if (!r1.ok) throw new Error(d1?.detail || JSON.stringify(d1));
      if (!r2.ok) throw new Error(d2?.detail || JSON.stringify(d2));
      if (!r3.ok) throw new Error(d3?.detail || JSON.stringify(d3));

      setAsignaciones(Array.isArray(d1) ? d1 : []);
      setPlantillas(Array.isArray(d2) ? d2 : []);
      setKpis(Array.isArray(d3) ? d3 : []);
    } catch (e) {
      setErr(e?.message || "Error cargando desempeño/KPI.");
      setAsignaciones([]);
      setPlantillas([]);
      setKpis([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Auditoría — Asignaciones de KPI</h2>

        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button onClick={() => navigate("/auditor/desempeno/resultados-kpi")}>
            Ver resultados KPI
          </button>
          <button onClick={() => navigate("/auditor/desempeno/evaluaciones")}>
            Ver evaluaciones desempeño
          </button>
        </div>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <>
            {/* TABLA PRINCIPAL */}
            <h3>Asignaciones por empleado</h3>
            <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Email</th>
                  <th>Plantilla KPI</th>
                  <th>Desde</th>
                  <th>Hasta</th>
                </tr>
              </thead>
              <tbody>
                {asignaciones.map((r) => (
                  <tr key={r.id}>
                    <td>{r.nombres}</td>
                    <td>{r.apellidos}</td>
                    <td>{r.email}</td>
                    <td>{r.plantilla_nombre}</td>
                    <td>{fmtDate(r.desde)}</td>
                    <td>{r.hasta ? fmtDate(r.hasta) : "Sin fecha límite"}</td>
                  </tr>
                ))}
                {asignaciones.length === 0 && (
                  <tr>
                    <td colSpan="6">No hay asignaciones registradas.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* TABLA PLANTILLAS */}
            <div style={{ marginTop: 18 }}>
              <h3>Plantillas KPI (catálogo)</h3>
              <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Aplica a</th>
                    <th>Objetivos (resumen)</th>
                  </tr>
                </thead>
                <tbody>
                  {plantillas.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nombre}</td>
                      <td>{p.aplica_a_label}</td>
                      <td style={{ maxWidth: 520 }}>
                        {Array.isArray(p.objetivos_humanos) && p.objetivos_humanos.length ? (
                          <ul style={{ margin: 0, paddingLeft: 18 }}>
                            {p.objetivos_humanos.map((o, idx) => (
                              <li key={idx}>
                                <strong>{o.kpi}</strong> — Meta: {o.meta} | Umbral rojo:{" "}
                                {o.umbral_rojo} | Umbral amarillo: {o.umbral_amarillo}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "N/A"
                        )}
                      </td>
                    </tr>
                  ))}
                  {plantillas.length === 0 && (
                    <tr>
                      <td colSpan="3">No hay plantillas registradas.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* TABLA KPIs */}
            <div style={{ marginTop: 18 }}>
              <h3>KPIs definidos (catálogo)</h3>
              <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Unidad</th>
                    <th>Origen datos</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.map((k) => (
                    <tr key={k.id}>
                      <td>{k.codigo}</td>
                      <td>{k.nombre}</td>
                      <td style={{ maxWidth: 520 }}>{k.descripcion}</td>
                      <td>{k.unidad_label}</td>
                      <td>{k.origen_label}</td>
                    </tr>
                  ))}
                  {kpis.length === 0 && (
                    <tr>
                      <td colSpan="5">No hay KPIs registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
