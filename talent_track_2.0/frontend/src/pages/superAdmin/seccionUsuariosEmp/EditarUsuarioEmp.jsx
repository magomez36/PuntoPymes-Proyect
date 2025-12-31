import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

export default function EditarUsuarioEmp() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [empresaId, setEmpresaId] = useState("");
  const [empleados, setEmpleados] = useState([]);

  const [form, setForm] = useState({
    empleado_id: "",
    email: "",
    phone: "",
    mfa_habilitado: false,
    estado: 1,

    old_password: "",
    new_password: "",
    new_password2: "",
  });

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/usuarios-empresa/${id}/`);
      const data = await res.json();

      setEmpresaId(String(data.empresa_id || ""));
      setForm({
        empleado_id: String(data.empleado_id || ""),
        email: data.email || "",
        phone: data.phone || "",
        mfa_habilitado: Boolean(data.mfa_habilitado),
        estado: Number(data.estado || 1),

        old_password: "",
        new_password: "",
        new_password2: "",
      });

      // cargar empleados de la empresa del usuario (no se cambia empresa)
      if (data.empresa_id) {
        const resEmp = await apiFetch(`/api/helpers/empleados-por-empresa/?empresa_id=${data.empresa_id}`);
        const empData = await resEmp.json();
        setEmpleados(Array.isArray(empData) ? empData : []);
      } else {
        setEmpleados([]);
      }
    } catch (e) {
      setErr(e?.message || "Error cargando usuario.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.empleado_id) return setErr("Selecciona empleado.");
    if (!form.email.trim()) return setErr("Email obligatorio.");

    const anyPw = form.old_password || form.new_password || form.new_password2;
    if (anyPw) {
      if (!form.old_password || !form.new_password || !form.new_password2) {
        return setErr("Para cambiar password: antigua, nueva y confirmación.");
      }
      if (form.new_password !== form.new_password2) {
        return setErr("La nueva contraseña no coincide.");
      }
    }

    const payload = {
      empleado_id: Number(form.empleado_id),
      email: form.email.trim(),
      phone: form.phone?.trim() || "",
      mfa_habilitado: Boolean(form.mfa_habilitado),
      estado: Number(form.estado),
      old_password: form.old_password || "",
      new_password: form.new_password || "",
      new_password2: form.new_password2 || "",
    };

    try {
      const res = await apiFetch(`/api/usuarios-empresa/${id}/`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(data));
      }

      alert("Usuario actualizado.");
      navigate("/admin/usuarios");
    } catch (e2) {
      setErr(e2?.message || "Error actualizando usuario.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Editar Usuario</h2>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <form onSubmit={onSubmit}>
            <div>
              <label>Empleado (misma empresa) *</label>
              <select name="empleado_id" value={form.empleado_id} onChange={onChange} disabled={!empresaId}>
                <option value="">-- Selecciona --</option>
                {empleados.map((em) => (
                  <option key={em.id} value={em.id}>
                    {em.email} - {em.nombres} {em.apellidos}
                  </option>
                ))}
              </select>
              {!empresaId && <small>No hay empresa asociada para este usuario.</small>}
            </div>

            <div>
              <label>Email *</label>
              <input name="email" value={form.email} onChange={onChange} />
            </div>

            <div>
              <label>Phone (opcional)</label>
              <input name="phone" value={form.phone} onChange={onChange} />
            </div>

            <div>
              <label>
                <input type="checkbox" name="mfa_habilitado" checked={form.mfa_habilitado} onChange={onChange} />
                MFA habilitado
              </label>
            </div>

            <div>
              <label>Estado *</label>
              <select name="estado" value={form.estado} onChange={onChange}>
                <option value={1}>activo</option>
                <option value={2}>bloqueado</option>
              </select>
            </div>

            <hr />

            <h4>Cambiar contraseña (opcional)</h4>

            <div>
              <label>Contraseña Antigua</label>
              <input type="password" name="old_password" value={form.old_password} onChange={onChange} />
            </div>

            <div>
              <label>Nueva Contraseña</label>
              <input type="password" name="new_password" value={form.new_password} onChange={onChange} />
            </div>

            <div>
              <label>Confirmar Nueva Contraseña</label>
              <input type="password" name="new_password2" value={form.new_password2} onChange={onChange} />
            </div>

            <div style={{ marginTop: 12 }}>
              <Link to="/admin/usuarios">Cancelar</Link>{" "}
              <button type="submit">Guardar</button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
