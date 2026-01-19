import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// CSS / Layout
import "./assets/css/global.css";
import "./assets/css/header.css";
import "./assets/css/sidebar.css";
import "./assets/css/auth.css";
import "./assets/css/home.css";
import "./assets/css/dashboard.css";
import "./assets/css/admin-ui.css";
import "boxicons/css/boxicons.min.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Páginas públicas
import Home from "./pages/public/Home";
import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword";

// Páginas por rol (Inicio)
import InicioSuperAdmin from "./pages/superAdmin/InicioSuperAdmin";
import InicioAdminRRHH from "./pages/adminRRHH/InicioAdminRRHH";
import InicioManager from "./pages/manager/InicioManager";
import InicioEmpleado from "./pages/empleado/InicioEmpleado";
import InicioAuditor from "./pages/auditor/InicioAuditor";

// Superadmin - (Estructura actual)
import Empresas from "./pages/superAdmin/seccionEmpresas/Empresas";
import CrearEmpresa from "./pages/superAdmin/seccionEmpresas/CrearEmpresa";
import EditarEmpresa from "./pages/superAdmin/seccionEmpresas/EditarEmpresa";

import UnidadesOrgEmp from "./pages/superAdmin/seccionUnidadesOrgEmp/UnidadesOrgEmp";
import CrearUnidadOrgEmp from "./pages/superAdmin/seccionUnidadesOrgEmp/CrearUnidadOrgEmp";
import EditarUnidadOrgEmp from "./pages/superAdmin/seccionUnidadesOrgEmp/EditarUnidadOrgEmp";

import PuestosEmp from "./pages/superAdmin/seccionPuestosEmp/PuestosEmp";
import CrearPuestoEmp from "./pages/superAdmin/seccionPuestosEmp/CrearPuestoEmp";
import EditarPuestoEmp from "./pages/superAdmin/seccionPuestosEmp/EditarPuestoEmp";

import TurnosEmp from "./pages/superAdmin/seccionTurnosEmp/TurnosEmp";
import CrearTurnoEmp from "./pages/superAdmin/seccionTurnosEmp/CrearTurnoEmp";
import EditarTurnoEmp from "./pages/superAdmin/seccionTurnosEmp/EditarTurnoEmp";

import ReglasAsistenciaEmp from "./pages/superAdmin/seccionReglasAsistenciaEmp/ReglasAsistenciaEmp";
import CrearReglaAsistenciaEmp from "./pages/superAdmin/seccionReglasAsistenciaEmp/CrearReglaAsistenciaEmp";
import EditarReglaAsistenciaEmp from "./pages/superAdmin/seccionReglasAsistenciaEmp/EditarReglaAsistenciaEmp";

import TiposAusenciasEmp from "./pages/superAdmin/seccionTiposAusenciasEmp/TiposAusenciasEmp";
import CrearTipoAusenciaEmp from "./pages/superAdmin/seccionTiposAusenciasEmp/CrearTipoAusenciaEmp";
import EditarTipoAusenciaEmp from "./pages/superAdmin/seccionTiposAusenciasEmp/EditarTipoAusenciaEmp";

import KPIsEmp from "./pages/superAdmin/seccionKPIsEmp/KPIsEmp";
import CrearKPI_Emp from "./pages/superAdmin/seccionKPIsEmp/CrearKPI_Emp";
import EditarKPI_Emp from "./pages/superAdmin/seccionKPIsEmp/EditarKPI_Emp";

import ReportesProgramados from "./pages/superAdmin/seccionReportesProgramados/ReportesProgramados";
import CrearReporteProgramado from "./pages/superAdmin/seccionReportesProgramados/CrearReporteProgramado";
import EditarReporteProgramado from "./pages/superAdmin/seccionReportesProgramados/EditarReporteProgramado";

import RolesEmp from "./pages/superAdmin/seccionRolEmp/RolesEmp";
import CrearRolEmp from "./pages/superAdmin/seccionRolEmp/CrearRolEmp";
import EditarRolEmp from "./pages/superAdmin/seccionRolEmp/EditarRolEmp";

import UsuariosEmp from "./pages/superAdmin/seccionUsuariosEmp/UsuariosEmp";
import CrearUsuarioEmp from "./pages/superAdmin/seccionUsuariosEmp/CrearUsuarioEmp";
import EditarUsuarioEmp from "./pages/superAdmin/seccionUsuariosEmp/EditarUsuarioEmp";

