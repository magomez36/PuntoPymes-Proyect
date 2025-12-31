import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const APLICA_A = {
  1: "puesto",
  2: "unidad",
  3: "empleado",
};

export default function PlantillasKPIsEmp() {
  const navigate = useNavigate();

  const [empresas, setEmpresas] = useState([]);
  const [empresaId, setEmpresaId] = useState("");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const loadEmpresas = async () => {
    const res = await apiFetch("/api/listado-empresas/");
    const data = await res.json();
    setEmpresas(Array.isArray(data) ? data : []);
  };

  const load = async (eid) => {
    setErr("");
    setLoading(true);
    try {
      if (!eid) {
        setRows([]);
        return;
      }
      const res = await apiFetch(`/api/plantillas-kpi/?empresa_id=${eid}`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando plantillas KPI.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadEmpresas();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    load(empresaId);
  }, [empresaId]);

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar plantilla KPI?")) return;
    try {
      const res = await apiFetch(`/api/plantillas-kpi/${id}/`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar.");
      await load(empresaId);
    } catch (e) {
      alert(e?.message || "Error eliminando.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Plantillas KPI por Empresa</h2>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <div>
            <label>Empresa: </label>{" "}
            <select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)}>
              <option value="">-- Selecciona --</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.razon_social}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => navigate(`/admin/plantillas-kpi/crear?empresa_id=${empresaId}`)}
            disabled={!empresaId}
          >
            Crear Plantilla KPI
          </button>
        </div>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && empresaId && (
          <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Nombre</th>
                <th>Aplica a</th>
                <th>Objetivos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.empresa_razon_social}</td>
                  <td>{r.nombre}</td>
                  <td>{APLICA_A[r.aplica_a] || r.aplica_a_label || "N/A"}</td>
                  <td style={{ maxWidth: 520 }}>
                    {/* Creativo y SIN JSON: listado legible */}
                    {Array.isArray(r.objetivos_resumen) && r.objetivos_resumen.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {r.objetivos_resumen.map((o, idx) => (
                          <li key={`${r.id}-${idx}`}>
                            <strong>{o.kpi_label}</strong>{" "}
                            <span>
                              | meta={o.meta} | rojo={o.umbral_rojo} | amarillo={o.umbral_amarillo}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>
                    <button onClick={() => navigate(`/admin/plantillas-kpi/editar/${r.id}`)}>Editar</button>{" "}
                    <button onClick={() => eliminar(r.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="5">No hay plantillas para esta empresa.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {!empresaId && !loading && <p>Selecciona una empresa para listar sus plantillas KPI.</p>}

        <div style={{ marginTop: 12 }}>
          <Link to="/superadmin/inicio">Volver al inicio</Link>
        </div>
      </main>
    </div>
  );
}
