import React from "react";
import { useNavigate } from "react-router-dom";
import { getFullName, clearSession } from "../../services/session";

export default function InicioAdminRRHH() {
  const navigate = useNavigate();
  const fullName = getFullName();

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Bienvenido{fullName ? `, ${fullName}` : ""}</h1>
      <p>Panel de RRHH: gestión de empleados, KPI y aprobaciones.</p>

      <button onClick={() => navigate("/rrhh/unidades-organizacionales")}>Unidades Organizacionales</button>
      <button onClick={() => navigate("/rrhh/puestos")}>Puestos</button>
      <button onClick={() => navigate("/rrhh/turnos")}>Turnos</button>
      <button onClick={() => navigate("/rrhh/empleados")}>Empleados</button>
      <button onClick={() => navigate("/rrhh/contratos")}>Contratos</button>
      <button onClick={() => navigate("/rrhh/tipos-ausencias")}>Tipos de Ausencias</button>
      <button onClick={() => navigate("/rrhh/kpis")}>KPIs</button>
      <button onClick={() => navigate("/rrhh/ausencias/solicitudes")}>Solicitudes Ausencias</button>
      <button onClick={() => navigate("/rrhh/jornadas-calculadas")}>Jornadas Calculadas</button>
      <button onClick={() => navigate("/rrhh/kpi/asignaciones")}>Asignaciones KPIs</button>
      <button onClick={() => navigate("/rrhh/vacaciones/saldos")}>Saldos Vacaciones</button>


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
