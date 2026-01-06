import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

export default function SaldoVacaciones() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/rrhh/vacaciones/saldos/");
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.detail || "No se pudo cargar saldos.");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Error cargando saldos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cambiarPeriodo = async (row) => {
    const nuevo = window.prompt("Nuevo periodo (ej: 2026):", row.periodo || "");
    if (nuevo === null) return;

    const periodo = (nuevo || "").trim();
    if (!periodo) return alert("Periodo es obligatorio.");

    try {
      const res = await apiFetch(`/api/rrhh/vacaciones/saldos/${row.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ periodo }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out?.periodo || out?.detail || JSON.stringify(out));
      await load();
      alert("Periodo actualizado.");
    } catch (e) {
      alert(e?.message || "Error actualizando periodo.");
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar este saldo de vacaciones?")) return;

    try {
      const res = await apiFetch(`/api/rrhh/vacaciones/saldos/${id}/`, { method: "DELETE" });
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
        <h2>Saldos de Vacaciones</h2>

        <div style={{ marginBottom: 12 }}>
          <button onClick={() => navigate("/rrhh/vacaciones/saldos/crear")}>
            Crear Saldo Vacación
          </button>
        </div>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && !err && (
          <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Email</th>
                <th>Periodo</th>
                <th>Días asignados</th>
                <th>Días tomados</th>
                <th>Días disponibles</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="8">No hay saldos registrados.</td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.empleado_nombres}</td>
                    <td>{r.empleado_apellidos}</td>
                    <td>{r.empleado_email}</td>
                    <td>{r.periodo}</td>
                    <td>{r.dias_asignados}</td>
                    <td>{r.dias_tomados}</td>
                    <td>{r.dias_disponibles}</td>
                    <td style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => cambiarPeriodo(r)}>Cambiar periodo</button>
                      <button onClick={() => eliminar(r.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: 12 }}>
          <Link to="/rrhh/inicio">Volver al inicio</Link>
        </div>
      </main>
    </div>
  );
}
