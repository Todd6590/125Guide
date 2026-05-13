import PlanTypeCard from "./PlanTypeCard";

const PLAN_TYPES = ["pop", "health_fsa", "limited_fsa", "dcap", "full_flex", "simple_cafeteria"];

export default function PlanTypeSelector({ selected, onSelect }) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Select Plan Type</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Choose the type of Section 125 plan document you'd like to create.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PLAN_TYPES.map((type) => (
          <PlanTypeCard
            key={type}
            type={type}
            selected={selected === type}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}