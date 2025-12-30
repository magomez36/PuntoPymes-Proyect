// src/services/api.js
const API_BASE = "http://127.0.0.1:8000";

// --- Helpers de storage (local o session) ---
function getStorage() {
  // Si existe en localStorage, usamos localStorage, sino sessionStorage
  return localStorage.getItem("tt_access") ? localStorage : sessionStorage;
}

function getTokens() {
  const storage = getStorage();
  return {
    access: storage.getItem("tt_access"),
    refresh: storage.getItem("tt_refresh"),
  };
}

function setAccessToken(newAccess) {
  const storage = getStorage();
  storage.setItem("tt_access", newAccess);
}

async function refreshAccessToken() {
  const { refresh } = getTokens();
  if (!refresh) return null;

  const res = await fetch(`${API_BASE}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) return null;

  const data = await res.json(); // { access: "..." }
  if (data?.access) {
    setAccessToken(data.access);
    return data.access;
  }
  return null;
}

/**
 * apiFetch:
 * - agrega Authorization automáticamente
 * - si recibe 401, intenta refresh una vez y reintenta
 */
export async function apiFetch(pathOrUrl, options = {}) {
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${API_BASE}${pathOrUrl}`;

  const { access } = getTokens();

  const headers = {
    ...(options.headers || {}),
    "Content-Type": options.body ? "application/json" : (options.headers || {})["Content-Type"],
  };

  if (access) headers.Authorization = `Bearer ${access}`;

  // 1er intento
  let res = await fetch(url, { ...options, headers });

  // Si expira access → 401 → refresh + retry (1 vez)
  if (res.status === 401) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      const retryHeaders = { ...headers, Authorization: `Bearer ${newAccess}` };
      res = await fetch(url, { ...options, headers: retryHeaders });
    }
  }

  return res;
}

export { API_BASE };
