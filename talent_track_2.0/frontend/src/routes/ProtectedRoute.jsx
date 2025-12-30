import React from "react";
import { Navigate } from "react-router-dom";

const getStorage = () => {
  // Si está en localStorage, usamos localStorage; sino, sessionStorage
  const hasLocal = localStorage.getItem("tt_access") || localStorage.getItem("tt_context");
  return hasLocal ? localStorage : sessionStorage;
};

export default function ProtectedRoute({ allowedRoles, children }) {
  const storage = getStorage();
  const access = storage.getItem("tt_access");
  const contextRaw = storage.getItem("tt_context");
  const context = contextRaw ? JSON.parse(contextRaw) : null;

  // No logueado
  if (!access || !context?.rol) {
    return <Navigate to="/login" replace />;
  }

  const rol = (context.rol || "").toLowerCase();

  // Rol no permitido
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(rol)) {
    // Si tiene redirect_to, lo mandamos a su home correcto
    const fallback = context.redirect_to || "/login";
    return <Navigate to={fallback} replace />;
  }

  return children;
}
