import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const ROLES = [
  { id: 1, label: "superadmin" },
  { id: 2, label: "rrhh" },
  { id: 3, label: "manager" },
  { id: 4, label: "empleado" },
  { id: 5, label: "auditor" },
];

export default function CrearRolEmp() {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    empresa: "",
    nombre: 2, // rrhh por defecto
    descripcion: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/listado-empresas/");
        const data = await res.json();
        if (!res.ok) throw new Error(JSON.stringify(data));
        setEmpresas(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr("No se pudieron cargar empresas.");
      }
    })();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.empresa) return setErr("Selecciona empresa.");

    const payload = {
      empresa: Number(form.empresa),       // solo en crear
      nombre: String(form.nombre),         // OJO: lo mando como string "1".."5"
      descripcion: form.descripcion || "",
    };


    try {
      const res = await apiFetch("/api/roles-empresa/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(JSON.stringify(data));

      alert("Rol creado.");
      navigate("/admin/roles");
    } catch (e2) {
      setErr(e2?.message || "Error creando.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Crear Rol</h2>
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        <form onSubmit={onSubmit}>
          <div>
            <label>Empresa *</label>
            <select name="empresa" value={form.empresa} onChange={onChange} required>
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
            <select name="nombre" value={form.nombre} onChange={onChange}>
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={onChange} rows={3} />
          </div>

          <div style={{ marginTop: 12 }}>
            <Link to="/admin/roles">Cancelar</Link>{" "}
            <button type="submit">Crear</button>
          </div>
        </form>
      </main>
    </div>
  );
}
