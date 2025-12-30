import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

// AJUSTA si tu endpoint de unidades es otro:
const UNIDADES_URL = (empresaId) =>
  `${API_BASE}/api/unidades-organizacionales/?empresa_id=${empresaId}`;

export default function CrearPuestoEmp() {
  const navigate = useNavigate();

  const access =
    localStorage.getItem("tt_access") || sessionStorage.getItem("tt_access");

  const [empresas, setEmpresas] = useState([]);
  const [unidades, setUnidades] = useState([]);

  const [form, setForm] = useState({
    empresa: "",
    unidad: "",
    nombre: "",
    descripcion: "",
    nivel: "",
    salario_referencial: "",
  });

  useEffect(() => {
    const loadEmpresas = async () => {
      const res = await fetch(`${API_BASE}/api/listado-empresas/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      const data = await res.json();
      setEmpresas(Array.isArray(data) ? data : []);
    };
    loadEmpresas();
    // eslint-disable-next-line
  }, []);

  const loadUnidades = async (empresaId) => {
    setUnidades([]);
    setForm((p) => ({ ...p, unidad: "" }));
    if (!empresaId) return;

    const res = await fetch(UNIDADES_URL(empresaId), {
      headers: { Authorization: `Bearer ${access}` },
    });
    const data = await res.json();
    setUnidades(Array.isArray(data) ? data : []);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));

    if (name === "empresa") {
      loadUnidades(value);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    const payload = {
      empresa: parseInt(form.empresa, 10),
      unidad: parseInt(form.unidad, 10),
      nombre: form.nombre,
      descripcion: form.descripcion,
      nivel: form.nivel,
      salario_referencial:
        form.salario_referencial === ""
          ? null
          : parseFloat(form.salario_referencial),
    };

    const res = await fetch(`${API_BASE}/api/crear-puesto/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Puesto creado correctamente.");
      navigate("/admin/puestos");
    } else {
      const err = await res.json().catch(() => ({}));
      console.error(err);
      alert("Error al crear puesto. Revisa consola.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Crear Puesto</h2>

      <div style={{ marginBottom: 12 }}>
        <Link to="/admin/puestos">← Volver</Link>
      </div>

      <form onSubmit={submit}>
        <div style={{ marginBottom: 10 }}>
          <label>Empresa *</label>
          <br />
          <select name="empresa" value={form.empresa} onChange={onChange} required>
            <option value="">-- Selecciona --</option>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.razon_social}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Unidad *</label>
          <br />
          <select name="unidad" value={form.unidad} onChange={onChange} required>
            <option value="">-- Selecciona --</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre || "N/A"}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Nombre *</label>
          <br />
          <input
            name="nombre"
            value={form.nombre}
            onChange={onChange}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Descripción</label>
          <br />
          <input name="descripcion" value={form.descripcion} onChange={onChange} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Nivel</label>
          <br />
          <input name="nivel" value={form.nivel} onChange={onChange} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Salario referencial</label>
          <br />
          <input
            type="number"
            step="0.01"
            min="0"
            name="salario_referencial"
            value={form.salario_referencial}
            onChange={onChange}
            placeholder="Ej: 1200.00"
          />
        </div>

        <button type="submit">Crear</button>
      </form>
    </div>
  );
}
