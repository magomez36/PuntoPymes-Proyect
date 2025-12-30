export function getStorage() {
  const hasLocal =
    localStorage.getItem("tt_access") || localStorage.getItem("tt_context");
  return hasLocal ? localStorage : sessionStorage;
}

export function getAccessToken() {
  return getStorage().getItem("tt_access");
}
