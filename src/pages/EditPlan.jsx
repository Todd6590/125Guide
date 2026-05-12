import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlanWizard from "@/components/plans/PlanWizard";
import { getChangedFields } from "@/components/plans/VersionHistory";

export default function EditPlan() {
  const [saving, setSaving] = useState(false);
  const planId = window.location.pathname.split("/edit/")[1];
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: plans, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: () => base44.entities.PlanDocument.list("-created_date"),
    initialData: [],
  });

  const plan = plans.find((p) => p.id === planId);

  const handleSave = async (data) => {
    setSaving(true);

    // Snapshot current state before overwriting
    const existingVersions = await base44.entities.PlanVersion.filter({ plan_id: planId }, "-version_number", 1);
    const nextVersion = (existingVersions[0]?.version_number || 0) + 1;
    const changedFields = getChangedFields(plan, data);
    await base44.entities.PlanVersion.create({
      plan_id: planId,
      version_number: nextVersion,
      label: nextVersion === 1 ? "Initial version" : `Edit on ${new Date().toLocaleDateString()}`,
      changed_fields: changedFields,
      snapshot: { ...plan },
      saved_by: plan.created_by,
    });

    await base44.entities.PlanDocument.update(planId, { ...data, status: "complete" });
    queryClient.invalidateQueries({ queryKey: ["plans"] });
    queryClient.invalidateQueries({ queryKey: ["plan-versions", planId] });
    toast.success("Plan document updated!");
    navigate(`/plan/${planId}`);
    setSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">Plan not found.</p>
        <Link to="/">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PlanWizard initialData={plan} onSave={handleSave} saving={saving} />
    </div>
  );
}