import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const ROLES = [
  { id: 1, label: "superadmin" },
  { id: 2, label: "rrhh" },
  { id: 3, label: "manager" },
  { id: 4, label: "empleado" },
  { id: 5, label: "auditor" },
];

export default function EditarRolEmp() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    nombre: 2,
    descripcion: "",
  });

  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const res = await apiFetch(`/api/roles-empresa/${id}/`);
        const data = await res.json();
        if (!res.ok) throw new Error(JSON.stringify(data));

        // backend devuelve nombre_id + nombre_texto
        setForm({
          nombre: Number(data.nombre_id || 2),
          descripcion: data.descripcion || "",
        });
      } catch (e) {
        setErr(e?.message || "Error cargando rol.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

  const payload = {
    nombre: String(form.nombre),  // "1".."5"
    descripcion: form.descripcion || "",
  };


    try {
      const res = await apiFetch(`/api/roles-empresa/${id}/`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(JSON.stringify(data));

      alert("Rol actualizado.");
      navigate("/admin/roles");
    } catch (e2) {
      setErr(e2?.message || "Error actualizando.");
    }
  };

  if (loading) {
    return (
      <div className="layout">
        <Sidebar />
        <main className="main-content"><p>Cargando...</p></main>
      </div>
    );
  }

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Editar Rol</h2>
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        <form onSubmit={onSubmit}>
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
            <button type="submit">Guardar</button>
          </div>
        </form>
      </main>
    </div>
  );
}
