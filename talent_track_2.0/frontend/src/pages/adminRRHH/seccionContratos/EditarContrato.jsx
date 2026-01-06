import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const TIPOS = [
  { id: 1, label: "indefinido" },
  { id: 2, label: "plazo" },
  { id: 3, label: "temporal" },
  { id: 4, label: "practicante" },
];

const ESTADOS = [
  { id: 1, label: "activo" },
  { id: 2, label: "inactivo" },
];

export default function EditarContrato() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [empleados, setEmpleados] = useState([]);
  const [turnos, setTurnos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    empleado_id: "",
    turno_base_id: "",
    tipo: 1,
    fecha_inicio: "",
    fecha_fin: "",
    salario_base: "0.00",
    jornada_semanal_horas: 40,
    estado: 1,
  });

  const loadAll = async () => {
    const dRes = await apiFetch(`/api/rrhh/contratos/${id}/`);
    const dData = await dRes.json();

    const [eRes, tRes] = await Promise.all([
      apiFetch(`/api/rrhh/helpers/empleados-sin-contrato/?include_empleado_id=${dData.empleado_id}`),
      apiFetch("/api/rrhh/helpers/turnos-min/"),
    ]);
    const eData = await eRes.json();
    const tData = await tRes.json();

    setEmpleados(Array.isArray(eData) ? eData : []);
    setTurnos(Array.isArray(tData) ? tData : []);

    setForm({
      empleado_id: dData.empleado_id ? String(dData.empleado_id) : "",
      turno_base_id: dData.turno_base_id ? String(dData.turno_base_id) : "",
      tipo: Number(dData.tipo || 1),
      fecha_inicio: dData.fecha_inicio || "",
      fecha_fin: dData.fecha_fin || "",
      salario_base: dData.salario_base || "0.00",
      jornada_semanal_horas: Number(dData.jornada_semanal_horas ?? 0),
      estado: Number(dData.estado || 1),
    });
  };

  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      try {
        await loadAll();
      } catch (e) {
        setErr(e?.message || "Error cargando contrato.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line
  }, [id]);

  const turnoOptions = useMemo(() => turnos.map((t) => ({ id: t.id, label: t.nombre })), [turnos]);

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "jornada_semanal_horas") {
      const n = Number(value);
      if (Number.isNaN(n) || n < 0) return;
      setForm((p) => ({ ...p, [name]: n }));
      return;
    }

    if (name === "salario_base") {
      const n = Number(value);
      if (Number.isNaN(n) || n < 0) return;
      setForm((p) => ({ ...p, [name]: value }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const onBlurSalary = () => {
    const n = Number(form.salario_base);
    if (Number.isNaN(n) || n < 0) return;
    setForm((p) => ({ ...p, salario_base: n.toFixed(2) }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.empleado_id) return setErr("Selecciona un empleado.");
    if (!form.fecha_inicio) return setErr("Fecha inicio es obligatoria.");

    const payload = {
      empleado_id: Number(form.empleado_id),
      turno_base_id: form.turno_base_id ? Number(form.turno_base_id) : null,
      tipo: Number(form.tipo),
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin || null,
      salario_base: Number(form.salario_base).toFixed(2),
      jornada_semanal_horas: Number(form.jornada_semanal_horas),
      estado: Number(form.estado),
    };

    try {
      const res = await apiFetch(`/api/rrhh/contratos/${id}/`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(data));
      }

      alert("Contrato actualizado.");
      navigate("/rrhh/contratos");
    } catch (e2) {
      setErr(e2?.message || "Error actualizando contrato.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Editar Contrato</h2>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <form onSubmit={onSubmit}>
            <div>
              <label>Empleado *</label>
              <select name="empleado_id" value={form.empleado_id} onChange={onChange}>
                <option value="">-- Selecciona --</option>
                {empleados.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Turno base (opcional)</label>
              <select name="turno_base_id" value={form.turno_base_id} onChange={onChange}>
                <option value="">-- Sin turno base --</option>
                {turnoOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Tipo *</label>
              <select name="tipo" value={form.tipo} onChange={onChange}>
                {TIPOS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Fecha inicio *</label>
              <input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={onChange} />
            </div>

            <div>
              <label>Fecha fin (opcional)</label>
              <input type="date" name="fecha_fin" value={form.fecha_fin} onChange={onChange} />
            </div>

            <div>
              <label>Salario base (= 0, 2 decimales) *</label>
              <input
                type="number"
                name="salario_base"
                min="0"
                step="0.01"
                value={form.salario_base}
                onChange={onChange}
                onBlur={onBlurSalary}
              />
            </div>

            <div>
              <label>Jornada semanal horas (entero = 0) *</label>
              <input
                type="number"
                name="jornada_semanal_horas"
                min="0"
                step="1"
                value={form.jornada_semanal_horas}
                onChange={onChange}
              />
            </div>

            <div>
              <label>Estado *</label>
              <select name="estado" value={form.estado} onChange={onChange}>
                {ESTADOS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 12 }}>
              <Link to="/rrhh/contratos">Cancelar</Link>{" "}
              <button type="submit">Guardar</button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
