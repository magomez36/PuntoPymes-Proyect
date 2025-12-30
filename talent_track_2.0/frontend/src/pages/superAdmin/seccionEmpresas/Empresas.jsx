import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../../services/authStorage";

const API_BASE = "http://127.0.0.1:8000/api";

export default function Empresas() {
  const navigate = useNavigate();

  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return empresas;

    return empresas.filter((e) => {
      const r = (e.razon_social || "").toLowerCase();
      const n = (e.nombre_comercial || "").toLowerCase();
      const ru = (e.ruc_nit || "").toLowerCase();
      return r.includes(s) || n.includes(s) || ru.includes(s);
    });
  }, [empresas, search]);

  const fetchEmpresas = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE}/listado-empresas/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("No se pudieron cargar las empresas.");
      }

      const data = await res.json();
      setEmpresas(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMsg(err?.message || "Error cargando empresas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const eliminarEmpresa = async (id) => {
    const ok = window.confirm("¿Seguro que deseas eliminar esta empresa?");
    if (!ok) return;

    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE}/empresas/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("No se pudo eliminar la empresa.");
      }

      // refrescar
      await fetchEmpresas();
    } catch (err) {
      alert(err?.message || "Error eliminando empresa.");
    }
  };

  const toggleEstado = async (id) => {
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_BASE}/empresas/${id}/toggle-estado/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("No se pudo cambiar el estado.");

      // refrescar
      await fetchEmpresas();
    } catch (err) {
      alert(err?.message || "Error cambiando estado.");
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Cargando...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Empresas</h2>

      {errorMsg && (
        <div style={{ marginBottom: 12, padding: 10, border: "1px solid #ddd" }}>
          {errorMsg}
        </div>
      )}

      <div style={{ marginBottom: 12, display: "flex", gap: 10 }}>
        <button onClick={() => navigate("/admin/empresas/crear")}>
          Crear empresa
        </button>

        <button onClick={fetchEmpresas}>Refrescar</button>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por razón social, nombre, RUC..."
          style={{ flex: 1, padding: 8 }}
        />
      </div>

      <table border="1" cellPadding="8" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Razón social</th>
            <th>Nombre comercial</th>
            <th>RUC/NIT</th>
            <th>País</th>
            <th>Moneda</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
                No hay empresas.
              </td>
            </tr>
          ) : (
            filtered.map((e) => (
              <tr key={e.id}>
                <td>{e.id}</td>
                <td>{e.razon_social}</td>
                <td>{e.nombre_comercial}</td>
                <td>{e.ruc_nit}</td>
                <td>{e.pais_nombre ?? e.pais}</td>
                <td>{e.moneda_nombre ?? e.moneda}</td>
                <td>{e.estado_nombre ?? e.estado}</td>
                <td style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => navigate(`/admin/empresas/editar/${e.id}`)}>
                    Editar
                  </button>

                  <button onClick={() => eliminarEmpresa(e.id)}>
                    Eliminar
                  </button>

                  <button onClick={() => toggleEstado(e.id)}>
                    Cambiar estado
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
