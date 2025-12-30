import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../services/api";

const API_BASE = "http://127.0.0.1:8000";

function getAccessToken() {
  return localStorage.getItem("tt_access") || sessionStorage.getItem("tt_access") || null;
}

export default function CrearUnidadOrgEmp() {
  const navigate = useNavigate();
  const token = useMemo(() => getAccessToken(), []);
  const authHeaders = token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };

  const [empresas, setEmpresas] = useState([]);
  const [unidadesEmpresa, setUnidadesEmpresa] = useState([]);

  const [form, setForm] = useState({
    empresa: "",
    unidad_padre: "",
    nombre: "",
    tipo: "1",
    ubicacion: "",
  });

  const fetchEmpresas = async () => {
    const res = await apiFetch(`${API_BASE}/api/listado-empresas/`, { headers: authHeaders });
    if (!res.ok) throw new Error("No se pudieron cargar empresas");
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
        const emps = await fetchEmpresas();
        setEmpresas(emps);

        const firstId = emps?.[0]?.id ? String(emps[0].id) : "";
        setForm((p) => ({ ...p, empresa: firstId }));

        if (firstId) {
          const uos = await fetchUnidadesEmpresa(firstId);
          setUnidadesEmpresa(uos);
        }
      } catch (e) {
        alert(e.message || "Error cargando datos");
      }
    })();
    // eslint-disable-next-line
  }, []);

  const onChange = async (e) => {
    const { name, value } = e.target;

    // si cambia empresa: refrescar unidades y reset padre
    if (name === "empresa") {
      setForm((p) => ({ ...p, empresa: value, unidad_padre: "" }));
      if (value) {
        const uos = await fetchUnidadesEmpresa(value);
        setUnidadesEmpresa(uos);
      } else {
        setUnidadesEmpresa([]);
      }
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      empresa: parseInt(form.empresa, 10),
      unidad_padre: form.unidad_padre ? parseInt(form.unidad_padre, 10) : null,
      nombre: form.nombre,
      tipo: parseInt(form.tipo, 10),
      ubicacion: form.ubicacion,
    };

    const res = await apiFetch(`${API_BASE}/api/unidades-organizacionales/`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(JSON.stringify(err));
      return;
    }

    alert("Unidad creada");
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

  return (
    <div style={{ padding: 20 }}>
      <h2>Crear Unidad Organizacional</h2>

      <form onSubmit={onSubmit}>
        <div>
          <label>Empresa:</label><br />
          <select name="empresa" value={form.empresa} onChange={onChange} required>
            {empresas.map((e) => (
              <option key={e.id} value={String(e.id)}>
                {e.razon_social}
              </option>
            ))}
          </select>
        </div>

        <br />

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

        <button type="submit">Crear</button>{" "}
        <button type="button" onClick={() => navigate("/admin/unidades-organizacionales")}>
          Cancelar
        </button>
      </form>
    </div>
  );
}
