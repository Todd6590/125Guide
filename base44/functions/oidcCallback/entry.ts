import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const OIDC_CLIENT_ID = "906a1aa1-4178-486d-b624-fe2e7c61bf24";
const OIDC_ISSUER = "https://brokertoolbox.net";
const OIDC_REDIRECT_URI = "https://planform125.brokertoolbox.net/auth/callback";
const VALID_PLANS = ["master", "planform125_monthly", "planform125_single"];

Deno.serve(async (req) => {
  try {
    const { code, code_verifier } = await req.json();

    if (!code || !code_verifier) {
      return Response.json({ error: "Missing code or code_verifier" }, { status: 400 });
    }

    const clientSecret = Deno.env.get("OIDC_CLIENT_SECRET");
    const clientId = Deno.env.get("OIDC_CLIENT_ID") || OIDC_CLIENT_ID;

    // Exchange code for tokens
    const tokenResponse = await fetch(`${OIDC_ISSUER}/api/oidc/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: OIDC_REDIRECT_URI,
        client_id: clientId,
        client_secret: clientSecret,
        code_verifier,
      }),
    });

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text();
      return Response.json({ error: "Token exchange failed", detail: err }, { status: 400 });
    }

    const tokens = await tokenResponse.json();
    const idToken = tokens.id_token;

    if (!idToken) {
      return Response.json({ error: "No id_token in response" }, { status: 400 });
    }

    // Decode JWT payload (no signature verification needed — came directly from provider)
    const parts = idToken.split(".");
    if (parts.length !== 3) {
      return Response.json({ error: "Invalid id_token format" }, { status: 400 });
    }

    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));

    const { email, name, plan, is_admin } = payload;

    if (!plan || !VALID_PLANS.includes(plan)) {
      return Response.json({
        error: "Access denied",
        reason: `Your subscription plan (${plan || "none"}) does not include access to PlanForm 125.`,
      }, { status: 403 });
    }

    // Return a session object to store client-side
    return Response.json({
      success: true,
      session: {
        email,
        name,
        plan,
        is_admin: !!is_admin,
        authenticated_at: Date.now(),
        expires_at: Date.now() + (8 * 60 * 60 * 1000), // 8 hours
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});