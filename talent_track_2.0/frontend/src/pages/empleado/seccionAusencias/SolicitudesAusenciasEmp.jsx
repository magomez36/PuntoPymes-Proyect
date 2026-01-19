import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";

export default function SolicitudesAusenciasEmp() {
  const [rows, setRows] = useState([]);
  const nav = useNavigate();

  const load = async () => {
    const res = await apiFetch("/api/empleado/ausencias/");
    setRows(await res.json());
  };

  useEffect(() => { load(); }, []);

  const cancelar = async (id) => {
    if (!window.confirm("¿Cancelar solicitud?")) return;
    await apiFetch(`/api/empleado/ausencias/${id}/cancelar/`, { method: "PATCH" });
    load();
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Mis Solicitudes de Ausencia</h2>

        <button onClick={() => nav("/empleado/ausencias/crear")}>
          + Nueva Solicitud
        </button>

        <table border="1" cellPadding="6" style={{ width: "100%", marginTop: 10 }}>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Desde</th>
              <th>Hasta</th>
              <th>Días</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.tipo_ausencia_nombre}</td>
                <td>{r.fecha_inicio}</td>
                <td>{r.fecha_fin || r.fecha_inicio}</td>
                <td>{r.dias_habiles}</td>
                <td>{r.estado_label}</td>
                <td>
                  {r.estado === 1 && (
                    <>
                      <button onClick={() => nav(`/empleado/ausencias/editar/${r.id}`)}>
                        Editar
                      </button>{" "}
                      <button onClick={() => cancelar(r.id)}>
                        Cancelar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan="6">No tienes solicitudes</td></tr>
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
}
