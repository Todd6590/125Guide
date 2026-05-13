import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save, Loader2, Cloud, CloudOff, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAutoSave } from "@/hooks/useAutoSave";

import PlanTypeSelector from "./PlanTypeSelector";
import EmployerInfoStep from "./steps/EmployerInfoStep";
import PlanDetailsStep from "./steps/PlanDetailsStep";
import EligibilityStep from "./steps/EligibilityStep";
import BenefitsStep from "./steps/BenefitsStep";
import ReviewStep from "./steps/ReviewStep";

const STEPS = [
  { key: "type", label: "Plan Type" },
  { key: "employer", label: "Employer" },
  { key: "details", label: "Plan Details" },
  { key: "eligibility", label: "Eligibility" },
  { key: "benefits", label: "Benefits" },
  { key: "review", label: "Review" },
];

function AutoSaveIndicator({ status }) {
  if (status === "idle") return null;
  return (
    <div className={cn(
      "flex items-center gap-1.5 text-xs px-2 py-1 rounded-full transition-all",
      status === "saving" && "text-muted-foreground",
      status === "saved" && "text-green-600",
      status === "error" && "text-destructive",
    )}>
      {status === "saving" && <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</>}
      {status === "saved" && <><CheckCircle2 className="w-3 h-3" /> Saved</>}
      {status === "error" && <><CloudOff className="w-3 h-3" /> Save failed</>}
    </div>
  );
}

export default function PlanWizard({ initialData, onSave, onAutoSave, saving }) {
  const [step, setStep] = useState(initialData?.plan_type ? 1 : 0);
  const [data, setData] = useState(initialData || {});

  const autoSaveStatus = useAutoSave(onAutoSave, data, 1500, !!onAutoSave);

  const canNext = () => {
    if (step === 0) return !!data.plan_type;
    if (step === 1) return !!data.employer_name;
    if (step === 2) return !!data.plan_name;
    return true;
  };

  const handleTypeSelect = (type) => {
    setData((prev) => ({ ...prev, plan_type: type }));
  };

  const renderStep = () => {
    switch (step) {
      case 0: return <PlanTypeSelector selected={data.plan_type} onSelect={handleTypeSelect} />;
      case 1: return <EmployerInfoStep data={data} onChange={setData} />;
      case 2: return <PlanDetailsStep data={data} onChange={setData} />;
      case 3: return <EligibilityStep data={data} onChange={setData} />;
      case 4: return <BenefitsStep data={data} onChange={setData} />;
      case 5: return <ReviewStep data={data} />;
      default: return null;
    }
  };

  return (
    <div>
      {/* Step indicators */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => i <= step && setStep(i)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all",
              i === step
                ? "bg-primary text-primary-foreground font-medium"
                : i < step
                ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/15"
                : "bg-muted text-muted-foreground"
            )}
          >
            <span className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold",
              i === step ? "bg-primary-foreground/20" : i < step ? "bg-primary/20" : "bg-muted-foreground/20"
            )}>
              {i + 1}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}

        {/* Auto-save indicator */}
        <div className="ml-auto flex-shrink-0">
          <AutoSaveIndicator status={autoSaveStatus} />
        </div>
      </div>

      {/* Step content */}
      <div className="bg-card rounded-xl border p-6 md:p-8 shadow-sm">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className="gap-2"
          >
            Next <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={() => onSave(data)}
            disabled={saving}
            className="gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Plan Document
          </Button>
        )}
      </div>
    </div>
  );
}