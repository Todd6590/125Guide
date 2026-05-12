import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const PLAN_TYPE_INFO = {
  pop: {
    title: "Premium Only Plan (POP)",
    description: "The most common Section 125 plan. Employees pay their share of group health insurance premiums (medical, dental, vision) with pre-tax dollars.",
    features: ["Pre-tax premium deductions", "Medical, dental, vision, life", "HSA contributions eligible", "Simplest to administer"],
  },
  health_fsa: {
    title: "Health FSA",
    description: "Employees set aside pre-tax funds for out-of-pocket medical, dental, and vision costs not covered by insurance. Subject to use-it-or-lose-it rules.",
    features: ["Pre-tax medical expenses", "Grace period or carryover options", "Uniform coverage rule applies", "Up to $3,300/year (2025)"],
  },
  limited_fsa: {
    title: "Limited Purpose FSA",
    description: "Designed for employees enrolled in an HSA-compatible High Deductible Health Plan (HDHP). Covers dental and vision expenses only.",
    features: ["Dental & vision only", "HSA-compatible", "Use-it-or-lose-it basis", "Preserves HSA eligibility"],
  },
  dcap: {
    title: "Dependent Care (DCAP)",
    description: "Pre-tax contributions for child or elder care expenses such as daycare, preschool, and after-school programs, up to $5,000 annually.",
    features: ["Up to $5,000/year tax-free", "Childcare & elder care", "No uniform coverage rule", "$2,500 if married filing separately"],
  },
  full_flex: {
    title: "Full Flex Cafeteria Plan",
    description: "Comprehensive plan where employers provide funds employees use to select from a menu of benefits, with pre-tax payroll deductions for costs exceeding the allowance.",
    features: ["Employer benefit allowance", "Employee selects from menu", "Combines POP, FSA & DCAP", "Maximum tax savings"],
  },
  simple_cafeteria: {
    title: "Simple Cafeteria Plan",
    description: "Designed for small businesses with 100 or fewer employees. Avoids complex non-discrimination testing by meeting safe-harbor contribution requirements.",
    features: ["≤100 employees", "No nondiscrimination testing", "Safe-harbor contributions", "Simplified compliance"],
  },
};

export default function PlanTypeCard({ type, selected, onSelect }) {
  const info = PLAN_TYPE_INFO[type];
  if (!info) return null;

  return (
    <button
      onClick={() => onSelect(type)}
      className={cn(
        "relative text-left p-6 rounded-xl border-2 transition-all duration-200 group",
        selected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
      )}
    >
      {selected && (
        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
      )}
      <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{info.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{info.description}</p>
      <div className="space-y-1.5">
        {info.features.map((f) => (
          <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-1 h-1 rounded-full bg-accent" />
            {f}
          </div>
        ))}
      </div>
    </button>
  );
}

export { PLAN_TYPE_INFO };