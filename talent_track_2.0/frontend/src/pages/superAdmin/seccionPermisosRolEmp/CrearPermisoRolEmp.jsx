import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

export default function CrearPermisoRolEmp() {
  const navigate = useNavigate();

  const [empresas, setEmpresas] = useState([]);
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    empresa_id: "",
    rol_id: "",
    codigo: "",
    descripcion: "",
  });

  const loadEmpresas = async () => {
    const res = await apiFetch("/api/listado-empresas/");
    const data = await res.json();
    setEmpresas(Array.isArray(data) ? data : []);
  };

  const loadRoles = async (empresaId) => {
    setRoles([]);
    setForm((p) => ({ ...p, rol_id: "" }));
    if (!empresaId) return;

    const res = await apiFetch(`/api/helpers/roles-por-empresa/?empresa_id=${empresaId}`);
    const data = await res.json();
    setRoles(Array.isArray(data) ? data : []);
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
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));

    if (name === "empresa_id") {
      await loadRoles(value);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.empresa_id) return setErr("Selecciona empresa.");
    if (!form.rol_id) return setErr("Selecciona rol.");
    if (!form.codigo.trim()) return setErr("Código es obligatorio.");

    const payload = {
      empresa_id: Number(form.empresa_id),
      rol_id: Number(form.rol_id),
      codigo: form.codigo.trim(),
      descripcion: form.descripcion.trim(),
    };

    try {
      const res = await apiFetch("/api/permisos/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(data));
      }

      alert("Permiso creado.");
      navigate("/admin/permisos");
    } catch (e2) {
      setErr(e2?.message || "Error creando permiso.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Crear Permiso</h2>

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
              <label>Rol *</label>
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
              <label>Código *</label>
              <input name="codigo" value={form.codigo} onChange={onChange} />
            </div>

            <div>
              <label>Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={onChange} rows={3} />
            </div>

            <div style={{ marginTop: 12 }}>
              <Link to="/admin/permisos">Cancelar</Link>{" "}
              <button type="submit">Crear</button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
