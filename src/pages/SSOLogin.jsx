import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, FileText, CreditCard, CheckCircle, Loader2 } from "lucide-react";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  savePKCEVerifier,
  isSSOAuthenticated,
  setSSOSession,
} from "@/lib/ssoSession";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const OIDC_CLIENT_ID = "906a1aa1-4178-486d-b624-fe2e7c61bf24";
const OIDC_ISSUER = "https://brokertoolbox.net";
const OIDC_REDIRECT_URI = "https://planform125.brokertoolbox.net/auth/callback";

export default function SSOLogin() {
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'verifying' | 'success' | 'cancelled' | null
  const navigate = useNavigate();

  useEffect(() => {
    if (isSSOAuthenticated()) {
      navigate("/");
      return;
    }

    // Check if returning from Stripe
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const sessionId = params.get("session_id");

    if (payment === "success" && sessionId) {
      setPaymentStatus("verifying");
      verifyPayment(sessionId);
    } else if (payment === "cancelled") {
      setPaymentStatus("cancelled");
    }
  }, []);

  const verifyPayment = async (sessionId) => {
    const res = await base44.functions.invoke("stripeVerify", { session_id: sessionId });
    if (res.data?.success && res.data?.session) {
      setSSOSession(res.data.session);
      setPaymentStatus("success");
      setTimeout(() => navigate("/"), 1500);
    } else {
      setPaymentStatus("error");
    }
  };

  const handleBuyNow = async () => {
    setPaymentLoading(true);
    const res = await base44.functions.invoke("stripeCheckout", {});
    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      setPaymentLoading(false);
    }
  };

  const handleSSOLogin = async () => {
    setLoading(true);
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    savePKCEVerifier(verifier);

    const state = Math.random().toString(36).substring(2);
    const params = new URLSearchParams({
      client_id: OIDC_CLIENT_ID,
      redirect_uri: OIDC_REDIRECT_URI,
      response_type: "code",
      scope: "openid profile email",
      state,
      code_challenge: challenge,
      code_challenge_method: "S256",
    });

    window.location.href = `${OIDC_ISSUER}/api/oidc/authorize?${params}`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <FileText className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground font-serif">PlanForm 125</h1>
          <p className="text-muted-foreground mt-1">Section 125 Plan Document Creator</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Sign In</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Access PlanForm 125 using your BrokerToolbox.net subscription.
            </p>
          </div>

          <Button
            onClick={handleSSOLogin}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
            {loading ? "Redirecting..." : "Login with BrokerToolbox"}
            {!loading && <ArrowRight className="w-4 h-4 ml-auto" />}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => window.location.href = "/"}
          >
            Sign in as Admin
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            A valid <strong>BrokerToolbox Master</strong>, <strong>PlanForm 125 Monthly</strong>, or{" "}
            <strong>Single</strong> subscription is required for access.
          </p>
        </div>

        {/* Buy Single Plan */}
        <div className="mt-4 bg-card border border-border rounded-xl shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">No subscription? Buy a single plan</h2>
            <p className="text-sm text-muted-foreground mt-1">
              One-time purchase — create and download one Section 125 plan document.
            </p>
          </div>

          {paymentStatus === "verifying" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying your payment...
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
              <CheckCircle className="w-4 h-4" />
              Payment confirmed! Signing you in...
            </div>
          )}

          {paymentStatus === "cancelled" && (
            <p className="text-sm text-destructive">Payment was cancelled. You can try again below.</p>
          )}

          {paymentStatus === "error" && (
            <p className="text-sm text-destructive">Could not verify your payment. Please contact support.</p>
          )}

          {!["verifying", "success"].includes(paymentStatus) && (
            <Button
              onClick={handleBuyNow}
              disabled={paymentLoading}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {paymentLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              {paymentLoading ? "Redirecting to checkout..." : "Buy Now — $19.99"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}