import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { PLAN_TYPE_INFO } from "./PlanTypeCard";
import { format } from "date-fns";
import { FileText, ArrowRight } from "lucide-react";

const TYPE_COLORS = {
  pop: "bg-blue-50 text-blue-700 border-blue-200",
  health_fsa: "bg-emerald-50 text-emerald-700 border-emerald-200",
  limited_fsa: "bg-teal-50 text-teal-700 border-teal-200",
  dcap: "bg-violet-50 text-violet-700 border-violet-200",
  full_flex: "bg-amber-50 text-amber-700 border-amber-200",
  simple_cafeteria: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function PlanDashboardCard({ plan }) {
  const info = PLAN_TYPE_INFO[plan.plan_type] || {};

  return (
    <Link
      to={`/plan/${plan.id}`}
      className="group block bg-card rounded-xl border p-5 hover:shadow-md hover:border-primary/30 transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {plan.plan_name || "Untitled Plan"}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">{plan.employer_name}</p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>

      <div className="flex items-center gap-2 mt-4">
        <Badge variant="outline" className={TYPE_COLORS[plan.plan_type]}>
          {info.title || plan.plan_type}
        </Badge>
        <Badge variant={plan.status === "complete" ? "default" : "secondary"}>
          {plan.status === "complete" ? "Complete" : "Draft"}
        </Badge>
      </div>

      {plan.effective_date && (
        <p className="text-xs text-muted-foreground mt-3">
          Effective: {format(new Date(plan.effective_date + "T00:00:00"), "MMM d, yyyy")}
        </p>
      )}
    </Link>
  );
}