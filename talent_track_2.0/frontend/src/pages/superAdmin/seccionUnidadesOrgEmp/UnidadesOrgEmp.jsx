import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../../services/api";


const API_BASE = "http://127.0.0.1:8000";

function getAccessToken() {
  const ls = localStorage.getItem("tt_access");
  const ss = sessionStorage.getItem("tt_access");
  return ls || ss || null;
}

export default function UnidadesOrgEmp() {
  const navigate = useNavigate();
  const token = useMemo(() => getAccessToken(), []);

  const [empresas, setEmpresas] = useState([]);
  const [empresaId, setEmpresaId] = useState("");
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);

  const authHeaders = token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };

  const fetchEmpresas = async () => {
    const res = await apiFetch(`${API_BASE}/api/listado-empresas/`, { headers: authHeaders });
    if (!res.ok) throw new Error("No se pudieron cargar empresas");
    return res.json();
  };

  const fetchUnidades = async (empresaIdParam) => {
    const url = empresaIdParam
      ? `${API_BASE}/api/unidades-organizacionales/?empresa_id=${empresaIdParam}`
      : `${API_BASE}/api/unidades-organizacionales/`;

    const res = await apiFetch(url, { headers: authHeaders });
    if (!res.ok) throw new Error("No se pudieron cargar unidades");
    return res.json();
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const emps = await fetchEmpresas();
        setEmpresas(emps);

        // por defecto: si hay empresas, selecciona la primera para filtrar
        const firstId = emps?.[0]?.id ? String(emps[0].id) : "";
        setEmpresaId(firstId);

        const uos = await fetchUnidades(firstId);
        setUnidades(uos);
      } catch (e) {
        alert(e.message || "Error cargando datos");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line
  }, []);

  const onChangeEmpresa = async (e) => {
    const id = e.target.value;
    setEmpresaId(id);
    try {
      setLoading(true);
      const uos = await fetchUnidades(id);
      setUnidades(uos);
    } catch (e2) {
      alert(e2.message || "Error cargando unidades");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta unidad organizacional?")) return;

    const res = await apiFetch(`${API_BASE}/api/unidades-organizacionales/${id}/`, {
      method: "DELETE",
      headers: authHeaders,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err?.detail || "No se pudo eliminar");
      return;
    }

    // refrescar
    const uos = await fetchUnidades(empresaId);
    setUnidades(uos);
  };

  const onToggleEstado = async (id) => {
    const res = await apiFetch(`${API_BASE}/api/unidades-organizacionales/${id}/toggle-estado/`, {
      method: "PATCH",
      headers: authHeaders,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err?.detail || "No se pudo cambiar estado");
      return;
    }

    const uos = await fetchUnidades(empresaId);
    setUnidades(uos);
  };

  if (!token) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Unidades Organizacionales</h2>
        <p>No hay sesión. Ve a login.</p>
        <button onClick={() => navigate("/login")}>Ir a Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Unidades Organizacionales</h2>

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => navigate("/admin/unidades-organizacionales/crear")}>
          + Crear Unidad
        </button>
        {" "}
        <button onClick={() => navigate("/superadmin/inicio")}>
          Volver a Inicio
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Empresa: </label>
        <select value={empresaId} onChange={onChangeEmpresa}>
          {empresas.map((e) => (
            <option key={e.id} value={String(e.id)}>
              {e.razon_social}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Unidad Organizacional</th>
              <th>Unidad Organizacional Padre</th>
              <th>Nombre Empresa</th>
              <th>Tipo</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {unidades.length === 0 ? (
              <tr>
                <td colSpan="7">No hay unidades registradas.</td>
              </tr>
            ) : (
              unidades.map((u) => (
                <tr key={u.id}>
                  <td>{u.nombre ? u.nombre : "N/A"}</td>
                  <td>{u.unidad_padre_nombre || "N/A"}</td>
                  <td>{u.empresa_nombre || ""}</td>
                  <td>{u.tipo_nombre || ""}</td>
                  <td>{u.ubicacion || ""}</td>
                  <td>{u.estado_nombre || ""}</td>
                  <td>
                    <button onClick={() => navigate(`/admin/unidades-organizacionales/editar/${u.id}`)}>
                      Editar
                    </button>{" "}
                    <button onClick={() => onDelete(u.id)}>
                      Eliminar
                    </button>{" "}
                    <button onClick={() => onToggleEstado(u.id)}>
                      Cambiar estado
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
