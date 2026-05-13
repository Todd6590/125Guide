import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function NDTSessionHistory({ sessions, onView, onDelete }) {
  if (!sessions.length) return (
    <p className="text-sm text-muted-foreground text-center py-6">No test sessions yet.</p>
  );

  return (
    <div className="space-y-2">
      {sessions.map((s) => (
        <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl border bg-card hover:bg-muted/20 transition-colors">
          {s.overall_result === "pass"
            ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{s.plan_name || "Plan"} — {s.test_year}</p>
            <p className="text-xs text-muted-foreground">
              {s.run_date ? format(new Date(s.run_date), "MMM d, yyyy") : ""} · {s.participant_count || 0} participants
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${s.overall_result === "pass" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {s.overall_result?.toUpperCase()}
            </Badge>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => onView(s)}>
              <Eye className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={() => onDelete(s.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}