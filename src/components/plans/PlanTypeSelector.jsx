import PlanTypeCard from "./PlanTypeCard";

const PLAN_TYPES = ["pop", "health_fsa", "limited_fsa", "dcap", "full_flex", "simple_cafeteria"];

export default function PlanTypeSelector({ selected, onSelect }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-semibold text-foreground">Select Plan Type</h2>
        <p className="text-muted-foreground mt-1">Choose the type of Section 125 plan document you'd like to create.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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