import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

function buildYears(centerYear = new Date().getFullYear(), back = 5, forward = 2) {
  const years = [];
  for (let y = centerYear - back; y <= centerYear + forward; y++) years.push(String(y));
  return years;
}

export default function CrearSaldoVacacion() {
  const navigate = useNavigate();

  const [empleados, setEmpleados] = useState([]);
  const [saldos, setSaldos] = useState([]);

  const [form, setForm] = useState({
    empleado_id: "",
    periodo: "",
    dias_asignados: "0.00",
  });

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const years = useMemo(() => buildYears(), []);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const [resEmp, resSaldos] = await Promise.all([
        apiFetch("/api/rrhh/vacaciones/helpers/empleados/"),
        apiFetch("/api/rrhh/vacaciones/saldos/"),
      ]);

      const dataEmp = await resEmp.json().catch(() => []);
      const dataSaldos = await resSaldos.json().catch(() => []);

      if (!resEmp.ok) throw new Error(dataEmp?.detail || "No se pudo cargar empleados.");
      if (!resSaldos.ok) throw new Error(dataSaldos?.detail || "No se pudo cargar saldos existentes.");

      setEmpleados(Array.isArray(dataEmp) ? dataEmp : []);
      setSaldos(Array.isArray(dataSaldos) ? dataSaldos : []);
    } catch (e) {
      setErr(e?.message || "Error cargando datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const periodosOcupados = useMemo(() => {
    const eid = Number(form.empleado_id);
    if (!eid) return new Set();
    const used = saldos
      .filter((s) => Number(s.empleado) === eid)
      .map((s) => String(s.periodo));
    return new Set(used);
  }, [form.empleado_id, saldos]);

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "dias_asignados") {
      // No negativos
      const n = Number(value);
      if (Number.isNaN(n) || n < 0) return;
      setForm((p) => ({ ...p, [name]: value }));
      return;
    }

    // al cambiar empleado, resetea periodo
    if (name === "empleado_id") {
      setForm((p) => ({ ...p, empleado_id: value, periodo: "" }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.empleado_id) return setErr("Selecciona un empleado.");
    if (!form.periodo) return setErr("Selecciona un periodo.");
    if (periodosOcupados.has(String(form.periodo))) return setErr("Ese periodo ya existe para este empleado.");

    const diasAsignadosNum = Number(form.dias_asignados);
    if (Number.isNaN(diasAsignadosNum) || diasAsignadosNum < 0) return setErr("Días asignados inválidos.");

    try {
      const res = await apiFetch("/api/rrhh/vacaciones/saldos/", {
        method: "POST",
        body: JSON.stringify({
          empleado_id: Number(form.empleado_id),
          periodo: String(form.periodo),
          dias_asignados: String(Number(form.dias_asignados).toFixed(2)),
        }),
      });

      const out = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(out?.periodo || out?.detail || JSON.stringify(out));
      }

      alert("Saldo de vacaciones creado.");
      navigate("/rrhh/vacaciones/saldos");
    } catch (e2) {
      setErr(e2?.message || "Error creando saldo.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Crear Saldo Vacación</h2>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <form onSubmit={submit} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
            <label>
              Empleado (email)
              <select name="empleado_id" value={form.empleado_id} onChange={onChange}>
                <option value="">-- Seleccione --</option>
                {empleados.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.email} ({e.nombres} {e.apellidos})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Periodo (año)
              <select
                name="periodo"
                value={form.periodo}
                onChange={onChange}
                disabled={!form.empleado_id}
              >
                <option value="">-- Seleccione --</option>
                {years.map((y) => (
                  <option key={y} value={y} disabled={periodosOcupados.has(y)}>
                    {y}{periodosOcupados.has(y) ? " (ya existe)" : ""}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Días asignados (decimal, = 0)
              <input
                type="number"
                name="dias_asignados"
                min="0"
                step="0.01"
                value={form.dias_asignados}
                onChange={onChange}
              />
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit">Guardar</button>
              <button type="button" onClick={() => navigate("/rrhh/vacaciones/saldos")}>
                Cancelar
              </button>
            </div>

            <Link to="/rrhh/vacaciones/saldos">Volver</Link>
          </form>
        )}
      </main>
    </div>
  );
}