import EmpleadosEmp from "./pages/superAdmin/seccionEmpleadosEmp/EmpleadosEmp";
import CrearEmpleadoEmp from "./pages/superAdmin/seccionEmpleadosEmp/CrearEmpleadoEmp";
import EditarEmpleadoEmp from "./pages/superAdmin/seccionEmpleadosEmp/EditarEmpleadoEmp";

import PermisosRolEmp from "./pages/superAdmin/seccionPermisosRolEmp/PermisosRolEmp";
import CrearPermisoRolEmp from "./pages/superAdmin/seccionPermisosRolEmp/CrearPermisoRolEmp";
import EditarPermisoRolEmp from "./pages/superAdmin/seccionPermisosRolEmp/EditarPermisoRolEmp";

import PlantillasKPIsEmp from "./pages/superAdmin/seccionPlantillasKPIsEmp/PlantillasKPIsEmp";
import CrearPlantillaKPI_Emp from "./pages/superAdmin/seccionPlantillasKPIsEmp/CrearPlantillaKPI_Emp";
import EditarPlantillaKPI_Emp from "./pages/superAdmin/seccionPlantillasKPIsEmp/EditarPlantillaKPI_Emp";

import UnidadesOrg from "./pages/adminRRHH/seccionUnidadesOrg/UnidadesOrg";
import CrearUnidadOrg from "./pages/adminRRHH/seccionUnidadesOrg/CrearUnidadOrg";
import EditarUnidadOrg from "./pages/adminRRHH/seccionUnidadesOrg/EditarUnidadOrg";

import Puestos from "./pages/adminRRHH/seccionPuestos/Puestos";
import CrearPuesto from "./pages/adminRRHH/seccionPuestos/CrearPuesto";
import EditarPuesto from "./pages/adminRRHH/seccionPuestos/EditarPuesto";

import Turnos from "./pages/adminRRHH/seccionTurnos/Turnos";
import CrearTurno from "./pages/adminRRHH/seccionTurnos/CrearTurno";
import EditarTurno from "./pages/adminRRHH/seccionTurnos/EditarTurno";

import Empleados from "./pages/adminRRHH/seccionEmpleados/Empleados";
import CrearEmpleado from "./pages/adminRRHH/seccionEmpleados/CrearEmpleado";
import EditarEmpleado from "./pages/adminRRHH/seccionEmpleados/EditarEmpleado";

import Contratos from "./pages/adminRRHH/seccionContratos/Contratos";
import CrearContrato from "./pages/adminRRHH/seccionContratos/CrearContrato";
import EditarContrato from "./pages/adminRRHH/seccionContratos/EditarContrato";

import TiposAusencias from "./pages/adminRRHH/seccionTiposAusencias/TiposAusencias";
import CrearTipoAusencia from "./pages/adminRRHH/seccionTiposAusencias/CrearTipoAusencia";
import EditarTipoaAusencia from "./pages/adminRRHH/seccionTiposAusencias/EditarTipoaAusencia";

import KPIs from "./pages/adminRRHH/seccionKPIs/KPIs";
import CrearKPI from "./pages/adminRRHH/seccionKPIs/CrearKPI";
import EditarKPI from "./pages/adminRRHH/seccionKPIs/EditarKPI";

import SolicitudesAusencias from "./pages/adminRRHH/seccionAusencias/SolicitudesAusencias";
import AprobacionSolicitud from "./pages/adminRRHH/seccionAusencias/AprobacionSolicitud";
import AprobacionesSolicitudes from "./pages/adminRRHH/seccionAusencias/AprobacionesSolicitudes";
import JornadasEmpleados from "./pages/adminRRHH/seccionJornadasEmpleados/JornadasEmpleados";

import AsignacionesKPIs from "./pages/adminRRHH/seccionAsignacionesKPIs/AsignacionesKPIs";
import CrearAsignacionKPI from "./pages/adminRRHH/seccionAsignacionesKPIs/CrearAsignacionKPI";
import EditarAsignacionKPI from "./pages/adminRRHH/seccionAsignacionesKPIs/EditarAsignacionKPI";

import SaldoVacaciones from "./pages/adminRRHH/seccionSaldoVacaciones/SaldoVacaciones";
import CrearSaldoVacacion from "./pages/adminRRHH/seccionSaldoVacaciones/CrearSaldoVacacion";

