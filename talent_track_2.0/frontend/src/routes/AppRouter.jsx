import { BrowserRouter, Routes, Route } from 'react-router-dom';

// PUBLIC
import Home from '../pages/public/Home';

// AUTH
import Login from '../pages/auth/Login';
import ResetPassword from '../pages/auth/ResetPassword';

// ROLES
import DashboardAdminRRHH from '../pages/adminRRHH/DashboardAdminRRHH';
import InicioEmpleado from '../pages/empleado/InicioEmpleado';
import DashboardManager from '../pages/manager/DashboardManager';
import DashboardSuperAdmin from '../pages/superAdmin/DashboardSuperAdmin';
import DashboardAuditor from '../pages/auditor/DashboardAuditor';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Home />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ROLES */}
        <Route path="/admin-rrhh" element={<DashboardAdminRRHH />} />
        <Route path="/empleado" element={<InicioEmpleado />} />
        <Route path="/manager" element={<DashboardManager />} />
        <Route path="/superadmin" element={<DashboardSuperAdmin />} />
        <Route path="/auditor" element={<DashboardAuditor />} />

      </Routes>
    </BrowserRouter>
  );
}
