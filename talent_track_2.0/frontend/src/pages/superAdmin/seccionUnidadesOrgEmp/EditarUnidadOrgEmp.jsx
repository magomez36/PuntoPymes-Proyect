import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../../services/api";

const API_BASE = "http://127.0.0.1:8000";

function getAccessToken() {
  return localStorage.getItem("tt_access") || sessionStorage.getItem("tt_access") || null;
}

export default function EditarUnidadOrgEmp() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useMemo(() => getAccessToken(), []);
  const authHeaders = token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };

  const [loading, setLoading] = useState(true);
  const [unidadesEmpresa, setUnidadesEmpresa] = useState([]);

  const [form, setForm] = useState({
    empresa: "",
    unidad_padre: "",
    nombre: "",
    tipo: "1",
    ubicacion: "",
    estado: "1",
  });

  const fetchDetail = async () => {
    const res = await apiFetch(`${API_BASE}/api/unidades-organizacionales/${id}/`, {
      headers: authHeaders,
    });
    if (!res.ok) throw new Error("No se pudo cargar la unidad");
    return res.json();
  };

  const fetchUnidadesEmpresa = async (empresaId) => {
    const res = await apiFetch(`${API_BASE}/api/unidades-organizacionales/?empresa_id=${empresaId}`, {
      headers: authHeaders,
    });
    if (!res.ok) throw new Error("No se pudieron cargar unidades de la empresa");
    return res.json();
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchDetail();

        // cargar unidades de esa empresa para el select de padre
        const uos = await fetchUnidadesEmpresa(data.empresa);
        // excluir la misma unidad del listado de opciones
        const filtered = uos.filter((u) => String(u.id) !== String(id));
        setUnidadesEmpresa(filtered);

        setForm({
          empresa: String(data.empresa || ""),
          unidad_padre: data.unidad_padre ? String(data.unidad_padre) : "",
          nombre: data.nombre || "",
          tipo: String(data.tipo || "1"),
          ubicacion: data.ubicacion || "",
          estado: String(data.estado || "1"),
        });
      } catch (e) {
        alert(e.message || "Error");
        navigate("/admin/unidades-organizacionales");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // SOLO campos permitidos por tu HU03
    const payload = {
      unidad_padre: form.unidad_padre ? parseInt(form.unidad_padre, 10) : null,
      nombre: form.nombre,
      tipo: parseInt(form.tipo, 10),
      ubicacion: form.ubicacion,
      estado: parseInt(form.estado, 10),
    };

    const res = await apiFetch(`${API_BASE}/api/unidades-organizacionales/${id}/`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(JSON.stringify(err));
      return;
    }

    alert("Unidad actualizada");
    navigate("/admin/unidades-organizacionales");
  };

  if (!token) {
    return (
      <div style={{ padding: 20 }}>
        <p>No hay sesión. Ve a login.</p>
        <button onClick={() => navigate("/login")}>Ir a Login</button>
      </div>
    );
  }

  if (loading) return <div style={{ padding: 20 }}>Cargando...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Editar Unidad Organizacional</h2>

      <p><b>Empresa ID:</b> {form.empresa} (no editable)</p>

      <form onSubmit={onSubmit}>
        <div>
          <label>Unidad Padre (opcional):</label><br />
          <select name="unidad_padre" value={form.unidad_padre} onChange={onChange}>
            <option value="">(Sin unidad padre)</option>
            {unidadesEmpresa.map((u) => (
              <option key={u.id} value={String(u.id)}>
                {u.nombre || "N/A"}
              </option>
            ))}
          </select>
        </div>

        <br />

        <div>
          <label>Nombre:</label><br />
          <input name="nombre" value={form.nombre} onChange={onChange} required />
        </div>

        <br />

        <div>
          <label>Tipo:</label><br />
          <select name="tipo" value={form.tipo} onChange={onChange} required>
            <option value="1">sede</option>
            <option value="2">area</option>
            <option value="3">depto</option>
          </select>
        </div>

        <br />

        <div>
          <label>Ubicación:</label><br />
          <input name="ubicacion" value={form.ubicacion} onChange={onChange} required />
        </div>

        <br />

        <div>
          <label>Estado:</label><br />
          <select name="estado" value={form.estado} onChange={onChange}>
            <option value="1">activa</option>
            <option value="2">inactiva</option>
          </select>
        </div>

        <br />

        <button type="submit">Guardar</button>{" "}
        <button type="button" onClick={() => navigate("/admin/unidades-organizacionales")}>
          Cancelar
        </button>
      </form>
    </div>
  );
}
