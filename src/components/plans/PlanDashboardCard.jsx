import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { PLAN_TYPE_INFO } from "./PlanTypeCard";
import { format } from "date-fns";
import { FileText, ArrowRight, Trash2 } from "lucide-react";

const TYPE_COLORS = {
  pop: "bg-blue-50 text-blue-700 border-blue-200",
  health_fsa: "bg-emerald-50 text-emerald-700 border-emerald-200",
  limited_fsa: "bg-teal-50 text-teal-700 border-teal-200",
  dcap: "bg-violet-50 text-violet-700 border-violet-200",
  full_flex: "bg-amber-50 text-amber-700 border-amber-200",
  simple_cafeteria: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function PlanDashboardCard({ plan, onDelete }) {
  const info = PLAN_TYPE_INFO[plan.plan_type] || {};

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(plan.id);
  };

  return (
    <div className="relative group">
      {plan.is_sample && (
        <div className="absolute -top-2.5 left-4 z-10">
          <span className="bg-amber-100 text-amber-700 border border-amber-300 text-xs font-semibold px-2.5 py-0.5 rounded-full tracking-wide">
            Sample Plan
          </span>
        </div>
      )}
      <Link
        to={plan.status === "draft" ? `/edit/${plan.id}` : `/plan/${plan.id}`}
        className={`block bg-card rounded-xl border p-5 hover:shadow-md hover:border-primary/30 transition-all duration-200 ${plan.is_sample ? "border-amber-200 pt-6" : ""}`}
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
          <div className="flex items-center gap-1">
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
              title="Delete plan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
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
    </div>
  );
}