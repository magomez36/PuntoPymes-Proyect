import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// imports de css y layouts...
import './assets/css/styles.css';
import 'boxicons/css/boxicons.min.css';
import Header from './components/Header';
import Footer from './components/Footer';

// Paginas Publicas
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import ResetPassword from './pages/auth/ResetPassword';

// Paginas de Super Admin
import InicioSuperAdmin from './pages/superAdmin/InicioSuperAdmin';
import EmpresasSuperAdmin from './pages/superAdmin/EmpresasSuperAdmin';
import CrearEmpresaSuperAdmin from './pages/superAdmin/CrearEmpresaSuperAdmin';
import DashboardSuperAdmin from './pages/superAdmin/DashboardSuperAdmin';
import VerEmpresaSuperAdmin from './pages/superAdmin/VerEmpresaSuperAdmin';
import EditarEmpresaSuperAdmin from './pages/superAdmin/EditarEmpresaSuperAdmin';

const PublicLayout = ({ children }) => {
  return (
    // OJO: Cambié "public-layout" por "layout" porque en tu CSS original
    // la clase que tiene los estilos se llama ".layout".
    <div className="layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          
          {/* ----- RUTAS PÚBLICAS ----- */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          
          {/* Login y Reset no llevan layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ----- RUTAS DE ADMINISTRACIÓN ----- */}
          {/* Aquí cargamos los componentes directamente, sin envolverlos en PrivateLayout */}
          <Route path="/admin/inicio" element={<InicioSuperAdmin />} />
          <Route path="/admin/dashboard" element={<DashboardSuperAdmin />} />
          <Route path="/admin/empresas" element={<EmpresasSuperAdmin />} />
          <Route path="/admin/crear-empresa" element={<CrearEmpresaSuperAdmin />} />

          {/* Rutas con parámetros (ID)*/}
          <Route path="/admin/ver-empresa/:id" element={<VerEmpresaSuperAdmin />} />
          <Route path="/admin/editar-empresa/:id" element={<EditarEmpresaSuperAdmin />} />

          {/* -------RUTA 404 (Cualquier otra cosa)-------- */}
          <Route path="*" element={<div style={{textAlign:'center', marginTop:'50px'}}><h1>404</h1><p>Página no encontrada</p></div>} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;