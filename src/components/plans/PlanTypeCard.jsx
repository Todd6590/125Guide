import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const PLAN_TYPE_INFO = {
  pop: {
    title: "Premium Only Plan (POP)",
    description: "Allows employees to pay group health insurance premiums with pre-tax dollars. The simplest Section 125 plan.",
    features: ["Pre-tax premium payments", "Medical, dental, vision", "Simple administration"],
  },
  health_fsa: {
    title: "Health FSA",
    description: "Employees set aside pre-tax dollars for qualified medical expenses not covered by insurance.",
    features: ["Pre-tax medical expenses", "Grace period or carryover options", "Uniform coverage rule applies"],
  },
  dcap: {
    title: "Dependent Care (DCAP)",
    description: "Pre-tax contributions for dependent care expenses such as daycare, preschool, and elder care.",
    features: ["Up to $5,000/year tax-free", "Childcare & elder care", "No uniform coverage rule"],
  },
  full_flex: {
    title: "Full Flex Cafeteria Plan",
    description: "Comprehensive plan combining POP, Health FSA, and DCAP into one unified Section 125 plan.",
    features: ["Combines all plan types", "Maximum flexibility", "Employer contributions optional"],
  },
  simple_cafeteria: {
    title: "Simple Cafeteria Plan",
    description: "For employers with 100 or fewer employees. Exempt from non-discrimination testing requirements.",
    features: ["≤100 employees", "No nondiscrimination testing", "Simplified compliance"],
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