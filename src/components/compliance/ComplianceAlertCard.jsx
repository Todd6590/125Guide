import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, CheckCircle, X, FileDown, AlertTriangle, XCircle, Info } from "lucide-react";
import { format } from "date-fns";
import generateAmendmentPDF from "@/lib/generateAmendmentPDF";

const SEVERITY_CONFIG = {
  critical: { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle, iconColor: "text-red-500", badge: "bg-red-100 text-red-700" },
  warning: { color: "bg-amber-50 text-amber-800 border-amber-200", icon: AlertTriangle, iconColor: "text-amber-500", badge: "bg-amber-100 text-amber-700" },
  info: { color: "bg-blue-50 text-blue-800 border-blue-100", icon: Info, iconColor: "text-blue-500", badge: "bg-blue-100 text-blue-700" },
};

const STATUS_BADGE = {
  open: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  dismissed: "bg-muted text-muted-foreground",
};

export default function ComplianceAlertCard({ alert, onResolve, onDismiss }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.warning;
  const Icon = cfg.icon;

  const handleDownload = () => {
    generateAmendmentPDF([alert]);
  };

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden ${cfg.color}`}>
      {/* Header Row */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${cfg.iconColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <Badge className={`text-xs ${cfg.badge}`}>{alert.severity?.toUpperCase()}</Badge>
            {alert.category && (
              <Badge variant="outline" className="text-xs">{alert.category}</Badge>
            )}
            <Badge className={`text-xs ${STATUS_BADGE[alert.status] || ""}`}>{alert.status}</Badge>
          </div>
          <p className="font-medium text-sm">{alert.issue}</p>
          <p className="text-xs opacity-70 mt-0.5">
            {alert.plan_name} {alert.employer_name ? `— ${alert.employer_name}` : ""}
            {alert.check_date ? ` · Checked ${format(new Date(alert.check_date), "MMM d, yyyy")}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {alert.status === "open" && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs gap-1 h-7"
                onClick={(e) => { e.stopPropagation(); onResolve(alert); }}
              >
                <CheckCircle className="w-3.5 h-3.5" /> Resolve
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs gap-1 h-7"
                onClick={(e) => { e.stopPropagation(); onDismiss(alert); }}
              >
                <X className="w-3.5 h-3.5" /> Dismiss
              </Button>
            </>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 opacity-60" /> : <ChevronDown className="w-4 h-4 opacity-60" />}
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t px-4 pb-4 pt-3 space-y-3 bg-white/60">
          {alert.detail && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-1">Issue Detail</p>
              <p className="text-sm">{alert.detail}</p>
            </div>
          )}
          {alert.recommendation && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-1">Recommendation</p>
              <p className="text-sm">{alert.recommendation}</p>
            </div>
          )}
          {alert.amendment_text && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-60">Draft Amendment Language</p>
                <Button size="sm" variant="outline" className="text-xs gap-1 h-7" onClick={handleDownload}>
                  <FileDown className="w-3.5 h-3.5" /> Download PDF
                </Button>
              </div>
              <div className="bg-white border rounded-lg p-3 text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                {alert.amendment_text}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}