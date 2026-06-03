import { useEffect, useState } from "react";
import { getSSOSession, clearSSOSession } from "@/lib/ssoSession";
import { Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Outlet } from "react-router-dom";

const PLAN_LABELS = {
  master: "Master",
  planform125_monthly: "PlanForm 125 Monthly",
  planform125_single: "PlanForm 125 Single",
};

export default function SSOGate() {
  const [session, setSession] = useState(undefined); // undefined = loading
  const navigate = useNavigate();

  useEffect(() => {
    const s = getSSOSession();
    setSession(s); // null = not authenticated, object = authenticated
  }, []);

  const handleLogout = () => {
    clearSSOSession();
    navigate("/sso-login");
  };

  // Still checking
  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated via SSO
  if (session === null) {
    navigate("/sso-login");
    return null;
  }

  // Authenticated — show content + a small session banner
  return (
    <div>
      <div className="bg-primary/5 border-b border-border px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Shield className="w-4 h-4 text-primary" />
          <span>Signed in as <strong className="text-foreground">{session.email}</strong></span>
          <Badge variant="secondary">{PLAN_LABELS[session.plan] || session.plan}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1 text-muted-foreground">
          <LogOut className="w-3 h-3" />
          Sign Out
        </Button>
      </div>
      <Outlet />
    </div>
  );
}