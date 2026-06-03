const SESSION_KEY = "btb_sso_session";

export function getSSOSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (Date.now() > session.expires_at) {
      clearSSOSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function setSSOSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSSOSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function isSSOAuthenticated() {
  return getSSOSession() !== null;
}

const PKCE_KEY = "btb_pkce_verifier";

export function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function savePKCEVerifier(verifier) {
  sessionStorage.setItem(PKCE_KEY, verifier);
}

export function getPKCEVerifier() {
  return sessionStorage.getItem(PKCE_KEY);
}

export function clearPKCEVerifier() {
  sessionStorage.removeItem(PKCE_KEY);
}

export function buildOIDCAuthURL() {
  const state = Math.random().toString(36).substring(2);
  return { state };
}