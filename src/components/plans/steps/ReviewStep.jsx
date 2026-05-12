import { PLAN_TYPE_INFO } from "../PlanTypeCard";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

function Field({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h4 className="font-serif text-base font-semibold text-foreground border-b pb-2">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

const WAITING_LABELS = {
  none: "No waiting period",
  first_of_month: "First of month following hire",
  "30_days": "30 days",
  "60_days": "60 days",
  "90_days": "90 days",
  first_of_month_30: "First of month after 30 days",
  first_of_month_60: "First of month after 60 days",
  first_of_month_90: "First of month after 90 days",
};

const ENTRY_LABELS = {
  immediate: "Immediately upon eligibility",
  first_of_month: "First of next month",
  quarterly: "Quarterly",
  semi_annual: "Semi-annually",
  annual: "Annually",
};

function formatDate(d) {
  if (!d) return "";
  return format(new Date(d + "T00:00:00"), "MMMM d, yyyy");
}

export default function ReviewStep({ data }) {
  const planType = data.plan_type;
  const showFSA = ["health_fsa", "full_flex", "simple_cafeteria"].includes(planType);
  const showLimitedFSA = planType === "limited_fsa";
  const showDCAP = ["dcap", "full_flex", "simple_cafeteria"].includes(planType);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-serif text-xl font-semibold">Review Your Plan</h3>
        <p className="text-sm text-muted-foreground mt-1">Please review all details before saving.</p>
      </div>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
        <Badge className="bg-primary text-primary-foreground px-3">
          {PLAN_TYPE_INFO[planType]?.title || planType}
        </Badge>
        <span className="text-sm font-medium">{data.plan_name}</span>
      </div>

      <Section title="Employer Information">
        <Field label="Legal Name" value={data.employer_name} />
        <Field label="EIN" value={data.employer_ein} />
        <Field label="Phone" value={data.employer_phone} />
        <Field
          label="Address"
          value={[data.employer_address, data.employer_city, data.employer_state, data.employer_zip]
            .filter(Boolean)
            .join(", ")}
        />
      </Section>

      <Section title="Plan Details">
        <Field label="Plan Number" value={data.plan_number} />
        <Field label="Effective Date" value={formatDate(data.effective_date)} />
        <Field label="Plan Year" value={`${formatDate(data.plan_year_start)} — ${formatDate(data.plan_year_end)}`} />
        <Field label="Administrator" value={data.plan_administrator_name} />
        <Field label="Admin Title" value={data.plan_administrator_title} />
        <Field label="Admin Contact" value={data.plan_administrator_email || data.plan_administrator_phone} />
      </Section>

      <Section title="Eligibility">
        <Field label="Eligible Class" value={data.eligibility_class} />
        <Field label="Waiting Period" value={WAITING_LABELS[data.waiting_period]} />
        <Field label="Hours Required" value={data.hours_required ? `${data.hours_required} hours/week` : null} />
        <Field label="Entry Dates" value={ENTRY_LABELS[data.entry_dates]} />
        {data.total_employees && <Field label="Total Employees" value={data.total_employees} />}
      </Section>

      {(data.benefits_offered?.length > 0 || showFSA || showLimitedFSA || showDCAP) && (
        <div className="space-y-3">
          <h4 className="font-serif text-base font-semibold text-foreground border-b pb-2">Benefits</h4>
          {data.benefits_offered?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Pre-Tax Premiums</p>
              <div className="flex flex-wrap gap-1.5">
                {data.benefits_offered.map((b) => (
                  <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>
                ))}
              </div>
            </div>
          )}
          {showFSA && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <Field label="FSA Max Election" value={data.fsa_max_election ? `$${data.fsa_max_election.toLocaleString()}` : null} />
              <Field label="FSA Min Election" value={data.fsa_min_election ? `$${data.fsa_min_election.toLocaleString()}` : null} />
              <Field label="Grace Period" value={data.fsa_grace_period ? "Yes (2.5 months)" : "No"} />
              <Field label="Carryover" value={data.fsa_carryover ? `Yes (up to $${data.fsa_carryover_amount?.toLocaleString() || "—"})` : "No"} />
            </div>
          )}
          {showLimitedFSA && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <Field label="Limited FSA Max Election" value={data.limited_fsa_max_election ? `$${data.limited_fsa_max_election.toLocaleString()}` : null} />
              <Field label="Limited FSA Min Election" value={data.limited_fsa_min_election ? `$${data.limited_fsa_min_election.toLocaleString()}` : null} />
              <Field label="Grace Period" value={data.limited_fsa_grace_period ? "Yes (2.5 months)" : "No"} />
              <Field label="Carryover" value={data.limited_fsa_carryover ? `Yes (up to $${data.limited_fsa_carryover_amount?.toLocaleString() || "—"})` : "No"} />
              <Field label="Covers" value="Dental & vision only (HSA-compatible)" />
            </div>
          )}
          {showDCAP && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <Field label="DCAP Max Election" value={data.dcap_max_election ? `$${data.dcap_max_election.toLocaleString()}` : null} />
              <Field label="DCAP Min Election" value={data.dcap_min_election ? `$${data.dcap_min_election.toLocaleString()}` : null} />
            </div>
          )}
        </div>
      )}

      {data.election_change_events?.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-serif text-base font-semibold text-foreground border-b pb-2">Qualifying Life Events</h4>
          <div className="flex flex-wrap gap-1.5">
            {data.election_change_events.map((e) => (
              <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
            ))}
          </div>
        </div>
      )}

      <Section title="Claims Administration">
        <Field label="Claims Administrator" value={data.claims_administrator} />
        <Field label="Filing Deadline" value={data.claims_filing_deadline} />
        <Field label="Employer Contribution" value={data.employer_contribution ? data.employer_contribution_amount || "Yes" : "None"} />
      </Section>
    </div>
  );
}