import EmpleadosMi_Equipo from "./pages/manager/seccionMi_Equipo/EmpleadosMi_Equipo";
import DetalleEmpleado from "./pages/manager/seccionMi_Equipo/DetalleEmpleado";
import JornadasEmpleado from "./pages/manager/seccionMi_Equipo/JornadasEmpleado";

import EvaluacionesDesempeno from "./pages/manager/seccionEvaluacionesDesempeno/EvaluacionesDesempeno";
import CrearEvaluacionDesempeno from "./pages/manager/seccionEvaluacionesDesempeno/CrearEvaluacionDesempeno";
import EditarEvaluacionDesempeno from "./pages/manager/seccionEvaluacionesDesempeno/EditarEvaluacionDesempeno";

import AsistenciaDia from "./pages/manager/seccionSupervisionAsistencia/AsistenciaDia";
import JornadasDia from "./pages/manager/seccionSupervisionAsistencia/JornadasDia";

import SolicitudesAusenciasManager from "./pages/manager/seccionAusencias/SolicitudesAusencias";
import AprobacionSolicitudManager from "./pages/manager/seccionAusencias/AprobacionSolicitud";
import AprobacionesSolicitudesManager from "./pages/manager/seccionAusencias/AprobacionesSolicitudes";

import AuditorUsuarios from "./pages/auditor/seccionAccesos/Usuarios";
import AuditorPermisos from "./pages/auditor/seccionAccesos/Permisos";

import LogsAuditoria from "./pages/auditor/seccionTrazabilidad/LogsAuditoria";

import EmpleadosAuditor from "./pages/auditor/seccionExpedientes/Empleados";
import DetallesEmpleadoAuditor from "./pages/auditor/seccionExpedientes/DetallesEmpleado";
import ContratoEmpleadoAuditor from "./pages/auditor/seccionExpedientes/ContratoEmpleado";
import JornadasEmpleadoAuditor from "./pages/auditor/seccionExpedientes/JornadasEmpleado";

import AuditorSolicitudesAusencias from "./pages/auditor/seccionAusencias/SolicitudesAusencias";
import AuditorAprobacionesAusencias from "./pages/auditor/seccionAusencias/AprobacionesAusencias";
import AuditorSaldoVacacionesEmpleados from "./pages/auditor/seccionAusencias/SaldoVacacionesEmpleados";

import AuditorAsignacionesKPI from "./pages/auditor/seccionDesempeno/AsignacionesKPI";
import AuditorResultadosKPI from "./pages/auditor/seccionDesempeno/ResultadosKPI";
import AuditorEvaluacionesDesempeno from "./pages/auditor/seccionDesempeno/EvaluacionesDesempeno";

import AuditorAsistenciasEmpleados from "./pages/auditor/seccionAsistencia/AsistenciasEmpleados";
import AuditorJornadasEmpleados from "./pages/auditor/seccionAsistencia/JornadasEmpleados";
import AuditorTurnosEmpleados from "./pages/auditor/seccionAsistencia/TurnosEmpleados";

import AsistenciaDiaria from "./pages/empleado/seccionAsistencia/AsistenciaDiaria";

import HistorialJornadas from "./pages/empleado/seccionJornadas/HistorialJornadas";

import SolicitudesAusenciasEmp from "./pages/empleado/seccionAusencias/SolicitudesAusenciasEmp";
import CrearSolicitudAusencia from "./pages/empleado/seccionAusencias/CrearSolicitudAusencia";
import EditarSolicitudAusencia from "./pages/empleado/seccionAusencias/EditarSolicitudAusencia";

import NotificacionesEmp from "./pages/empleado/seccionNotificaciones/NotificacionesEmp";

import MiPerfilCuentaEmp from "./pages/empleado/seccionPerfil/MiPerfilCuentaEmp";

import SoporteEmp from "./pages/empleado/seccionSoporte/SoporteEmp";

import DesempenoKpisEmp from "./pages/empleado/seccionKPI/DesempenoKpisEmp";

import DashboardSuperAdmin from "./pages/superAdmin/DashboardSuperAdmin/DashboardSuperAdmin";

import LogsAuditoriaSuperAdmin from "./pages/superAdmin/seccionTrazabilidad/LogsAuditoriaSuperAdmin";

import DashboardAdminRRH from "./pages/adminRRHH/DashboardAdminRRHH/DashboardAdminRRH";


// Guard
import ProtectedRoute from "./routes/ProtectedRoute";

