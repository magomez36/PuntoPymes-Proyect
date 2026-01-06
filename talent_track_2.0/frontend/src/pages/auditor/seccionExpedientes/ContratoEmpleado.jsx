import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

const fmtDate = (iso) => {
  if (!iso) return "N/A";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-EC");
};

export default function ContratoEmpleado() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await apiFetch(`/api/auditor/expedientes/empleados/${id}/contrato/`);
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d?.detail || JSON.stringify(d));
      setData(d);
    } catch (e) {
      setErr(e?.message || "Error cargando contrato.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Contrato del Empleado</h2>

        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button onClick={() => navigate(`/auditor/expedientes/empleados/${id}`)}>Volver al detalle</button>
          <button onClick={() => navigate(`/auditor/expedientes/empleados/${id}/jornadas`)}>Ver jornadas</button>
        </div>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && data && (
          <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
            <p><strong>Tipo:</strong> {data.tipo_label}</p>
            <p><strong>Fecha inicio:</strong> {fmtDate(data.fecha_inicio)}</p>
            <p><strong>Fecha fin:</strong> {data.fecha_fin_label}</p>
            <p><strong>Salario base:</strong> {data.salario_base}</p>
            <p><strong>Jornada semanal (horas):</strong> {data.jornada_semanal_horas}</p>
            <p><strong>Estado:</strong> {data.estado_label}</p>
          </div>
        )}
      </main>
    </div>
  );
}
