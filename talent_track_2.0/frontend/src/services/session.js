export function getStorage() {
  const hasLocal =
    localStorage.getItem("tt_access") || localStorage.getItem("tt_context");
  return hasLocal ? localStorage : sessionStorage;
}

export function getContext() {
  const storage = getStorage();
  const raw = storage.getItem("tt_context");
  return raw ? JSON.parse(raw) : null;
}

export function getFullName() {
  const storage = getStorage();
  return storage.getItem("tt_full_name");
}

export function clearSession() {
  localStorage.removeItem("tt_access");
  localStorage.removeItem("tt_refresh");
  localStorage.removeItem("tt_context");
  localStorage.removeItem("tt_full_name");

  sessionStorage.removeItem("tt_access");
  sessionStorage.removeItem("tt_refresh");
  sessionStorage.removeItem("tt_context");
  sessionStorage.removeItem("tt_full_name");
}
