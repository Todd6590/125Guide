import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PlanWizard from "@/components/plans/PlanWizard";

export default function CreatePlan() {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSave = async (data) => {
    setSaving(true);
    const planData = { ...data, status: "complete" };
    const created = await base44.entities.PlanDocument.create(planData);
    queryClient.invalidateQueries({ queryKey: ["plans"] });
    toast.success("Plan document created successfully!");
    navigate(`/plan/${created.id}`);
    setSaving(false);
  };

  return (
    <div>
      <PlanWizard onSave={handleSave} saving={saving} />
    </div>
  );
}