const PublicLayout = ({ children }) => {
  return (
    <div className="public-layout">
      <Navbar />
      <main className="public-content">{children}</main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>

          {/* ======== RUTAS PÚBLICAS ======== */}

          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ======== RUTAS PRIVADAS POR ROL ======== */}

          {/* EPICA 1 - Login Roles */}

          <Route path="/superadmin/inicio" element={<ProtectedRoute allowedRoles={["superadmin"]}><InicioSuperAdmin /></ProtectedRoute>} />
          <Route path="/rrhh/inicio" element={<ProtectedRoute allowedRoles={["rrhh"]}><InicioAdminRRHH /></ProtectedRoute>} />
          <Route path="/manager/inicio" element={<ProtectedRoute allowedRoles={["manager"]}><InicioManager /></ProtectedRoute>} />
          <Route path="/empleado/inicio" element={<ProtectedRoute allowedRoles={["empleado"]}><InicioEmpleado /></ProtectedRoute>} />
          <Route path="/auditor/inicio" element={<ProtectedRoute allowedRoles={["auditor"]}><InicioAuditor /></ProtectedRoute>} />

          {/* ======== RUTAS SUPERADMIN ======== */}

          {/* EPICA 2 - Empresas */}
          <Route path="/admin/empresas" element={<ProtectedRoute allowedRoles={["superadmin"]}><Empresas /></ProtectedRoute>} />
          <Route path="/admin/empresas/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearEmpresa /></ProtectedRoute>} />
          <Route path="/admin/empresas/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarEmpresa /></ProtectedRoute>} />

          {/* EPICA 3 - Unidades Organizacionales Empresa */}
          <Route path="/admin/unidades-organizacionales" element={<ProtectedRoute allowedRoles={["superadmin"]}><UnidadesOrgEmp /></ProtectedRoute>} />
          <Route path="/admin/unidades-organizacionales/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearUnidadOrgEmp /></ProtectedRoute>} />
          <Route path="/admin/unidades-organizacionales/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarUnidadOrgEmp /></ProtectedRoute>} />

          {/* EPICA 4 - Puestos Empresa */}
          <Route path="/admin/puestos" element={<ProtectedRoute allowedRoles={["superadmin"]}><PuestosEmp /></ProtectedRoute>} />
          <Route path="/admin/puestos/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearPuestoEmp /></ProtectedRoute>} />
          <Route path="/admin/puestos/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarPuestoEmp /></ProtectedRoute>} />

          {/* EPICA 5 - Turnos Empresa */}
          <Route path="/admin/turnos" element={<ProtectedRoute allowedRoles={["superadmin"]}><TurnosEmp /></ProtectedRoute>} />
          <Route path="/admin/turnos/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearTurnoEmp /></ProtectedRoute>} />
          <Route path="/admin/turnos/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarTurnoEmp /></ProtectedRoute>} />

          {/* EPICA 6 - Reglas de Asistencia */}
          <Route path="/admin/reglas-asistencia" element={<ProtectedRoute allowedRoles={["superadmin"]}><ReglasAsistenciaEmp /></ProtectedRoute>} />
          <Route path="/admin/reglas-asistencia/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearReglaAsistenciaEmp /></ProtectedRoute>} />
          <Route path="/admin/reglas-asistencia/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarReglaAsistenciaEmp /></ProtectedRoute>} />

          {/* EPICA 7 - Tipos de Ausencias */}
          <Route path="/admin/tipos-ausencias" element={<ProtectedRoute allowedRoles={["superadmin"]}><TiposAusenciasEmp /></ProtectedRoute>} />
          <Route path="/admin/tipos-ausencias/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearTipoAusenciaEmp /></ProtectedRoute>} />
          <Route path="/admin/tipos-ausencias/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarTipoAusenciaEmp /></ProtectedRoute>} />

          {/* EPICA 8 - KPIs */}
          <Route path="/admin/kpis" element={<ProtectedRoute allowedRoles={["superadmin"]}><KPIsEmp /></ProtectedRoute>} />
          <Route path="/admin/kpis/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearKPI_Emp /></ProtectedRoute>} />
          <Route path="/admin/kpis/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarKPI_Emp /></ProtectedRoute>} />

          {/* EPICA 9 - Reportes Programados */}
          <Route path="/admin/reportes-programados" element={<ProtectedRoute allowedRoles={["superadmin"]}><ReportesProgramados /></ProtectedRoute>} />
          <Route path="/admin/reportes-programados/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearReporteProgramado /></ProtectedRoute>} />
          <Route path="/admin/reportes-programados/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarReporteProgramado /></ProtectedRoute>} />

          {/* EPICA 10 - Roles Empresa */}
          <Route path="/admin/roles" element={<ProtectedRoute allowedRoles={["superadmin"]}><RolesEmp /></ProtectedRoute>} />
          <Route path="/admin/roles/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearRolEmp /></ProtectedRoute>} />
          <Route path="/admin/roles/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarRolEmp /></ProtectedRoute>} />

          {/* EPICA 11 - Usuarios Empresa */}
          <Route path="/admin/usuarios" element={<ProtectedRoute allowedRoles={["superadmin"]}><UsuariosEmp /></ProtectedRoute>} />
          <Route path="/admin/usuarios/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearUsuarioEmp /></ProtectedRoute>} />
          <Route path="/admin/usuarios/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarUsuarioEmp /></ProtectedRoute>} />

          {/* EPICA 12 - Empleados Empresa */}
          <Route path="/admin/empleados" element={<ProtectedRoute allowedRoles={["superadmin"]}><EmpleadosEmp /></ProtectedRoute>} />
          <Route path="/admin/empleados/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearEmpleadoEmp /></ProtectedRoute>} />
          <Route path="/admin/empleados/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarEmpleadoEmp /></ProtectedRoute>} />

          {/* EPICA 13 - Permisos por Rol */}
          <Route path="/admin/permisos" element={<ProtectedRoute allowedRoles={["superadmin"]}><PermisosRolEmp /></ProtectedRoute>} />
          <Route path="/admin/permisos/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearPermisoRolEmp /></ProtectedRoute>} />
          <Route path="/admin/permisos/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarPermisoRolEmp /></ProtectedRoute>} />

          {/* EPICA 14 - Plantillas KPI */}
          <Route path="/admin/plantillas-kpi" element={<ProtectedRoute allowedRoles={["superadmin"]}><PlantillasKPIsEmp /></ProtectedRoute>} />
          <Route path="/admin/plantillas-kpi/crear" element={<ProtectedRoute allowedRoles={["superadmin"]}><CrearPlantillaKPI_Emp /></ProtectedRoute>} />
          <Route path="/admin/plantillas-kpi/editar/:id" element={<ProtectedRoute allowedRoles={["superadmin"]}><EditarPlantillaKPI_Emp /></ProtectedRoute>} />


          {/* ======== RUTAS EMPLEADO ======== */}

          {/* EPICA 15 -  */}
          {/* EPICA 16 -  */}
          <Route path="/empleado/asistencia" element={<ProtectedRoute allowedRoles={["empleado"]}><AsistenciaDiaria /></ProtectedRoute>} />
          
          {/* EPICA 17 -  */}
          <Route path="/empleado/jornadas" element={<ProtectedRoute allowedRoles={["empleado"]}><HistorialJornadas /></ProtectedRoute>} />

          {/* EPICA 18 -  */}
          <Route path="/empleado/ausencias" element={<ProtectedRoute allowedRoles={["empleado"]}><SolicitudesAusenciasEmp /></ProtectedRoute>} />
          <Route path="/empleado/ausencias/crear" element={<ProtectedRoute allowedRoles={["empleado"]}><CrearSolicitudAusencia /></ProtectedRoute>} />
          <Route path="/empleado/ausencias/editar/:id" element={<ProtectedRoute allowedRoles={["empleado"]}><EditarSolicitudAusencia /></ProtectedRoute>} />
          
          {/* EPICA 19 -  */}
          <Route path="/empleado/notificaciones" element={<ProtectedRoute allowedRoles={["empleado"]}><NotificacionesEmp /></ProtectedRoute>} />

          {/* EPICA 20 -  */}
          <Route path="/empleado/mi-perfil" element={<ProtectedRoute allowedRoles={["empleado"]}><MiPerfilCuentaEmp /></ProtectedRoute>} />

          {/* ======== RUTAS RRHH ======== */}

          {/* EPICA 21 -  */} 

          <Route path="/rrhh/unidades-organizacionales" element={<ProtectedRoute allowedRoles={["rrhh"]}><UnidadesOrg /></ProtectedRoute>} />
          <Route path="/rrhh/unidades-organizacionales/crear" element={<ProtectedRoute allowedRoles={["rrhh"]}><CrearUnidadOrg /></ProtectedRoute>} />
          <Route path="/rrhh/unidades-organizacionales/editar/:id" element={<ProtectedRoute allowedRoles={["rrhh"]}><EditarUnidadOrg /></ProtectedRoute>} />

          {/* EPICA 22 -  */} 

          <Route path="/rrhh/puestos" element={<ProtectedRoute allowedRoles={["rrhh"]}><Puestos /></ProtectedRoute>} />
          <Route path="/rrhh/puestos/crear" element={<ProtectedRoute allowedRoles={["rrhh"]}><CrearPuesto /></ProtectedRoute>} />
          <Route path="/rrhh/puestos/editar/:id" element={<ProtectedRoute allowedRoles={["rrhh"]}><EditarPuesto /></ProtectedRoute>} />

          {/* EPICA 23 -  */}

          <Route path="/rrhh/turnos" element={<ProtectedRoute allowedRoles={["rrhh"]}><Turnos /></ProtectedRoute>} />
          <Route path="/rrhh/turnos/crear" element={<ProtectedRoute allowedRoles={["rrhh"]}><CrearTurno /></ProtectedRoute>} />
          <Route path="/rrhh/turnos/editar/:id" element={<ProtectedRoute allowedRoles={["rrhh"]}><EditarTurno /></ProtectedRoute>} />

          {/* EPICA 24 -  */}

          <Route path="/rrhh/empleados" element={<ProtectedRoute allowedRoles={["rrhh"]}><Empleados /></ProtectedRoute>} />
          <Route path="/rrhh/empleados/crear" element={<ProtectedRoute allowedRoles={["rrhh"]}><CrearEmpleado /></ProtectedRoute>} />
          <Route path="/rrhh/empleados/editar/:id" element={<ProtectedRoute allowedRoles={["rrhh"]}><EditarEmpleado /></ProtectedRoute>} />

          {/* EPICA 25 -  */} 

          <Route path="/rrhh/contratos" element={<ProtectedRoute allowedRoles={["rrhh"]}><Contratos /></ProtectedRoute>} />
          <Route path="/rrhh/contratos/crear" element={<ProtectedRoute allowedRoles={["rrhh"]}><CrearContrato /></ProtectedRoute>} />
          <Route path="/rrhh/contratos/editar/:id" element={<ProtectedRoute allowedRoles={["rrhh"]}><EditarContrato /></ProtectedRoute>} />

          {/* EPICA 26 -  */} 

          <Route path="/rrhh/tipos-ausencias" element={<ProtectedRoute allowedRoles={["rrhh"]}><TiposAusencias /></ProtectedRoute>} />
          <Route path="/rrhh/tipos-ausencias/crear" element={<ProtectedRoute allowedRoles={["rrhh"]}><CrearTipoAusencia /></ProtectedRoute>} />
          <Route path="/rrhh/tipos-ausencias/editar/:id" element={<ProtectedRoute allowedRoles={["rrhh"]}><EditarTipoaAusencia /></ProtectedRoute>} />

          {/* EPICA 27 -  */}

          <Route path="/rrhh/kpis" element={<ProtectedRoute allowedRoles={["rrhh"]}><KPIs /></ProtectedRoute>} />
          <Route path="/rrhh/kpis/crear" element={<ProtectedRoute allowedRoles={["rrhh"]}><CrearKPI /></ProtectedRoute>} />
          <Route path="/rrhh/kpis/editar/:id" element={<ProtectedRoute allowedRoles={["rrhh"]}><EditarKPI /></ProtectedRoute>} />

          {/* EPICA 28 -  */}

          <Route path="/rrhh/ausencias/solicitudes" element={<ProtectedRoute allowedRoles={["rrhh"]}><SolicitudesAusencias /></ProtectedRoute>} />
          <Route path="/rrhh/ausencias/solicitudes/:id" element={<ProtectedRoute allowedRoles={["rrhh"]}><AprobacionSolicitud /></ProtectedRoute>} />
          <Route path="/rrhh/ausencias/aprobaciones" element={<ProtectedRoute allowedRoles={["rrhh"]}><AprobacionesSolicitudes /></ProtectedRoute>} />
          <Route path="/rrhh/jornadas-calculadas" element={<ProtectedRoute allowedRoles={["rrhh"]}><JornadasEmpleados /></ProtectedRoute>} />

          {/* EPICA 29 -  */}

          <Route path="/rrhh/kpi/asignaciones" element={<ProtectedRoute allowedRoles={["rrhh"]}><AsignacionesKPIs /></ProtectedRoute>} />
          <Route path="/rrhh/kpi/asignaciones/crear" element={<ProtectedRoute allowedRoles={["rrhh"]}><CrearAsignacionKPI /></ProtectedRoute>} />
          <Route path="/rrhh/kpi/asignaciones/:id/editar" element={<ProtectedRoute allowedRoles={["rrhh"]}><EditarAsignacionKPI /></ProtectedRoute>} />

          {/* EPICA 30 -  */}

          <Route path="/rrhh/vacaciones/saldos" element={<ProtectedRoute allowedRoles={["rrhh"]}><SaldoVacaciones /></ProtectedRoute>} />
          <Route path="/rrhh/vacaciones/saldos/crear" element={<ProtectedRoute allowedRoles={["rrhh"]}><CrearSaldoVacacion /></ProtectedRoute>} />

          {/* ======== RUTAS MANAGER ======== */}

          {/* EPICA 31 -  */}

          <Route path="/manager/mi-equipo/empleados" element={<ProtectedRoute allowedRoles={["manager"]}><EmpleadosMi_Equipo /></ProtectedRoute>} />
          <Route path="/manager/mi-equipo/empleados/:id" element={<ProtectedRoute allowedRoles={["manager"]}><DetalleEmpleado /></ProtectedRoute>} />
          <Route path="/manager/mi-equipo/empleados/:id/jornadas" element={<ProtectedRoute allowedRoles={["manager"]}><JornadasEmpleado /></ProtectedRoute>} />

          {/* EPICA 32 -  */} 

          <Route path="/manager/evaluaciones" element={<ProtectedRoute allowedRoles={["manager"]}><EvaluacionesDesempeno /></ProtectedRoute>} />
          <Route path="/manager/evaluaciones/crear" element={<ProtectedRoute allowedRoles={["manager"]}><CrearEvaluacionDesempeno /></ProtectedRoute>} />
          <Route path="/manager/evaluaciones/editar/:id" element={<ProtectedRoute allowedRoles={["manager"]}><EditarEvaluacionDesempeno /></ProtectedRoute>} />

          {/* EPICA 33 -  */}  

          <Route path="/manager/supervision/asistencia" element={<ProtectedRoute allowedRoles={["manager"]}><AsistenciaDia /></ProtectedRoute>} />
          <Route path="/manager/supervision/jornadas" element={<ProtectedRoute allowedRoles={["manager"]}><JornadasDia /></ProtectedRoute>} />

          {/* EPICA 34 -  */}

          <Route path="/manager/ausencias/solicitudes" element={<ProtectedRoute allowedRoles={["manager"]}><SolicitudesAusenciasManager /></ProtectedRoute>} />
          <Route path="/manager/ausencias/solicitudes/:id" element={<ProtectedRoute allowedRoles={["manager"]}><AprobacionSolicitudManager /></ProtectedRoute>} />
          <Route path="/manager/ausencias/aprobaciones" element={<ProtectedRoute allowedRoles={["manager"]}><AprobacionesSolicitudesManager /></ProtectedRoute>} />

          {/* ======== RUTAS AUDITOR ======== */}

          {/* EPICA 35 -  */}

          <Route path="/auditor/accesos/usuarios" element={<ProtectedRoute allowedRoles={["auditor"]}><AuditorUsuarios /></ProtectedRoute>} />
          <Route path="/auditor/accesos/permisos" element={<ProtectedRoute allowedRoles={["auditor"]}><AuditorPermisos /></ProtectedRoute>} />

          {/* EPICA 36 -  */}  

          <Route path="/auditor/trazabilidad/logs" element={<ProtectedRoute allowedRoles={["auditor"]}><LogsAuditoria /></ProtectedRoute>} />

          {/* EPICA 37 -  */}

          <Route path="/auditor/expedientes/empleados" element={<ProtectedRoute allowedRoles={["auditor"]}><EmpleadosAuditor /></ProtectedRoute>} />
          <Route path="/auditor/expedientes/empleados/:id" element={<ProtectedRoute allowedRoles={["auditor"]}><DetallesEmpleadoAuditor /></ProtectedRoute>} />
          <Route path="/auditor/expedientes/empleados/:id/contrato" element={<ProtectedRoute allowedRoles={["auditor"]}><ContratoEmpleadoAuditor /></ProtectedRoute>} />
          <Route path="/auditor/expedientes/empleados/:id/jornadas" element={<ProtectedRoute allowedRoles={["auditor"]}><JornadasEmpleadoAuditor /></ProtectedRoute>} />

          {/* EPICA 38 -  */}

          <Route path="/auditor/ausencias/solicitudes" element={<ProtectedRoute allowedRoles={["auditor"]}><AuditorSolicitudesAusencias /></ProtectedRoute>} />
          <Route path="/auditor/ausencias/aprobaciones" element={<ProtectedRoute allowedRoles={["auditor"]}><AuditorAprobacionesAusencias /></ProtectedRoute>} />
          <Route path="/auditor/ausencias/saldos-vacaciones" element={<ProtectedRoute allowedRoles={["auditor"]}><AuditorSaldoVacacionesEmpleados /></ProtectedRoute>} />

          {/* EPICA 39 -  */}  

          <Route path="/auditor/desempeno/asignaciones-kpi" element={<ProtectedRoute allowedRoles={["auditor"]}><AuditorAsignacionesKPI /></ProtectedRoute>} />
          <Route path="/auditor/desempeno/resultados-kpi" element={<ProtectedRoute allowedRoles={["auditor"]}><AuditorResultadosKPI /></ProtectedRoute>} />
          <Route path="/auditor/desempeno/evaluaciones" element={<ProtectedRoute allowedRoles={["auditor"]}><AuditorEvaluacionesDesempeno /></ProtectedRoute>} />

          {/* EPICA 40 -  */}

          <Route path="/auditor/asistencia/eventos" element={<ProtectedRoute allowedRoles={["auditor"]}><AuditorAsistenciasEmpleados /></ProtectedRoute>} />
          <Route path="/auditor/asistencia/jornadas" element={<ProtectedRoute allowedRoles={["auditor"]}><AuditorJornadasEmpleados /></ProtectedRoute>} />
          <Route path="/auditor/asistencia/turnos-empleados" element={<ProtectedRoute allowedRoles={["auditor"]}><AuditorTurnosEmpleados /></ProtectedRoute>} />

          {/* ======== RUTAS SPRINT 5 ======== */}

          {/* EPICA 41 -  */}
          <Route path="/superadmin/dashboard" element={<ProtectedRoute allowedRoles={["superadmin"]}><DashboardSuperAdmin /></ProtectedRoute>} />
          
          {/* EPICA 42 -  */}  

          <Route path="/superadmin/trazabilidad/logs" element={<ProtectedRoute allowedRoles={["superadmin"]}><LogsAuditoriaSuperAdmin /></ProtectedRoute>} />

          {/* EPICA 43 -  */} 

          {/* EPICA 44 -  */}  

          {/* EPICA 45 -  */}  

          {/* EPICA 46 -  */} 
          <Route path="/empleado/desempeno-kpis" element={<ProtectedRoute allowedRoles={["empleado"]}><DesempenoKpisEmp /></ProtectedRoute>} />

          {/* EPICA 47 -  */} 
          <Route path="/empleado/soporte" element={<ProtectedRoute allowedRoles={["empleado"]}><SoporteEmp /></ProtectedRoute>} />

          {/* EPICA 48 -  */} 

          <Route
            path="/rrhh/dashboard"
            element={
              <ProtectedRoute allowedRoles={["rrhh"]}>
                <DashboardAdminRRH />
              </ProtectedRoute>
            }
          />
      
     
          {/* =========================
              COMPATIBILIDAD (rutas viejas)
              Para no romper enlaces existentes
          ========================== */}

          <Route path="/admin/inicio" element={<Navigate to="/superadmin/inicio" replace />} />

          {/* Si tu InicioSuperAdmin tiene botón que iba a /admin/empresas/crear-empresa */}
          <Route path="/admin/empresas/crear-empresa" element={<Navigate to="/admin/empresas/crear" replace />} />

          {/* Si tenías /admin/empresas/editar-empresa/:id */}
          <Route
            path="/admin/empresas/editar-empresa/:id"
            element={<Navigate to="/admin/empresas/editar/:id" replace />}
          />

          {/* =========================
              404
          ========================== */}
          <Route
            path="*"
            element={
              <div style={{ textAlign: "center", marginTop: "50px" }}>
                <h1>404</h1>
                <p>Página no encontrada</p>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
