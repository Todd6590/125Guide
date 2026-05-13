import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, FilePlus, Edit, ShieldCheck, Eye, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const PLAN_TYPE_LABELS = {
  pop: "POP",
  health_fsa: "Health FSA",
  limited_fsa: "Limited FSA",
  dcap: "DCAP",
  full_flex: "Full Flex",
  simple_cafeteria: "Simple Cafeteria",
};

const STATUS_STYLES = {
  draft: "bg-amber-100 text-amber-700",
  complete: "bg-green-100 text-green-700",
};

const SAMPLE_IDS = ["6a034bdd348868f845979461", "6a034bdd348868f845979462", "6a034bdd348868f845979460"];
const isSample = (p) => p.is_sample === true || SAMPLE_IDS.includes(p.id);

export default function PlansManagement() {
  const [search, setSearch] = useState("");
  const [runningCheck, setRunningCheck] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: () => base44.entities.PlanDocument.list("-created_date"),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["compliance-alerts"],
    queryFn: () => base44.entities.ComplianceAlert.filter({ status: "open" }),
  });

  const filtered = plans
    .filter((p) => !isSample(p))
    .filter(
      (p) =>
        (p.plan_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.employer_name || "").toLowerCase().includes(search.toLowerCase())
    );

  const alertCountForPlan = (planId) => alerts.filter((a) => a.plan_id === planId).length;

  const missingInfo = (plan) => {
    const missing = [];
    if (!plan.employer_ein) missing.push("EIN");
    if (!plan.plan_year_start) missing.push("Plan Year Start");
    if (!plan.plan_administrator_name) missing.push("Plan Administrator");
    if (!plan.benefits_offered?.length) missing.push("Benefits");
    return missing;
  };

  const handleComplianceCheck = async (plan) => {
    setRunningCheck(plan.id);
    try {
      await base44.functions.invoke("weeklyComplianceCheck", {});
      queryClient.invalidateQueries({ queryKey: ["compliance-alerts"] });
      toast.success(`Compliance check triggered for ${plan.plan_name}`);
    } catch (e) {
      toast.error("Compliance check failed");
    } finally {
      setRunningCheck(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this plan? This cannot be undone.")) return;
    setDeletingId(id);
    await base44.entities.PlanDocument.delete(id);
    queryClient.invalidateQueries({ queryKey: ["plans"] });
    toast.success("Plan deleted");
    setDeletingId(null);
  };

  const getClientName = (plan) => {
    if (plan.employer_name) return plan.employer_name;
    const match = clients.find((c) => c.ein && c.ein === plan.employer_ein);
    return match ? match.company_name : "—";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Existing Plans</h1>
          <p className="text-muted-foreground mt-1">
            View, edit, and manage all your Section 125 plan documents.
          </p>
        </div>
        <Link to="/create">
          <Button className="gap-2">
            <FilePlus className="w-4 h-4" /> New Plan
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by plan name or employer..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl bg-muted/20">
          <FilePlus className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            {search ? "No plans match your search." : "No plans yet. Create your first plan."}
          </p>
          {!search && (
            <Link to="/create" className="mt-4">
              <Button size="sm" className="gap-2">
                <FilePlus className="w-4 h-4" /> Create Plan
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="px-4 py-3 font-semibold text-muted-foreground">Plan Name</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Employer</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Type</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Plan Year</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Alerts</th>
                <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((plan) => {
                const missing = missingInfo(plan);
                const alertCount = alertCountForPlan(plan.id);
                return (
                  <tr key={plan.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{plan.plan_name}</div>
                      {missing.length > 0 && (
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-amber-600">
                          <AlertTriangle className="w-3 h-3" />
                          Missing: {missing.join(", ")}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{getClientName(plan)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {PLAN_TYPE_LABELS[plan.plan_type] || plan.plan_type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                      {plan.plan_year_start
                        ? format(new Date(plan.plan_year_start), "MMM d, yyyy")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${STATUS_STYLES[plan.status] || ""}`}>
                        {plan.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {alertCount > 0 ? (
                        <Badge className="bg-red-100 text-red-700 text-xs">{alertCount} open</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          title="View"
                          onClick={() => navigate(`/plan/${plan.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          title="Edit"
                          onClick={() => navigate(`/edit/${plan.id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          title="Run compliance check"
                          disabled={runningCheck === plan.id}
                          onClick={() => handleComplianceCheck(plan)}
                        >
                          {runningCheck === plan.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ShieldCheck className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                          title="Delete"
                          disabled={deletingId === plan.id}
                          onClick={() => handleDelete(plan.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}