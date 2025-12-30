import React, { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { apiFetch } from "../../../services/api";

const API_BASE = "http://127.0.0.1:8000";

// AJUSTA si tu endpoint de unidades es otro:
const UNIDADES_URL = (empresaId) =>
  `${API_BASE}/api/unidades-organizacionales/?empresa_id=${empresaId}`;

export default function EditarPuestoEmp() {
  const { id } = useParams();
  const navigate = useNavigate();

  const access =
    localStorage.getItem("tt_access") || sessionStorage.getItem("tt_access");

  const [loading, setLoading] = useState(true);
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

  const loadUnidades = async (empresaId) => {
    if (!empresaId) return;
    const res = await apiFetch(UNIDADES_URL(empresaId), {
      headers: { Authorization: `Bearer ${access}` },
    });
    const data = await res.json();
    setUnidades(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    const init = async () => {
      try {
        // empresas (por si quieres mostrar nombre, aunque en edición no cambiamos empresa)
        const eRes = await fetch(`${API_BASE}/api/listado-empresas/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        const eData = await eRes.json();
        setEmpresas(Array.isArray(eData) ? eData : []);

        // puesto detalle
        const res = await apiFetch(`${API_BASE}/api/puestos/${id}/`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        if (!res.ok) throw new Error("No se pudo cargar el puesto.");

        const data = await res.json();

        // cargar unidades de esa empresa
        await loadUnidades(data.empresa);

        setForm({
          empresa: String(data.empresa || ""),
          unidad: String(data.unidad || ""),
          nombre: data.nombre || "",
          descripcion: data.descripcion || "",
          nivel: data.nivel ?? "",
          salario_referencial:
            data.salario_referencial === null || data.salario_referencial === undefined
              ? ""
              : String(data.salario_referencial),
        });

        setLoading(false);
      } catch (e) {
        alert(e.message || "Error");
        navigate("/admin/puestos");
      }
    };

    init();
    // eslint-disable-next-line
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();

    const payload = {
      unidad: parseInt(form.unidad, 10),
      nombre: form.nombre,
      descripcion: form.descripcion,
      nivel: form.nivel,
      salario_referencial:
        form.salario_referencial === ""
          ? null
          : parseFloat(form.salario_referencial),
    };

    const res = await apiFetch(`${API_BASE}/api/actualizar-puesto/${id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Puesto actualizado.");
      navigate("/admin/puestos");
    } else {
      const err = await res.json().catch(() => ({}));
      console.error(err);
      alert("Error al actualizar. Revisa consola.");
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Cargando...</div>;

  const empresaNombre =
    empresas.find((e) => String(e.id) === String(form.empresa))?.razon_social ||
    form.empresa;

  return (
    <div style={{ padding: 20 }}>
      <h2>Editar Puesto</h2>

      <div style={{ marginBottom: 12 }}>
        <Link to="/admin/puestos">← Volver</Link>
      </div>

      <div style={{ marginBottom: 12 }}>
        <b>Empresa:</b> {empresaNombre}
      </div>

      <form onSubmit={submit}>
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
          <input name="nombre" value={form.nombre} onChange={onChange} required />
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
          />
        </div>

        <button type="submit">Guardar</button>
      </form>
    </div>
  );
}
