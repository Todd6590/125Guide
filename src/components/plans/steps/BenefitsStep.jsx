import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

const POP_BENEFITS = [
  "Group medical insurance",
  "Group dental insurance",
  "Group vision insurance",
  "Group term life insurance (up to $50,000)",
  "Health Savings Account (HSA) contributions",
  "Disability insurance",
  "Accident insurance",
  "Cancer/Critical illness insurance",
  "Hospital indemnity insurance",
];

const FSA_SECTION = ({ data, onChange }) => {
  const update = (field, value) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-4 p-5 rounded-xl bg-muted/40 border">
      <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Health FSA Options</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Maximum Annual Election</Label>
          <Input
            type="number"
            placeholder="3,300"
            value={data.fsa_max_election || ""}
            onChange={(e) => update("fsa_max_election", e.target.value ? Number(e.target.value) : "")}
          />
          <p className="text-xs text-muted-foreground">2025 IRS limit: $3,300</p>
        </div>
        <div className="space-y-2">
          <Label>Minimum Annual Election</Label>
          <Input
            type="number"
            placeholder="100"
            value={data.fsa_min_election || ""}
            onChange={(e) => update("fsa_min_election", e.target.value ? Number(e.target.value) : "")}
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-card border">
        <div>
          <p className="text-sm font-medium">Grace Period (2.5 months)</p>
          <p className="text-xs text-muted-foreground">Allow additional time to incur FSA expenses</p>
        </div>
        <Switch
          checked={data.fsa_grace_period || false}
          onCheckedChange={(v) => {
            update("fsa_grace_period", v);
            if (v) update("fsa_carryover", false);
          }}
        />
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-card border">
        <div>
          <p className="text-sm font-medium">Carryover</p>
          <p className="text-xs text-muted-foreground">Carry unused funds to next plan year</p>
        </div>
        <Switch
          checked={data.fsa_carryover || false}
          onCheckedChange={(v) => {
            update("fsa_carryover", v);
            if (v) update("fsa_grace_period", false);
          }}
        />
      </div>

      {data.fsa_carryover && (
        <div className="space-y-2">
          <Label>Maximum Carryover Amount</Label>
          <Input
            type="number"
            placeholder="660"
            value={data.fsa_carryover_amount || ""}
            onChange={(e) => update("fsa_carryover_amount", e.target.value ? Number(e.target.value) : "")}
          />
          <p className="text-xs text-muted-foreground">2025 IRS limit: $660</p>
        </div>
      )}
    </div>
  );
};

const DCAP_SECTION = ({ data, onChange }) => {
  const update = (field, value) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-4 p-5 rounded-xl bg-muted/40 border">
      <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Dependent Care (DCAP) Options</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Maximum Annual Election</Label>
          <Input
            type="number"
            placeholder="5,000"
            value={data.dcap_max_election || ""}
            onChange={(e) => update("dcap_max_election", e.target.value ? Number(e.target.value) : "")}
          />
          <p className="text-xs text-muted-foreground">IRS limit: $5,000 ($2,500 if married filing separately)</p>
        </div>
        <div className="space-y-2">
          <Label>Minimum Annual Election</Label>
          <Input
            type="number"
            placeholder="100"
            value={data.dcap_min_election || ""}
            onChange={(e) => update("dcap_min_election", e.target.value ? Number(e.target.value) : "")}
          />
        </div>
      </div>
    </div>
  );
};

