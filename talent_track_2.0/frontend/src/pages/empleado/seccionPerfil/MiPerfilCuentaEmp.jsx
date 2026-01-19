import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import { apiFetch } from "../../../services/api";
import { Link } from "react-router-dom";

async function safeJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { _non_json: true, raw: text };
  }
}

function fmtDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export default function MiPerfilCuentaEmp() {
  const [tab, setTab] = useState("perfil"); // perfil | cuenta
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [perfil, setPerfil] = useState(null);
  const [cuenta, setCuenta] = useState(null);

  const [editPerfil, setEditPerfil] = useState(false);
  const [editCuenta, setEditCuenta] = useState(false);

  const [perfilForm, setPerfilForm] = useState({
    telefono: "",
    direccion: "",
    fecha_nacimiento: "",
  });

  const [cuentaForm, setCuentaForm] = useState({
    email: "",
    phone: "",
    password_actual: "",
    password_nueva: "",
    password_nueva_repetir: "",
  });

  const loadAll = async () => {
    setErr("");
    setLoading(true);
    try {
      const r1 = await apiFetch("/api/empleado/perfil/");
      const d1 = await safeJson(r1);
      if (!r1.ok) throw new Error(d1?.detail || "Error cargando perfil.");

      const r2 = await apiFetch("/api/empleado/cuenta/");
      const d2 = await safeJson(r2);
      if (!r2.ok) throw new Error(d2?.detail || "Error cargando cuenta.");

      setPerfil(d1);
      setCuenta(d2);

      setPerfilForm({
        telefono: d1?.telefono || "",
        direccion: d1?.direccion || "",
        fecha_nacimiento: fmtDate(d1?.fecha_nacimiento),
      });

      setCuentaForm((p) => ({
        ...p,
        email: d2?.email || "",
        phone: d2?.phone || "",
        password_actual: "",
        password_nueva: "",
        password_nueva_repetir: "",
      }));
    } catch (e) {
      setErr(e?.message || "Error cargando datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const onChangePerfil = (e) => {
    const { name, value } = e.target;
    setPerfilForm((p) => ({ ...p, [name]: value }));
  };

  const onChangeCuenta = (e) => {
    const { name, value } = e.target;
    setCuentaForm((p) => ({ ...p, [name]: value }));
  };

  const guardarPerfil = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      const payload = {
        telefono: perfilForm.telefono || null,
        direccion: perfilForm.direccion || null,
        fecha_nacimiento: perfilForm.fecha_nacimiento ? perfilForm.fecha_nacimiento : null,
      };

      const res = await apiFetch("/api/empleado/perfil/", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.detail || JSON.stringify(data || {}));

      setPerfil(data);
      setEditPerfil(false);
      alert("Datos personales actualizados.");
    } catch (e2) {
      setErr(e2?.message || "Error guardando perfil.");
    }
  };

  // ✅ 1) Actualiza SOLO email/phone en /api/empleado/cuenta/
  // ✅ 2) Si quiere cambiar password => PATCH /api/empleado/usuario/cambiar-password/
  const guardarCuenta = async (e) => {
    e.preventDefault();
    setErr("");

    const pa = cuentaForm.password_actual;
    const pn = cuentaForm.password_nueva;
    const pr = cuentaForm.password_nueva_repetir;

    const quiereCambiarPass = Boolean(pa || pn || pr);

    // validación front (dinámica)
    if (quiereCambiarPass) {
      if (!(pa && pn && pr)) return setErr("Para cambiar contraseña debes llenar: actual, nueva y repetir nueva.");
      if (pn !== pr) return setErr("La nueva contraseña no coincide.");
      if (pn.length < 6) return setErr("La nueva contraseña debe tener al menos 6 caracteres.");
      if (pa === pn) return setErr("La nueva contraseña no puede ser igual a la contraseña actual.");
    }

    try {
      // 1) Guardar email / phone
      const payloadCuenta = {
        email: cuentaForm.email.trim(),
        phone: cuentaForm.phone || null,
      };

      const resCuenta = await apiFetch("/api/empleado/cuenta/", {
        method: "PUT",
        body: JSON.stringify(payloadCuenta),
      });

      const dataCuenta = await safeJson(resCuenta);
      if (!resCuenta.ok) throw new Error(dataCuenta?.detail || JSON.stringify(dataCuenta || {}));

      setCuenta(dataCuenta);

      // 2) Cambiar password si aplica (endpoint separado)
      if (quiereCambiarPass) {
        const payloadPass = {
          password_actual: pa,
          password_nueva: pn,
          password_nueva_repetir: pr,
        };

        const resPass = await apiFetch("/api/empleado/usuario/cambiar-password/", {
          method: "PATCH",
          body: JSON.stringify(payloadPass),
        });

        const dataPass = await safeJson(resPass);
        if (!resPass.ok) {
          // backend suele devolver {password_actual: "..."} o {detail:"..."}
          const firstKey = dataPass && typeof dataPass === "object" ? Object.keys(dataPass)[0] : null;
          throw new Error(firstKey ? dataPass[firstKey] : dataPass?.detail || "No se pudo cambiar la contraseña.");
        }
      }

      setEditCuenta(false);

      // limpiar passwords tras guardar
      setCuentaForm((p) => ({
        ...p,
        password_actual: "",
        password_nueva: "",
        password_nueva_repetir: "",
      }));

      alert(quiereCambiarPass ? "Cuenta actualizada (incluye contraseña)." : "Cuenta actualizada.");
    } catch (e2) {
      setErr(e2?.message || "Error guardando cuenta.");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <h2>Mi Perfil</h2>

        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <button onClick={() => setTab("perfil")} disabled={tab === "perfil"}>Datos personales</button>
          <button onClick={() => setTab("cuenta")} disabled={tab === "cuenta"}>Cuenta</button>
          <button onClick={loadAll}>Refrescar</button>
        </div>

        {loading && <p>Cargando...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && tab === "perfil" && perfil && (
          <div>
            <h3>Datos personales</h3>

            {!editPerfil ? (
              <div>
                <p><strong>Nombres:</strong> {perfil.nombres} {perfil.apellidos}</p>
                <p><strong>Email:</strong> {perfil.email}</p>
                <p><strong>Teléfono:</strong> {perfil.telefono || "—"}</p>
                <p><strong>Dirección:</strong> {perfil.direccion || "—"}</p>
                <p><strong>Fecha nacimiento:</strong> {perfil.fecha_nacimiento ? fmtDate(perfil.fecha_nacimiento) : "—"}</p>

                <button onClick={() => setEditPerfil(true)}>Editar</button>
              </div>
            ) : (
              <form onSubmit={guardarPerfil}>
                <div>
                  <label>Teléfono</label>
                  <input name="telefono" value={perfilForm.telefono} onChange={onChangePerfil} />
                </div>

                <div style={{ marginTop: 8 }}>
                  <label>Dirección</label>
                  <input name="direccion" value={perfilForm.direccion} onChange={onChangePerfil} />
                </div>

                <div style={{ marginTop: 8 }}>
                  <label>Fecha nacimiento</label>
                  <input type="date" name="fecha_nacimiento" value={perfilForm.fecha_nacimiento} onChange={onChangePerfil} />
                </div>

                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditPerfil(false);
                      setPerfilForm({
                        telefono: perfil.telefono || "",
                        direccion: perfil.direccion || "",
                        fecha_nacimiento: fmtDate(perfil.fecha_nacimiento),
                      });
                    }}
                  >
                    Cancelar
                  </button>{" "}
                  <button type="submit">Guardar</button>
                </div>
              </form>
            )}
          </div>
        )}

        {!loading && tab === "cuenta" && cuenta && (
          <div>
            <h3>Cuenta de usuario</h3>

            {!editCuenta ? (
              <div>
                <p><strong>Email (login):</strong> {cuenta.email}</p>
                <p><strong>Phone:</strong> {cuenta.phone || "—"}</p>
                <p><strong>MFA:</strong> {cuenta.mfa_habilitado ? "Sí" : "No"}</p>

                <button onClick={() => setEditCuenta(true)}>Editar</button>
              </div>
            ) : (
              <form onSubmit={guardarCuenta}>
                <div>
                  <label>Email *</label>
                  <input name="email" value={cuentaForm.email} onChange={onChangeCuenta} />
                </div>

                <div style={{ marginTop: 8 }}>
                  <label>Phone</label>
                  <input name="phone" value={cuentaForm.phone} onChange={onChangeCuenta} />
                </div>

                <hr style={{ marginTop: 12 }} />
                <h4>Cambiar contraseña (opcional)</h4>
                <small>Debes ingresar la contraseña actual y repetir la nueva.</small>

                <div style={{ marginTop: 8 }}>
                  <label>Contraseña actual</label>
                  <input type="password" name="password_actual" value={cuentaForm.password_actual} onChange={onChangeCuenta} />
                </div>

                <div style={{ marginTop: 8 }}>
                  <label>Nueva contraseña</label>
                  <input type="password" name="password_nueva" value={cuentaForm.password_nueva} onChange={onChangeCuenta} />
                </div>

                <div style={{ marginTop: 8 }}>
                  <label>Repetir nueva contraseña</label>
                  <input
                    type="password"
                    name="password_nueva_repetir"
                    value={cuentaForm.password_nueva_repetir}
                    onChange={onChangeCuenta}
                  />
                </div>

                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditCuenta(false);
                      setCuentaForm((p) => ({
                        ...p,
                        email: cuenta.email || "",
                        phone: cuenta.phone || "",
                        password_actual: "",
                        password_nueva: "",
                        password_nueva_repetir: "",
                      }));
                    }}
                  >
                    Cancelar
                  </button>{" "}
                  <button type="submit">Guardar</button>
                </div>
              </form>
            )}
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <Link to="/empleado/inicio">Volver</Link>
        </div>
      </main>
    </div>
  );
}
