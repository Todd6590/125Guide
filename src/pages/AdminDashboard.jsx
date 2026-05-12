import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw, CheckCircle2, AlertTriangle, Info,
  Calendar, DollarSign, Loader2, ChevronDown, ChevronUp, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

function RuleCard({ rule, isActive }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border bg-card shadow-sm overflow-hidden ${isActive ? "border-primary/50 ring-1 ring-primary/20" : "border-border"}`}>
      <div className="flex items-center justify-between px-5 py-4 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Tax Year {rule.fiscal_year}</p>
            <p className="text-xs text-muted-foreground">
              Last fetched: {rule.last_fetched ? format(new Date(rule.last_fetched), "MMM d, yyyy") : "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isActive && <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>}
          <button
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            onClick={() => setExpanded(v => !v)}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Threshold grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-border">
        {[
          { label: "Health FSA Max", value: rule.fsa_max_election, prefix: "$" },
          { label: "FSA Carryover Max", value: rule.fsa_carryover_max, prefix: "$" },
          { label: "DCAP Max", value: rule.dcap_max_election, prefix: "$" },
          { label: "DCAP (MFS)", value: rule.dcap_max_mfs, prefix: "$" },
          { label: "HSA Self-Only", value: rule.hsa_self_only, prefix: "$" },
          { label: "HSA Family", value: rule.hsa_family, prefix: "$" },
          { label: "Simple Café. EE Limit", value: rule.simple_cafeteria_max_employees, suffix: " employees" },
          { label: "Grace Period Max", value: rule.grace_period_max_days, suffix: " days" },
        ].map(({ label, value, prefix = "", suffix = "" }) => (
          <div key={label} className="bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
            <p className="font-semibold text-foreground text-sm">
              {value != null ? `${prefix}${Number(value).toLocaleString()}${suffix}` : <span className="text-muted-foreground">—</span>}
            </p>
          </div>
        ))}
      </div>

      {expanded && (
        <div className="px-5 py-4 space-y-4 border-t">
          {rule.irs_notice_references?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">IRS References</p>
              <div className="flex flex-wrap gap-2">
                {rule.irs_notice_references.map((ref, i) => (
                  <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs border border-blue-100">{ref}</span>
                ))}
              </div>
            </div>
          )}
          {rule.source_summary && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Research Summary</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{rule.source_summary}</p>
            </div>
          )}
          {rule.full_rules_text && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Full Rules Text (used in compliance checks)</p>
              <pre className="text-xs text-foreground bg-muted/40 rounded-lg p-4 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                {rule.full_rules_text}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [fetching, setFetching] = useState(false);
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["irs-rules"],
    queryFn: () => base44.entities.IrsRules.list("-fiscal_year"),
  });

  const activeRule = rules.find(r => r.is_active);

  const handleFetchUpdates = async () => {
    setFetching(true);
    try {
      const res = await base44.functions.invoke("fetchIrsUpdates", {});
      if (res.data?.error) throw new Error(res.data.error);
      queryClient.invalidateQueries({ queryKey: ["irs-rules"] });
      toast.success(`IRS rules for ${res.data.fiscal_year} updated successfully`);
    } catch (e) {
      toast.error("Failed to fetch IRS updates: " + e.message);
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Admin</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">IRS Rules Dashboard</h1>
          <p className="text-muted-foreground mt-1 max-w-xl">
            Manage live IRS Section 125 compliance thresholds. The system fetches the latest limits from the web and automatically updates the AI compliance checker.
          </p>
        </div>
        <Button
          onClick={handleFetchUpdates}
          disabled={fetching}
          size="lg"
          className="gap-2 shadow-sm"
        >
          {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {fetching ? "Fetching IRS Updates…" : "Fetch Latest IRS Updates"}
        </Button>
      </div>

      {/* Status banner */}
      {activeRule && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800">
          <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-green-600" />
          <div>
            <p className="font-semibold text-sm">Compliance checks are up to date</p>
            <p className="text-sm text-green-700 mt-0.5">
              Currently enforcing <strong>Tax Year {activeRule.fiscal_year}</strong> rules. 
              Last refreshed {activeRule.last_fetched ? format(new Date(activeRule.last_fetched), "MMMM d, yyyy") : "—"}.
              Auto-refreshes every Monday.
            </p>
          </div>
        </div>
      )}

      {!activeRule && !isLoading && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
          <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">No active ruleset found</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Click "Fetch Latest IRS Updates" to pull the current year's thresholds from the web and activate them.
            </p>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: RefreshCw,
            title: "Auto-Refreshes Weekly",
            desc: "Every Monday the system queries the web for the latest IRS notices and Revenue Procedures to update limits.",
            color: "text-blue-600 bg-blue-50",
          },
          {
            icon: DollarSign,
            title: "Live Thresholds",
            desc: "FSA, DCAP, HSA, carryover, and grace period limits are stored in the database and injected into every compliance check.",
            color: "text-green-600 bg-green-50",
          },
          {
            icon: Info,
            title: "Full Audit Trail",
            desc: "All fetched rulesets are stored with their source references so you can trace back exactly what rules a check was run against.",
            color: "text-purple-600 bg-purple-50",
          },
        ].map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="flex gap-3 p-4 rounded-xl border bg-card shadow-sm">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rules list */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-xl font-semibold text-foreground">Ruleset History</h2>
          <div className="flex-1 border-t border-border" />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/20 text-center">
            <ShieldCheck className="w-8 h-8 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No rulesets yet</p>
            <p className="text-xs text-muted-foreground mt-1">Click "Fetch Latest IRS Updates" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rules.map(rule => (
              <RuleCard key={rule.id} rule={rule} isActive={rule.is_active} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}