const LIMITED_FSA_SECTION = ({ data, onChange }) => {
  const update = (field, value) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-4 p-5 rounded-xl bg-muted/40 border">
      <div>
        <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Limited Purpose FSA Options</h4>
        <p className="text-xs text-muted-foreground mt-1">For HSA-compatible HDHP participants — covers dental and vision expenses only.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Maximum Annual Election</Label>
          <Input
            type="number"
            placeholder="3,300"
            value={data.limited_fsa_max_election || ""}
            onChange={(e) => update("limited_fsa_max_election", e.target.value ? Number(e.target.value) : "")}
          />
          <p className="text-xs text-muted-foreground">2025 IRS limit: $3,300</p>
        </div>
        <div className="space-y-2">
          <Label>Minimum Annual Election</Label>
          <Input
            type="number"
            placeholder="100"
            value={data.limited_fsa_min_election || ""}
            onChange={(e) => update("limited_fsa_min_election", e.target.value ? Number(e.target.value) : "")}
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-card border">
        <div>
          <p className="text-sm font-medium">Grace Period (2.5 months)</p>
          <p className="text-xs text-muted-foreground">Allow additional time to incur expenses</p>
        </div>
        <Switch
          checked={data.limited_fsa_grace_period || false}
          onCheckedChange={(v) => {
            update("limited_fsa_grace_period", v);
            if (v) update("limited_fsa_carryover", false);
          }}
        />
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-card border">
        <div>
          <p className="text-sm font-medium">Carryover</p>
          <p className="text-xs text-muted-foreground">Carry unused funds to next plan year</p>
        </div>
        <Switch
          checked={data.limited_fsa_carryover || false}
          onCheckedChange={(v) => {
            update("limited_fsa_carryover", v);
            if (v) update("limited_fsa_grace_period", false);
          }}
        />
      </div>

      {data.limited_fsa_carryover && (
        <div className="space-y-2">
          <Label>Maximum Carryover Amount</Label>
          <Input
            type="number"
            placeholder="660"
            value={data.limited_fsa_carryover_amount || ""}
            onChange={(e) => update("limited_fsa_carryover_amount", e.target.value ? Number(e.target.value) : "")}
          />
          <p className="text-xs text-muted-foreground">2025 IRS limit: $660</p>
        </div>
      )}
    </div>
  );
};

export default function BenefitsStep({ data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value });
  const planType = data.plan_type;

  const toggleBenefit = (benefit) => {
    const current = data.benefits_offered || [];
    const updated = current.includes(benefit)
      ? current.filter((b) => b !== benefit)
      : [...current, benefit];
    update("benefits_offered", updated);
  };

  const showPOP = ["pop", "full_flex", "simple_cafeteria"].includes(planType);
  const showFSA = ["health_fsa", "full_flex", "simple_cafeteria"].includes(planType);
  const showLimitedFSA = ["limited_fsa"].includes(planType);
  const showDCAP = ["dcap", "full_flex", "simple_cafeteria"].includes(planType);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-xl font-semibold">Benefits & Contributions</h3>
        <p className="text-sm text-muted-foreground mt-1">Configure the benefits offered under this plan.</p>
      </div>

      {showPOP && (
        <div className="space-y-3">
          <Label>Pre-Tax Premium Benefits</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {POP_BENEFITS.map((benefit) => (
              <label key={benefit} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                <Checkbox
                  checked={(data.benefits_offered || []).includes(benefit)}
                  onCheckedChange={() => toggleBenefit(benefit)}
                  className="mt-0.5"
                />
                <span className="text-sm">{benefit}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {showFSA && <FSA_SECTION data={data} onChange={onChange} />}
      {showLimitedFSA && <LIMITED_FSA_SECTION data={data} onChange={onChange} />}
      {showDCAP && <DCAP_SECTION data={data} onChange={onChange} />}

      <div className="space-y-4 p-5 rounded-xl bg-muted/40 border">
        <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Employer Contributions</h4>
        <div className="flex items-center justify-between p-3 rounded-lg bg-card border">
          <div>
            <p className="text-sm font-medium">Employer Makes Contributions</p>
            <p className="text-xs text-muted-foreground">Does the employer contribute to employee benefits?</p>
          </div>
          <Switch
            checked={data.employer_contribution || false}
            onCheckedChange={(v) => update("employer_contribution", v)}
          />
        </div>
        {data.employer_contribution && (
          <div className="space-y-2">
            <Label>Describe Employer Contribution</Label>
            <Input
              placeholder="e.g., Employer contributes $100/month toward medical premiums"
              value={data.employer_contribution_amount || ""}
              onChange={(e) => update("employer_contribution_amount", e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>Claims Administrator / TPA</Label>
          <Input
            placeholder="Name of third-party administrator"
            value={data.claims_administrator || ""}
            onChange={(e) => update("claims_administrator", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Claims Filing Deadline</Label>
          <Input
            placeholder="e.g., 90 days after plan year end"
            value={data.claims_filing_deadline || ""}
            onChange={(e) => update("claims_filing_deadline", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}