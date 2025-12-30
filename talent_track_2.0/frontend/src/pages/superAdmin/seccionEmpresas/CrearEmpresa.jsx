import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { getAccessToken } from "../../../services/authStorage";

const CrearEmpresa = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    razonSocial: "",
    nombreEmpresa: "",
    ruc: "",
    paisId: "",
    monedaId: "",
    monedaNombre: "",
  });

  const configuracionPaises = {
    Argentina: { paisId: 1, monedaId: 1, monedaNombre: "Peso argentino (ARS)" },
    Bolivia: { paisId: 2, monedaId: 2, monedaNombre: "Boliviano (BOB)" },
    Chile: { paisId: 3, monedaId: 3, monedaNombre: "Peso chileno (CLP)" },
    Colombia: { paisId: 4, monedaId: 4, monedaNombre: "Peso colombiano (COP)" },
    "Costa Rica": { paisId: 5, monedaId: 5, monedaNombre: "Colón costarricense (CRC)" },
    Cuba: { paisId: 6, monedaId: 6, monedaNombre: "Peso cubano (CUP)" },
    "República Dominicana": { paisId: 7, monedaId: 7, monedaNombre: "Peso dominicano (DOP)" },
    Ecuador: { paisId: 8, monedaId: 8, monedaNombre: "Dólar estadounidense (USD)" },
    "El Salvador": { paisId: 9, monedaId: 9, monedaNombre: "Dólar estadounidense (USD)" },
    España: { paisId: 10, monedaId: 10, monedaNombre: "Euro (EUR)" },
    Guatemala: { paisId: 11, monedaId: 11, monedaNombre: "Quetzal (GTQ)" },
    Honduras: { paisId: 12, monedaId: 12, monedaNombre: "Lempira (HNL)" },
    México: { paisId: 13, monedaId: 13, monedaNombre: "Peso mexicano (MXN)" },
    Nicaragua: { paisId: 14, monedaId: 14, monedaNombre: "Córdoba nicaragüense (NIO)" },
    Panamá: { paisId: 15, monedaId: 15, monedaNombre: "Balboa (PAB) y Dólar (USD)" },
    Paraguay: { paisId: 16, monedaId: 16, monedaNombre: "Guaraní paraguayo (PYG)" },
    Perú: { paisId: 17, monedaId: 17, monedaNombre: "Sol peruano (PEN)" },
    Uruguay: { paisId: 18, monedaId: 18, monedaNombre: "Peso uruguayo (UYU)" },
    Venezuela: { paisId: 19, monedaId: 19, monedaNombre: "Bolívar venezolano (VES)" },
  };

  const handleChange = (e) => {
    setFormData((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePaisChange = (e) => {
    const nombrePais = e.target.value;
    const config = configuracionPaises[nombrePais];

    if (config) {
      setFormData((p) => ({
        ...p,
        paisId: config.paisId,
        monedaId: config.monedaId,
        monedaNombre: config.monedaNombre,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.paisId || !formData.monedaId) {
      alert("Selecciona un país para asignar país y moneda.");
      return;
    }

    const payload = {
      razon_social: formData.razonSocial.trim(),
      nombre_comercial: formData.nombreEmpresa.trim(),
      ruc_nit: formData.ruc.trim(),
      pais: Number(formData.paisId),
      moneda: Number(formData.monedaId),
      // NO mandamos estado, el backend lo fuerza a 1 (activo)
    };

    console.log("Payload crear empresa =>", payload);

    try {
      const token = getAccessToken();
      if (!token) {
        alert("No hay sesión activa. Inicia sesión.");
        navigate("/login", { replace: true });
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/api/crear-empresa/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Empresa creada exitosamente");
        navigate("/admin/empresas");
        return;
      }

      // backend error
      const errorData = await response.json().catch(() => ({}));
      console.error("Error backend crear empresa:", errorData);

      // si te vuelve a salir el id duplicado, este mensaje te lo deja claro
      alert(
        errorData?.detail ||
          "Error al crear empresa (revisa consola y backend)."
      );
    } catch (error) {
      console.error("Error de red:", error);
      alert("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <header className="header">
          <h2 className="header-title">Empresa</h2>
        </header>

        <div className="content-area">
          <nav className="breadcrumb">
            <Link to="/admin/empresas" className="breadcrumb-item">
              Gestión de Empresas
            </Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item active">Crear Empresa</span>
          </nav>

          <div className="form-card">
            <div className="form-header">
              <h2 className="form-title">Nueva Empresa</h2>
              <p className="form-description">
                Complete los datos para registrar la empresa en el sistema.
              </p>
            </div>

            <form className="company-form" onSubmit={handleSubmit}>
              {/* LOGO (NO SE ENVÍA) */}
              <div className="form-section">
                <label className="form-label">Logo de la Empresa</label>
                <div className="upload-area">
                  <i className="bx bx-image-add upload-icon"></i>
                  <div className="upload-text">
                    <span className="upload-link">Subir imagen</span>
                  </div>
                  <input type="file" hidden />
                </div>
              </div>

              <div className="form-row">
                <div className="form-section">
                  <label className="form-label">
                    Razón Social <span className="required">*</span>
                  </label>
                  <div className="input-with-icon">
                    <i className="bx bxs-business input-icon-left"></i>
                    <input
                      type="text"
                      name="razonSocial"
                      className="form-input-field"
                      placeholder="Ej. Innovate Corp S.A."
                      required
                      value={formData.razonSocial}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <label className="form-label">
                    Nombre Comercial <span className="required">*</span>
                  </label>
                  <div className="input-with-icon">
                    <i className="bx bx-buildings input-icon-left"></i>
                    <input
                      type="text"
                      name="nombreEmpresa"
                      className="form-input-field"
                      placeholder="Ej. Innovate Corp"
                      required
                      value={formData.nombreEmpresa}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-section">
                  <label className="form-label">
                    RUC / Identificación <span className="required">*</span>
                  </label>
                  <div className="input-with-icon">
                    <i className="bx bx-id-card input-icon-left"></i>
                    <input
                      type="text"
                      name="ruc"
                      className="form-input-field"
                      placeholder="Ej. 1234567890"
                      required
                      value={formData.ruc}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <label className="form-label">
                    País <span className="required">*</span>
                  </label>
                  <select
                    className="form-select-field"
                    required
                    onChange={handlePaisChange}
                    value={
                      Object.keys(configuracionPaises).find(
                        (k) => configuracionPaises[k].paisId === Number(formData.paisId)
                      ) || ""
                    }
                  >
                    <option value="" disabled>
                      Seleccionar País
                    </option>
                    {Object.keys(configuracionPaises).map((paisName) => (
                      <option key={paisName} value={paisName}>
                        {paisName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-section">
                  <label className="form-label">Moneda Principal</label>
                  <div className="input-with-icon">
                    <i className="bx bx-money input-icon-left"></i>
                    <input
                      type="text"
                      className="form-input-field"
                      placeholder="Seleccione un país primero"
                      value={formData.monedaNombre}
                      readOnly
                      style={{ backgroundColor: "#f9fafb", cursor: "not-allowed" }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <Link
                  to="/admin/empresas"
                  className="btn-cancel"
                  style={{ textDecoration: "none", display: "flex", alignItems: "center" }}
                >
                  Cancelar
                </Link>
                <button type="submit" className="btn-save">
                  <i className="bx bx-save"></i> Crear Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CrearEmpresa;
