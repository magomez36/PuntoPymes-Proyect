import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const TIPO = {
  1: "auto",
  2: "manager",
  3: "360",
};

const fmtDT = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleString("es-EC");
};

export default function EvaluacionesDesempeno() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/manager/evaluaciones/");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "No se pudo cargar.");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando evaluaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar evaluación de desempeño?")) return;
    try {
      const res = await apiFetch(`/api/manager/evaluaciones/${id}/`, { method: "DELETE" });
      if (!res.ok) {
        const out = await res.json().catch(() => ({}));
        throw new Error(out?.detail || "No se pudo eliminar.");
      }
      await load();
    } catch (e) {
      alert(e?.message || "Error eliminando.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Evaluaciones de Desempeño (Mi Equipo)</h2>

        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button onClick={() => navigate("/manager/evaluaciones/crear")}>Crear Evaluación</button>
          <Link to="/manager/inicio">Volver al inicio</Link>
        </div>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Email</th>
                <th>Evaluador</th>
                <th>Periodo</th>
                <th>Tipo</th>
                <th>Instrumento</th>
                <th>Puntaje</th>
                <th>Comentarios</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.nombres}</td>
                  <td>{r.apellidos}</td>
                  <td>{r.email}</td>
                  <td>{r.evaluador_nombre || "N/A"}</td>
                  <td>{r.periodo}</td>
                  <td>{TIPO[r.tipo] || r.tipo_label || r.tipo}</td>

                  <td style={{ maxWidth: 420 }}>
                    {Array.isArray(r.instrumento_resumen) && r.instrumento_resumen.length ? (
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {r.instrumento_resumen.map((it, idx) => (
                          <li key={`${r.id}-${idx}`}>
                            <strong>{it.competencia}</strong> — {it.peso_pct}% (peso {it.peso})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "N/A"
                    )}
                  </td>

                  <td>{r.puntaje_total}</td>
                  <td style={{ maxWidth: 260 }}>{r.comentarios || "N/A"}</td>
                  <td>{fmtDT(r.fecha)}</td>

                  <td>
                    <button onClick={() => navigate(`/manager/evaluaciones/editar/${r.id}`)}>Editar</button>{" "}
                    <button onClick={() => eliminar(r.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="11">No hay evaluaciones registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
