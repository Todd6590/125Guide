import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilePlus, Search, FileText, Loader2 } from "lucide-react";
import PlanDashboardCard from "@/components/plans/PlanDashboardCard";
import NondiscriminationTester from "@/components/compliance/NondiscriminationTester";
import { toast } from "sonner";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: plans, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: () => base44.entities.PlanDocument.list("-created_date"),
    initialData: [],
  });

  const handleDelete = async (id) => {
    await base44.entities.PlanDocument.delete(id);
    queryClient.invalidateQueries({ queryKey: ["plans"] });
    toast.success("Plan deleted");
  };

  const filtered = plans.filter(
    (p) =>
      (p.plan_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.employer_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const SAMPLE_IDS = ["6a034bdd348868f845979461", "6a034bdd348868f845979462", "6a034bdd348868f845979460"];
  const isSample = (p) => p.is_sample === true || SAMPLE_IDS.includes(p.id);
  const yourPlans = filtered.filter((p) => !isSample(p));
  const samplePlans = filtered.filter((p) => isSample(p));

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Plan Documents
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg">
            Create and manage Section 125 cafeteria plan documents. Select a plan type and fill in the blanks to generate compliant plan documents.
          </p>
        </div>
        <Link to="/create">
          <Button size="lg" className="gap-2 shadow-sm">
            <FilePlus className="w-4 h-4" />
            Create New Plan
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search plans..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-10">
          {/* Your Plans */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-xl font-semibold text-foreground">Your Plans</h2>
              <div className="flex-1 border-t border-border" />
            </div>
            {yourPlans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-border rounded-xl bg-muted/20">
                <FileText className="w-8 h-8 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  {search ? "No matching plans found." : "Your plans will appear here."}
                </p>
                {!search && (
                  <Link to="/create" className="mt-4">
                    <Button size="sm" className="gap-2">
                      <FilePlus className="w-4 h-4" />
                      Create Your First Plan
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {yourPlans.map((plan) => (
                  <PlanDashboardCard key={plan.id} plan={plan} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>

          {/* Sample Plans */}
          {samplePlans.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="font-serif text-xl font-semibold text-muted-foreground">Sample Plans</h2>
                <div className="flex-1 border-t border-dashed border-border" />
                <span className="text-xs text-muted-foreground whitespace-nowrap">For reference only — not your plans</span>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                These are pre-loaded sample plan documents to help you explore the tool. They are not associated with any real client.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {samplePlans.map((plan) => (
                  <PlanDashboardCard key={plan.id} plan={plan} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {/* Compliance Tools */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-xl font-semibold text-foreground">Compliance Tools</h2>
              <div className="flex-1 border-t border-border" />
            </div>
            <NondiscriminationTester />
          </div>
        </div>
      )}
    </div>
  );
}