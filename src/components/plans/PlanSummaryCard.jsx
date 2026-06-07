import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLAN_TYPE_INFO } from "./PlanTypeCard";
import { format } from "date-fns";

function formatDate(d) {
  if (!d) return null;
  return format(new Date(d + "T00:00:00"), "MMMM d, yyyy");
}

export default function PlanSummaryCard({ plan }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const typeInfo = PLAN_TYPE_INFO[plan.plan_type] || {};

  const generateSummary = async () => {
    setLoading(true);
    setError(null);
    const prompt = `You are a benefits compliance expert. Provide a concise, plain-English executive summary of this Section 125 cafeteria plan for an HR or benefits administrator. Focus on the most important details an employer needs to know.

Plan Details:
- Plan Name: ${plan.plan_name}
- Plan Type: ${typeInfo.title || plan.plan_type}
- Employer: ${plan.employer_name}
- Plan Year: ${formatDate(plan.plan_year_start) || "Not set"} to ${formatDate(plan.plan_year_end) || "Not set"}
- Effective Date: ${formatDate(plan.effective_date) || "Not set"}
- Eligible Employees: ${plan.eligibility_class || "All common-law employees"}
- Waiting Period: ${plan.waiting_period || "Not specified"}
- Benefits Offered: ${plan.benefits_offered?.join(", ") || "Not specified"}
- Health FSA Max: ${plan.fsa_max_election ? `$${plan.fsa_max_election.toLocaleString()}` : "N/A"}
- FSA Grace Period: ${plan.fsa_grace_period ? "Yes" : "No"}, FSA Carryover: ${plan.fsa_carryover ? `Yes ($${plan.fsa_carryover_amount || "?"}` + ")" : "No"}
- DCAP Max: ${plan.dcap_max_election ? `$${plan.dcap_max_election.toLocaleString()}` : "N/A"}
- Employer Contribution: ${plan.employer_contribution ? plan.employer_contribution_amount || "Yes" : "No"}
- Claims Administrator: ${plan.claims_administrator || "Plan Administrator"}
- Claims Filing Deadline: ${plan.claims_filing_deadline || "90 days"}
- Plan Administrator: ${plan.plan_administrator_name || "Not set"}
- Status: ${plan.status}

Respond with a JSON object with these keys:
- headline: one sentence (max 20 words) capturing the essence of this plan
- highlights: array of 4-6 bullet strings (plain text, no markdown), each a key fact or action item
- risks: array of 0-3 strings flagging any missing fields or potential compliance concerns (empty array if none)
- readiness: "complete" | "needs_review" | "incomplete" based on how filled-out the plan appears`;

    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          headline: { type: "string" },
          highlights: { type: "array", items: { type: "string" } },
          risks: { type: "array", items: { type: "string" } },
          readiness: { type: "string" },
        },
      },
    });
    setSummary(res);
    setLoading(false);
  };

  useEffect(() => {
    generateSummary();
  }, [plan.id]);

  const readinessColor = {
    complete: "bg-green-100 text-green-800",
    needs_review: "bg-yellow-100 text-yellow-800",
    incomplete: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      {/* Plan meta header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-xl font-semibold">{plan.plan_name}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{typeInfo.title || plan.plan_type} · {plan.employer_name}</p>
        </div>
        <div className="flex items-center gap-2">
          {summary && (
            <Badge className={readinessColor[summary.readiness] || "bg-secondary text-secondary-foreground"}>
              {summary.readiness === "complete" ? "Complete" : summary.readiness === "needs_review" ? "Needs Review" : "Incomplete"}
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={generateSummary} disabled={loading} className="gap-1 text-muted-foreground">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading && !summary && (
        <div className="flex items-center gap-3 py-10 justify-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Generating AI summary…</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm p-4 bg-destructive/10 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {summary && (
        <div className="space-y-5">
          {/* Headline */}
          <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium text-foreground">{summary.headline}</p>
          </div>

          {/* Key Highlights */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Key Highlights</h3>
            <ul className="space-y-2">
              {summary.highlights?.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </div>

          {/* Risks / Concerns */}
          {summary.risks?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Potential Issues</h3>
              <ul className="space-y-2">
                {summary.risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-yellow-800 bg-yellow-50 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}