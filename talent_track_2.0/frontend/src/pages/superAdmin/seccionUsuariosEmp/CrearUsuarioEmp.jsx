import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

export default function CrearUsuarioEmp() {
  const navigate = useNavigate();

  const [empresas, setEmpresas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    empresa_id: "",
    empleado_id: "",
    rol_id: "",
    email: "",
    phone: "",
    password: "",
    password2: "",
    mfa_habilitado: false,
    estado: 1,
  });

  const loadEmpresas = async () => {
    const res = await apiFetch("/api/listado-empresas/");
    const data = await res.json();
    setEmpresas(Array.isArray(data) ? data : []);
  };

  const loadEmpleadosRoles = async (empresaId) => {
    setEmpleados([]);
    setRoles([]);
    setForm((p) => ({ ...p, empleado_id: "", rol_id: "" }));

    if (!empresaId) return;

    const [resEmp, resRol] = await Promise.all([
      apiFetch(`/api/helpers/empleados-por-empresa/?empresa_id=${empresaId}`),
      apiFetch(`/api/helpers/roles-por-empresa/?empresa_id=${empresaId}`),
    ]);

    const empData = await resEmp.json();
    const rolData = await resRol.json();

    setEmpleados(Array.isArray(empData) ? empData : []);
    setRoles(Array.isArray(rolData) ? rolData : []);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await loadEmpresas();
      } catch (e) {
        setErr(e?.message || "Error cargando empresas.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const v = type === "checkbox" ? checked : value;

    setForm((p) => ({ ...p, [name]: v }));

    if (name === "empresa_id") {
      await loadEmpleadosRoles(value);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.empresa_id) return setErr("Selecciona empresa.");
    if (!form.empleado_id) return setErr("Selecciona empleado.");
    if (!form.rol_id) return setErr("Selecciona rol.");
    if (!form.email.trim()) return setErr("Email obligatorio.");
    if (!form.password) return setErr("Password obligatorio.");
    if (form.password !== form.password2) return setErr("Las contraseñas no coinciden.");

    const payload = {
      empresa_id: Number(form.empresa_id),
      empleado_id: Number(form.empleado_id),
      rol_id: Number(form.rol_id),
      email: form.email.trim(),
      phone: form.phone?.trim() || "",
      password: form.password,
      password2: form.password2,
      mfa_habilitado: Boolean(form.mfa_habilitado),
      estado: Number(form.estado),
    };

    try {
      const res = await apiFetch("/api/usuarios-empresa/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(data));
      }

      alert("Usuario creado.");
      navigate("/admin/usuarios");
    } catch (e2) {
      setErr(e2?.message || "Error creando usuario.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Crear Usuario</h2>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && (
          <form onSubmit={onSubmit}>
            <div>
              <label>Empresa *</label>
              <select name="empresa_id" value={form.empresa_id} onChange={onChange}>
                <option value="">-- Selecciona --</option>
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.razon_social}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Empleado (de la empresa) *</label>
              <select name="empleado_id" value={form.empleado_id} onChange={onChange} disabled={!form.empresa_id}>
                <option value="">-- Selecciona --</option>
                {empleados.map((em) => (
                  <option key={em.id} value={em.id}>
                    {em.email} - {em.nombres} {em.apellidos}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Rol (de la empresa) *</label>
              <select name="rol_id" value={form.rol_id} onChange={onChange} disabled={!form.empresa_id}>
                <option value="">-- Selecciona --</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </select>
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
              <label>Password *</label>
              <input type="password" name="password" value={form.password} onChange={onChange} />
            </div>

            <div>
              <label>Confirmar Password *</label>
              <input type="password" name="password2" value={form.password2} onChange={onChange} />
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

            <div style={{ marginTop: 12 }}>
              <Link to="/admin/usuarios">Cancelar</Link>{" "}
              <button type="submit">Crear</button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
