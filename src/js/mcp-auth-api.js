import { mcpConfig } from "./mcp-config.js";

const storageKey = "budgetgo-mcp-consent-session";
let session;

function configuration() {
  if (!mcpConfig.supabaseUrl || !mcpConfig.supabasePublishableKey) throw new Error("Sign-in is temporarily unavailable. Please try again later.");
  const url = new URL(mcpConfig.supabaseUrl);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) throw new Error("Sign-in is temporarily unavailable. Please try again later.");
  if (!mcpConfig.supabasePublishableKey || url.username || url.password || url.search || url.hash) throw new Error("Sign-in is temporarily unavailable. Please try again later.");
  return url.origin;
}

async function request(path, { method = "GET", body, token = session?.access_token, headers = {} } = {}) {
  const response = await fetch(`${configuration()}${path}`, {
    method, redirect: "error", cache: "no-store", credentials: "omit",
    headers: { apikey: mcpConfig.supabasePublishableKey, "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    if (response.status === 401) clearSession();
    throw new Error(response.status === 401 ? "Please sign in again." : "The request could not be completed. Please try again.");
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function saveSession(value) {
  session = { access_token: value.access_token, refresh_token: value.refresh_token, expires_at: value.expires_at ?? Math.floor(Date.now() / 1000) + value.expires_in };
  sessionStorage.setItem(storageKey, JSON.stringify(session));
}

export function clearSession() { session = undefined; sessionStorage.removeItem(storageKey); }

/** Restores a tab-local session and verifies its user before displaying consent. */
export async function currentUser() {
  configuration();
  try { session = JSON.parse(sessionStorage.getItem(storageKey) ?? "null") ?? undefined; }
  catch { clearSession(); }
  if (!session?.access_token) return null;
  try {
    if (session.expires_at <= Date.now() / 1000 + 60) saveSession(await request("/auth/v1/token?grant_type=refresh_token", { method: "POST", token: null, body: { refresh_token: session.refresh_token } }));
    return await request("/auth/v1/user");
  } catch { clearSession(); return null; }
}

export async function signIn(email, password) {
  const value = await request("/auth/v1/token?grant_type=password", { method: "POST", token: null, body: { email, password } });
  saveSession(value);
  return request("/auth/v1/user");
}

export async function sendSignInCode(email) {
  await request("/auth/v1/otp", { method: "POST", token: null, body: { email, create_user: false } });
}

export async function verifySignInCode(email, code) {
  const value = await request("/auth/v1/verify", { method: "POST", token: null, body: { email, token: code, type: "email" } });
  saveSession(value);
  return request("/auth/v1/user");
}

export function authorizationDetails(id) {
  return request(`/auth/v1/oauth/authorizations/${encodeURIComponent(id)}`);
}

export function consent(id, action) {
  return request(`/auth/v1/oauth/authorizations/${encodeURIComponent(id)}/consent`, { method: "POST", body: { action } });
}

export function saveGrant(userId, client, permissions) {
  return request("/rest/v1/McpGrant?on_conflict=user_id,client_id", {
    method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: { user_id: userId, client_id: client.id, client_name: client.name, can_read: true, can_write: permissions.write, can_delete: permissions.delete, revoked_at: null, updated_at: new Date().toISOString() },
  });
}

export function listGrants() {
  return request("/rest/v1/McpGrant?select=client_id,client_name,can_write,can_delete,revoked_at&order=updated_at.desc");
}

/** Revokes live database permission first, then invalidates the client's OAuth grant. */
export async function revokeGrant(clientId) {
  await request(`/rest/v1/McpGrant?client_id=eq.${encodeURIComponent(clientId)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: { revoked_at: new Date().toISOString(), updated_at: new Date().toISOString() } });
  try { await request(`/auth/v1/user/oauth/grants?client_id=${encodeURIComponent(clientId)}`, { method: "DELETE" }); }
  catch { throw new Error("BudgetGo access is blocked. Reload this page and use Finish disconnecting to complete OAuth revocation."); }
}

/** Accepts only an issuer-returned OAuth callback, never a return URL supplied in the page query. */
export function safeRedirect(value, expected) {
  const url = new URL(value);
  const local = url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if ((url.protocol !== "https:" && !local) || url.username || url.password) throw new Error("Unsupported client callback.");
  if (expected) {
    const registered = new URL(expected);
    if (url.origin !== registered.origin || url.pathname !== registered.pathname) throw new Error("Client callback does not match the authorization request.");
  }
  return url.href;
}
