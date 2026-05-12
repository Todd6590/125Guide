import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShieldCheck, AlertTriangle, Info, XCircle, Loader2, RefreshCw, FileDown, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import ComplianceAlertCard from "@/components/compliance/ComplianceAlertCard";
import generateAmendmentPDF from "@/lib/generateAmendmentPDF";

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 };

export default function ComplianceReview() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("open");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [running, setRunning] = useState(false);
  const [dismissing, setDismissing] = useState(null);

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["compliance-alerts"],
    queryFn: () => base44.entities.ComplianceAlert.list("-check_date"),
  });

  const filtered = alerts
    .filter((a) => {
      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      const matchSeverity = severityFilter === "all" || a.severity === severityFilter;
      return matchStatus && matchSeverity;
    })
    .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3));

  const counts = {
    open: alerts.filter((a) => a.status === "open").length,
    critical: alerts.filter((a) => a.severity === "critical" && a.status === "open").length,
    warning: alerts.filter((a) => a.severity === "warning" && a.status === "open").length,
    resolved: alerts.filter((a) => a.status === "resolved").length,
  };

  const handleRunNow = async () => {
    setRunning(true);
    try {
      const res = await base44.functions.invoke("weeklyComplianceCheck", {});
      const data = res.data;
      queryClient.invalidateQueries({ queryKey: ["compliance-alerts"] });
      toast.success(`Check complete: ${data.alerts} alert(s) found across ${data.checked} plan(s).`);
    } catch (e) {
      toast.error("Compliance check failed: " + e.message);
    }
    setRunning(false);
  };

  const handleResolve = async (alert) => {
    await base44.entities.ComplianceAlert.update(alert.id, { status: "resolved" });
    queryClient.invalidateQueries({ queryKey: ["compliance-alerts"] });
    toast.success("Marked as resolved");
  };

  const handleDismissConfirm = async () => {
    await base44.entities.ComplianceAlert.update(dismissing.id, { status: "dismissed" });
    queryClient.invalidateQueries({ queryKey: ["compliance-alerts"] });
    toast.success("Alert dismissed");
    setDismissing(null);
  };

  const handleDownloadAll = () => {
    const openAlerts = alerts.filter((a) => a.status === "open" && a.amendment_text);
    if (openAlerts.length === 0) {
      toast.error("No open alerts with amendment text to export.");
      return;
    }
    generateAmendmentPDF(openAlerts);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">Compliance Review</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Weekly AI-powered IRS Section 125 compliance monitoring.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" className="gap-2" onClick={handleDownloadAll}>
            <FileDown className="w-4 h-4" /> Export Amendments PDF
          </Button>
          <Button className="gap-2" onClick={handleRunNow} disabled={running}>
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {running ? "Checking…" : "Run Check Now"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Open Alerts", value: counts.open, icon: AlertTriangle, color: "text-amber-600" },
          { label: "Critical", value: counts.critical, icon: XCircle, color: "text-red-600" },
          { label: "Warnings", value: counts.warning, icon: AlertTriangle, color: "text-amber-500" },
          { label: "Resolved", value: counts.resolved, icon: CheckCircle, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-card border rounded-xl p-4 shadow-sm flex items-center gap-3">
            <s.icon className={`w-7 h-7 ${s.color} opacity-80`} />
            <div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alert List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl bg-muted/20">
          <ShieldCheck className="w-10 h-10 text-green-500 mb-3" />
          <p className="font-medium text-muted-foreground">
            {statusFilter === "open" ? "No open compliance alerts — all clear!" : "No alerts match your filters."}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Run a check to scan your complete plans.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((alert) => (
            <ComplianceAlertCard
              key={alert.id}
              alert={alert}
              onResolve={handleResolve}
              onDismiss={setDismissing}
            />
          ))}
        </div>
      )}

      {/* Dismiss confirm */}
      <AlertDialog open={!!dismissing} onOpenChange={() => setDismissing(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dismiss this alert?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the alert as dismissed. You can still view it by filtering for dismissed alerts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDismissConfirm}>Dismiss</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}