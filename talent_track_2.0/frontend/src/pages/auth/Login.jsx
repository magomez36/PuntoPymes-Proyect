import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/img/talenTrackLogo_SVG.svg";
import "boxicons/css/boxicons.min.css";

const API_BASE = "http://127.0.0.1:8000";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const togglePassword = () => setShowPassword((s) => !s);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getStorage = () => (formData.remember ? localStorage : sessionStorage);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
      };

      // 1) LOGIN
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.detail || "Credenciales inválidas.";
        throw new Error(msg);
      }

      const data = await res.json(); // { access, refresh, context }
      const { access, refresh, context } = data;

      if (!access || !refresh || !context?.redirect_to) {
        throw new Error("Respuesta de login incompleta.");
      }

      const storage = getStorage();

      // limpiar la otra storage para evitar conflictos
      (storage === localStorage ? sessionStorage : localStorage).removeItem("tt_access");
      (storage === localStorage ? sessionStorage : localStorage).removeItem("tt_refresh");
      (storage === localStorage ? sessionStorage : localStorage).removeItem("tt_context");
      (storage === localStorage ? sessionStorage : localStorage).removeItem("tt_full_name");

      // 2) GUARDAR TOKENS + CONTEXTO
      storage.setItem("tt_access", access);
      storage.setItem("tt_refresh", refresh);
      storage.setItem("tt_context", JSON.stringify(context));

      // 3) PERFIL (para "Bienvenido, Nombre Apellido")
      const meRes = await fetch(`${API_BASE}/api/auth/me/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${access}` },
      });

      if (meRes.ok) {
        const me = await meRes.json();
        if (me?.full_name) {
          storage.setItem("tt_full_name", me.full_name);
        }
      }

      // 4) REDIRECCIÓN POR ROL
      navigate(context.redirect_to, { replace: true });
    } catch (err) {
      setErrorMsg(err?.message || "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="logo-container">
          <img
            src={logo}
            alt="Logo"
            className="logo-image"
            style={{ width: "200px", marginBottom: "10px" }}
          />
          <h1 className="login-title">Bienvenido de nuevo</h1>
          <p className="login-subtitle">Inicia sesión para gestionar tu equipo.</p>
        </div>

        <form onSubmit={handleSubmit} id="loginForm">
          {errorMsg && (
            <div
              style={{
                background: "#ffe8ea",
                color: "#b00020",
                padding: "10px 12px",
                borderRadius: "10px",
                marginBottom: "12px",
                fontSize: "0.95rem",
              }}
            >
              {errorMsg}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <div className="input-wrapper">
              <i className="bx bxs-user input-icon" style={{ color: "#d51e37" }}></i>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="Ingresa tu email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Contraseña
            </label>
            <div className="input-wrapper">
              <i className="bx bxs-lock input-icon" style={{ color: "#d51e37" }}></i>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <i
                className={`bx ${showPassword ? "bx-show" : "bx-hide"} password-toggle`}
                style={{ color: "#868988" }}
                onClick={togglePassword}
              ></i>
            </div>
          </div>

          <div className="form-options">
            <div className="checkbox-wrapper">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
              />
              <label className="checkbox-label" htmlFor="remember">
                Recordar sesión
              </label>
            </div>
            <Link to="/reset-password" className="forgot-password">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>

        <Link to="/" className="back-home-link">
          ← Volver al inicio
        </Link>

        <p className="footer-text" style={{ marginTop: "30px" }}>
          © 2025 UTPL. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;
