import * as api from "./mcp-auth-api.js";

const login = document.querySelector("#login");
const panel = document.querySelector("#access");
const status = document.querySelector("#status");
const account = document.querySelector("#account");
const id = new URLSearchParams(location.search).get("authorization_id");
const connectionsPage = document.body.dataset.page === "connections";
let user;
let details;

function message(value) { status.textContent = value; }
async function busy(action) {
  const buttons = [...document.querySelectorAll("button")];
  buttons.forEach(button => { button.disabled = true; });
  message("");
  try { await action(); }
  catch (error) { message(error.message || "Something went wrong. Please try again."); }
  finally { buttons.forEach(button => { button.disabled = false; }); }
}

async function showAccess() {
  login.hidden = true;
  account.textContent = `Signed in as ${user.email ?? "your BudgetGo account"}`;
  document.querySelector("#sign-out").hidden = false;
  if (connectionsPage) { panel.hidden = false; await showConnections(); return; }
  if (!id || !/^[A-Za-z0-9_-]{1,200}$/.test(id)) throw new Error("Open this page through the Connect BudgetGo flow in your AI app.");
  details = await api.authorizationDetails(id);
  if (details.redirect_url) { location.assign(api.safeRedirect(details.redirect_url)); return; }
  if (!details.client?.id || !details.client?.name || details.user?.id !== user.id || details.authorization_id !== id) throw new Error("This authorization request is invalid. Please reconnect BudgetGo.");
  api.safeRedirect(details.redirect_uri);
  document.querySelector("#client-name").textContent = details.client.name;
  document.querySelector("#client-callback").textContent = new URL(details.redirect_uri).origin;
  const identityNames = { openid: "Account identity", email: "Email address", profile: "Profile information", phone: "Phone number" };
  document.querySelector("#identity-scopes").textContent = details.scope?.split(/\s+/).filter(Boolean).map(scope => identityNames[scope] ?? "Additional account information").join(", ") || "No additional profile information requested.";
  panel.hidden = false;
}

async function showConnections() {
  const list = document.querySelector("#connections");
  list.replaceChildren();
  const grants = await api.listGrants();
  if (!grants.length) { message("You have no connected AI apps."); return; }
  for (const grant of grants) {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = grant.client_name;
    const permissions = document.createElement("p");
    permissions.textContent = grant.revoked_at ? "Access revoked" : `Read access${grant.can_write ? ", create and edit" : ""}${grant.can_delete ? ", delete" : ""}`;
    const revoke = document.createElement("button");
    revoke.type = "button";
    revoke.textContent = grant.revoked_at ? "Finish disconnecting" : "Disconnect";
    revoke.addEventListener("click", () => busy(async () => { await api.revokeGrant(grant.client_id); await showConnections(); message("App disconnected. To reconnect, start a new connection in your AI app."); }));
    item.append(title, permissions, revoke);
    list.append(item);
  }
}

login.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(login);
  busy(async () => {
    user = await api.signIn(String(data.get("email")), String(data.get("password")));
    login.reset();
    await showAccess();
  });
});

document.querySelector("#send-code").addEventListener("click", () => busy(async () => {
  const email = login.querySelector("[name=email]");
  if (!email.reportValidity()) return;
  await api.sendSignInCode(email.value);
  document.querySelector("#code-sign-in").hidden = false;
  message("Check your email for a sign-in code.");
}));

document.querySelector("#verify-code").addEventListener("click", () => busy(async () => {
  const email = login.querySelector("[name=email]");
  const code = document.querySelector("#code");
  if (!email.reportValidity() || !code.value.trim() || !code.reportValidity()) return;
  user = await api.verifySignInCode(email.value, code.value.trim());
  login.reset(); code.value = "";
  await showAccess();
}));

document.querySelector("#sign-out").addEventListener("click", () => {
  api.clearSession(); user = null; details = null; panel.hidden = true; login.hidden = false; account.textContent = "";
  document.querySelector("#sign-out").hidden = true;
  message("Signed out of this page.");
});

document.querySelector("#approve")?.addEventListener("click", () => busy(async () => {
  if (!details || !user) throw new Error("Please sign in again.");
  await api.saveGrant(user.id, details.client, { write: document.querySelector("#allow-write").checked, delete: document.querySelector("#allow-delete").checked });
  const result = await api.consent(id, "approve");
  location.assign(api.safeRedirect(result.redirect_url, details.redirect_uri));
}));

document.querySelector("#deny")?.addEventListener("click", () => busy(async () => {
  if (!details || !user) throw new Error("Please sign in again.");
  const result = await api.consent(id, "deny");
  location.assign(api.safeRedirect(result.redirect_url, details.redirect_uri));
}));

busy(async () => {
  user = await api.currentUser();
  if (user) await showAccess();
});
