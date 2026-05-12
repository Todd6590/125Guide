import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { History, RotateCcw, ChevronDown, ChevronUp, Loader2, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const FIELD_LABELS = {
  plan_name: "Plan Name",
  plan_type: "Plan Type",
  employer_name: "Employer Name",
  employer_ein: "EIN",
  employer_address: "Address",
  employer_city: "City",
  employer_state: "State",
  employer_zip: "ZIP",
  employer_phone: "Phone",
  plan_number: "Plan Number",
  plan_year_start: "Plan Year Start",
  plan_year_end: "Plan Year End",
  effective_date: "Effective Date",
  plan_administrator_name: "Administrator Name",
  plan_administrator_title: "Administrator Title",
  plan_administrator_phone: "Administrator Phone",
  plan_administrator_email: "Administrator Email",
  eligibility_class: "Eligible Class",
  waiting_period: "Waiting Period",
  hours_required: "Hours Required",
  entry_dates: "Entry Dates",
  benefits_offered: "Benefits Offered",
  fsa_max_election: "FSA Max Election",
  fsa_min_election: "FSA Min Election",
  fsa_grace_period: "FSA Grace Period",
  fsa_carryover: "FSA Carryover",
  fsa_carryover_amount: "FSA Carryover Amount",
  limited_fsa_max_election: "Limited FSA Max Election",
  limited_fsa_min_election: "Limited FSA Min Election",
  limited_fsa_grace_period: "Limited FSA Grace Period",
  limited_fsa_carryover: "Limited FSA Carryover",
  limited_fsa_carryover_amount: "Limited FSA Carryover Amount",
  dcap_max_election: "DCAP Max Election",
  dcap_min_election: "DCAP Min Election",
  election_change_events: "Qualifying Life Events",
  claims_administrator: "Claims Administrator",
  claims_filing_deadline: "Claims Filing Deadline",
  employer_contribution: "Employer Contribution",
  employer_contribution_amount: "Employer Contribution Amount",
  total_employees: "Total Employees",
};

function formatFieldValue(key, val) {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (Array.isArray(val)) return val.join(", ") || "—";
  if (typeof val === "number" && (key.includes("election") || key.includes("amount")))
    return `$${val.toLocaleString()}`;
  return String(val);
}

function VersionRow({ version, currentPlan, onRevert, isLatest }) {
  const [expanded, setExpanded] = useState(false);
  const [reverting, setReverting] = useState(false);

  const handleRevert = async () => {
    setReverting(true);
    await onRevert(version);
    setReverting(false);
  };

  const changedFields = version.changed_fields || [];

  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between p-3 bg-card hover:bg-muted/30 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">v{version.version_number}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{version.label || `Version ${version.version_number}`}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {version.created_date ? format(new Date(version.created_date), "MMM d, yyyy 'at' h:mm a") : "—"}
              </span>
              {version.saved_by && (
                <span className="text-xs text-muted-foreground">by {version.saved_by}</span>
              )}
              {isLatest && <Badge variant="secondary" className="text-xs">Latest</Badge>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          {!isLatest && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-foreground text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  {reverting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  Revert
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Revert to Version {version.version_number}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will restore the plan to its state from {version.created_date ? format(new Date(version.created_date), "MMMM d, yyyy") : "this version"}. A new version will be saved before reverting so you can undo this action.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRevert}>Revert</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t p-4 bg-muted/20 space-y-3">
          {changedFields.length > 0 ? (
            <>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Changed Fields</p>
              <div className="space-y-2">
                {changedFields.map((field) => {
                  const label = FIELD_LABELS[field] || field;
                  const oldVal = version.snapshot?.[field];
                  const currentVal = currentPlan?.[field];
                  return (
                    <div key={field} className="flex items-start gap-2 text-xs">
                      <span className="font-medium text-foreground w-40 flex-shrink-0">{label}</span>
                      <span className="text-muted-foreground line-through">{formatFieldValue(field, oldVal)}</span>
                      <span className="text-muted-foreground mx-1">→</span>
                      <span className="text-foreground">{formatFieldValue(field, currentVal)}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Initial version — no prior state to compare.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function VersionHistory({ plan }) {
  const queryClient = useQueryClient();

  const { data: versions, isLoading } = useQuery({
    queryKey: ["plan-versions", plan.id],
    queryFn: () => base44.entities.PlanVersion.filter({ plan_id: plan.id }, "-version_number"),
    initialData: [],
  });

  const handleRevert = async (version) => {
    // First, snapshot the current state as a new version
    const nextVersion = (versions[0]?.version_number || 0) + 1;
    const changedFields = getChangedFields(version.snapshot, plan);
    await base44.entities.PlanVersion.create({
      plan_id: plan.id,
      version_number: nextVersion,
      label: `Auto-save before revert to v${version.version_number}`,
      changed_fields: changedFields,
      snapshot: { ...plan },
      saved_by: plan.created_by,
    });

    // Then restore the old snapshot
    const { id, created_date, updated_date, created_by, ...snapshotData } = version.snapshot;
    await base44.entities.PlanDocument.update(plan.id, snapshotData);
    queryClient.invalidateQueries({ queryKey: ["plans"] });
    queryClient.invalidateQueries({ queryKey: ["plan-versions", plan.id] });
    toast.success(`Reverted to Version ${version.version_number}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
          <History className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No version history yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Version snapshots are saved automatically each time you edit and save the plan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{versions.length} version{versions.length !== 1 ? "s" : ""} saved</p>
      {versions.map((v, i) => (
        <VersionRow
          key={v.id}
          version={v}
          currentPlan={plan}
          onRevert={handleRevert}
          isLatest={i === 0}
        />
      ))}
    </div>
  );
}

export function getChangedFields(oldData, newData) {
  const keys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
  const skip = new Set(["id", "created_date", "updated_date", "created_by", "status"]);
  const changed = [];
  for (const key of keys) {
    if (skip.has(key)) continue;
    if (JSON.stringify(oldData?.[key]) !== JSON.stringify(newData?.[key])) {
      changed.push(key);
    }
  }
  return changed;
}