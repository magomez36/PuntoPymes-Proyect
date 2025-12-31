import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

export default function EditarEmpleadoEmp() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [empresaId, setEmpresaId] = useState("");
  const [unidades, setUnidades] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [managers, setManagers] = useState([]);

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

  const loadDependencias = async (empresaId) => {
    const [resU, resP, resM] = await Promise.all([
      apiFetch(`/api/helpers/unidades-por-empresa/?empresa_id=${empresaId}`),
      apiFetch(`/api/helpers/puestos-por-empresa/?empresa_id=${empresaId}`),
      apiFetch(`/api/helpers/empleados-por-empresa/?empresa_id=${empresaId}`),
    ]);

    const uData = await resU.json();
    const pData = await resP.json();
    const mData = await resM.json();

    setUnidades(Array.isArray(uData) ? uData : []);
    setPuestos(Array.isArray(pData) ? pData : []);
    setManagers(Array.isArray(mData) ? mData : []);
  };

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/empleados-empresa/${id}/`);
      const data = await res.json();

      setEmpresaId(String(data.empresa_id || ""));
      if (data.empresa_id) await loadDependencias(data.empresa_id);

      setForm({
        unidad_id: String(data.unidad_id || ""),
        puesto_id: String(data.puesto_id || ""),
        manager_id: data.manager_id ? String(data.manager_id) : "",

        nombres: data.nombres || "",
        apellidos: data.apellidos || "",
        email: data.email || "",
        telefono: data.telefono || "",
        direccion: data.direccion || "",
        fecha_nacimiento: data.fecha_nacimiento ? String(data.fecha_nacimiento) : "",
        estado: Number(data.estado || 1),
      });
    } catch (e) {
      setErr(e?.message || "Error cargando empleado.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.unidad_id) return setErr("Selecciona unidad.");
    if (!form.puesto_id) return setErr("Selecciona puesto.");
    if (!form.nombres.trim()) return setErr("Nombres obligatorios.");
    if (!form.apellidos.trim()) return setErr("Apellidos obligatorios.");
    if (!form.email.trim()) return setErr("Email obligatorio.");
    if (!form.telefono.trim()) return setErr("Teléfono obligatorio.");
    if (!form.direccion.trim()) return setErr("Dirección obligatoria.");
    if (!form.fecha_nacimiento) return setErr("Fecha de nacimiento obligatoria.");

    const payload = {
      unidad_id: Number(form.unidad_id),
      puesto_id: Number(form.puesto_id),
      manager_id: form.manager_id ? Number(form.manager_id) : null,

      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
      direccion: form.direccion.trim(),
      fecha_nacimiento: form.fecha_nacimiento,
      estado: Number(form.estado),
    };

    try {
      const res = await apiFetch(`/api/empleados-empresa/${id}/`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(data));
      }

      alert("Empleado actualizado.");
      navigate("/admin/empleados");
    } catch (e2) {
      setErr(e2?.message || "Error actualizando empleado.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Editar Empleado</h2>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <form onSubmit={onSubmit}>
            <div>
              <label>Unidad *</label>
              <select name="unidad_id" value={form.unidad_id} onChange={onChange} disabled={!empresaId}>
                <option value="">-- Selecciona --</option>
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Puesto *</label>
              <select name="puesto_id" value={form.puesto_id} onChange={onChange} disabled={!empresaId}>
                <option value="">-- Selecciona --</option>
                {puestos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Manager (opcional)</label>
              <select name="manager_id" value={form.manager_id} onChange={onChange} disabled={!empresaId}>
                <option value="">N/A</option>
                {managers
                  .filter((m) => String(m.id) !== String(id)) // no ser su propio manager
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombres} {m.apellidos} ({m.email})
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
              <label>Dirección *</label>
              <textarea name="direccion" value={form.direccion} onChange={onChange} rows={3} />
            </div>

            <div>
              <label>Fecha nacimiento *</label>
              <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={onChange} />
            </div>

            <div>
              <label>Estado *</label>
              <select name="estado" value={form.estado} onChange={onChange}>
                <option value={1}>activo</option>
                <option value={2}>suspendido</option>
                <option value={3}>baja</option>
              </select>
            </div>

            <div style={{ marginTop: 12 }}>
              <Link to="/admin/empleados">Cancelar</Link>{" "}
              <button type="submit">Guardar</button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
