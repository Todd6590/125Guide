import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { setSSOSession, getPKCEVerifier, clearPKCEVerifier } from "@/lib/ssoSession";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const errorParam = params.get("error");

    if (errorParam) {
      setError(`Authentication error: ${errorParam}`);
      return;
    }

    if (!code) {
      setError("No authorization code received.");
      return;
    }

    const code_verifier = getPKCEVerifier();
    if (!code_verifier) {
      setError("Session expired. Please try logging in again.");
      return;
    }

    clearPKCEVerifier();

    const response = await base44.functions.invoke("oidcCallback", { code, code_verifier });

    if (response.data?.error) {
      setError(response.data.reason || response.data.error);
      return;
    }

    if (response.data?.success && response.data?.session) {
      setSSOSession(response.data.session);
      navigate("/");
    } else {
      setError("Unexpected response from authentication server.");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Access Denied</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={() => navigate("/sso-login")} className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Verifying your subscription...</p>
      </div>
    </div>
  );
}