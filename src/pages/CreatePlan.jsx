import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PlanWizard from "@/components/plans/PlanWizard";

export default function CreatePlan() {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const draftIdRef = useRef(null); // tracks the draft record once created

  // Auto-save: create or update draft as user types
  const handleAutoSave = async (data) => {
    if (!data.plan_type && !data.employer_name) return; // nothing meaningful yet
    if (draftIdRef.current) {
      await base44.entities.PlanDocument.update(draftIdRef.current, { ...data, status: "draft" });
    } else {
      const created = await base44.entities.PlanDocument.create({ ...data, status: "draft" });
      draftIdRef.current = created.id;
    }
    queryClient.invalidateQueries({ queryKey: ["plans"] });
  };

  // Final save: mark complete and navigate
  const handleSave = async (data) => {
    setSaving(true);
    if (draftIdRef.current) {
      await base44.entities.PlanDocument.update(draftIdRef.current, { ...data, status: "complete" });
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plan document created successfully!");
      navigate(`/plan/${draftIdRef.current}`);
    } else {
      const created = await base44.entities.PlanDocument.create({ ...data, status: "complete" });
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plan document created successfully!");
      navigate(`/plan/${created.id}`);
    }
    setSaving(false);
  };

  return (
    <div>
      <PlanWizard onSave={handleSave} onAutoSave={handleAutoSave} saving={saving} />
    </div>
  );
}