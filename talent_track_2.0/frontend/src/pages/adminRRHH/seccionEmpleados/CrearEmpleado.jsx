import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const ESTADOS = [
  { id: 1, label: "activo" },
  { id: 2, label: "suspendido" },
  { id: 3, label: "baja" },
];

export default function CrearEmpleado() {
  const navigate = useNavigate();

  const [unidades, setUnidades] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [managers, setManagers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    unidad_id: "",
    puesto_id: "",
    manager_id: "",
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    direccion: "",
    fecha_nacimiento: "",
    estado: 1,
  });

  const loadData = async () => {
    const [uRes, pRes, mRes] = await Promise.all([
      apiFetch("/api/rrhh/unidades-organizacionales/"),
      apiFetch("/api/rrhh/puestos/"),
      apiFetch("/api/rrhh/helpers/empleados-min/"),
    ]);

    const uData = await uRes.json();
    const pData = await pRes.json();
    const mData = await mRes.json();

    setUnidades(Array.isArray(uData) ? uData : []);
    setPuestos(Array.isArray(pData) ? pData : []);
    setManagers(Array.isArray(mData) ? mData : []);
  };

  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      try {
        await loadData();
      } catch (e) {
        setErr(e?.message || "Error cargando data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const unidadOptions = useMemo(
    () => unidades.map((u) => ({ id: u.id, label: `${u.nombre || "N/A"} (${u.tipo_label || "N/A"})` })),
    [unidades]
  );

  const puestoOptions = useMemo(
    () => puestos.map((p) => ({ id: p.id, label: `${p.nombre} — ${p.unidad_nombre || "N/A"}` })),
    [puestos]
  );

  const managerOptions = useMemo(() => managers, [managers]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.unidad_id) return setErr("Selecciona una unidad.");
    if (!form.puesto_id) return setErr("Selecciona un puesto.");
    if (!form.nombres.trim()) return setErr("Nombres es obligatorio.");
    if (!form.apellidos.trim()) return setErr("Apellidos es obligatorio.");
    if (!form.email.trim()) return setErr("Email es obligatorio.");
    if (!form.telefono.trim()) return setErr("Teléfono es obligatorio.");
    if (!form.fecha_nacimiento) return setErr("Fecha de nacimiento es obligatoria.");

    const payload = {
      unidad_id: Number(form.unidad_id),
      puesto_id: Number(form.puesto_id),
      manager_id: form.manager_id ? Number(form.manager_id) : null,
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
      direccion: form.direccion.trim(),
      fecha_nacimiento: form.fecha_nacimiento, // YYYY-MM-DD
      estado: Number(form.estado),
    };

    try {
      const res = await apiFetch("/api/rrhh/empleados/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(data));
      }

      alert("Empleado creado.");
      navigate("/rrhh/empleados");
    } catch (e2) {
      setErr(e2?.message || "Error creando empleado.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Crear Empleado</h2>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <form onSubmit={onSubmit}>
            <div>
              <label>Unidad Organizacional *</label>
              <select name="unidad_id" value={form.unidad_id} onChange={onChange}>
                <option value="">-- Selecciona --</option>
                {unidadOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Puesto *</label>
              <select name="puesto_id" value={form.puesto_id} onChange={onChange}>
                <option value="">-- Selecciona --</option>
                {puestoOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Manager (opcional)</label>
              <select name="manager_id" value={form.manager_id} onChange={onChange}>
                <option value="">-- Sin manager --</option>
                {managerOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Nombres *</label>
              <input name="nombres" value={form.nombres} onChange={onChange} />
            </div>

            <div>
              <label>Apellidos *</label>
              <input name="apellidos" value={form.apellidos} onChange={onChange} />
            </div>

            <div>
              <label>Email *</label>
              <input name="email" value={form.email} onChange={onChange} />
            </div>

            <div>
              <label>Teléfono *</label>
              <input name="telefono" value={form.telefono} onChange={onChange} />
            </div>

            <div>
              <label>Dirección</label>
              <textarea name="direccion" value={form.direccion} onChange={onChange} rows={3} />
            </div>

            <div>
              <label>Fecha nacimiento *</label>
              <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={onChange} />
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
              <Link to="/rrhh/empleados">Cancelar</Link>{" "}
              <button type="submit">Crear</button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
