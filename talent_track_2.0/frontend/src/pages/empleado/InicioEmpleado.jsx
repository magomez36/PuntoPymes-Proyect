import React from "react";
import { useNavigate } from "react-router-dom";
import { getFullName, clearSession } from "../../services/session";

export default function InicioEmpleado() {
  const navigate = useNavigate();
  const fullName = getFullName();

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Bienvenido{fullName ? `, ${fullName}` : ""}</h1>
      <p>Panel de Empleado: solicitudes, historial y novedades.</p>


      <button onClick={() => navigate("/empleado/asistencia")}>Mi asistencia de hoy</button>

      <button onClick={() => navigate("/empleado/jornadas")}>Historial de Jornadas</button>

      <button onClick={() => navigate("/empleado/ausencias")}>Mis Solicitudes de Ausencia</button>

      <button onClick={() => navigate("/empleado/notificaciones")}>Notificaciones</button>

      <button onClick={() => navigate("/empleado/mi-perfil")}>Mi Perfil / Cuenta</button>

      <button onClick={() => navigate("/empleado/soporte")}>Ayuda y soporte</button>

      <button onClick={() => navigate("/empleado/desempeno-kpis")}>KPIs y Desempeño</button>


      <button
        onClick={logout}
        style={{
          marginTop: "12px",
          padding: "10px 14px",
          borderRadius: "10px",
          border: "1px solid #ddd",
          cursor: "pointer",
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
