import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, UserCheck, UserX } from "lucide-react";

const EMP_TYPE_LABELS = {
  full_time: "FT", part_time: "PT", seasonal: "Seasonal", leased: "Leased",
};

export default function ParticipantTable({ participants, onEdit, onDelete }) {
  if (!participants.length) return null;

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-left">
            <th className="px-4 py-3 font-semibold text-muted-foreground">Name</th>
            <th className="px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Type</th>
            <th className="px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Compensation</th>
            <th className="px-4 py-3 font-semibold text-muted-foreground">Classification</th>
            <th className="px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Elections</th>
            <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-right"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {participants.map((p) => {
            const totalElection = (p.fsa_election || 0) + (p.dcap_election || 0) + (p.premium_only_election || 0);
            return (
              <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium">{p.first_name} {p.last_name}</p>
                  {p.job_title && <p className="text-xs text-muted-foreground">{p.job_title}</p>}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <Badge variant="outline" className="text-xs">{EMP_TYPE_LABELS[p.employment_type] || p.employment_type}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                  {p.annual_compensation ? `$${Number(p.annual_compensation).toLocaleString()}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.is_hce && <Badge className="text-xs bg-purple-100 text-purple-700">HCE</Badge>}
                    {p.is_key_employee && <Badge className="text-xs bg-amber-100 text-amber-700">Key</Badge>}
                    {p.is_officer && <Badge className="text-xs bg-blue-100 text-blue-700">Officer</Badge>}
                    {!p.is_hce && !p.is_key_employee && !p.is_officer && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">NHCE</Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                  {totalElection > 0 ? `$${totalElection.toLocaleString()}` : "—"}
                </td>
                <td className="px-4 py-3">
                  {p.is_eligible ? (
                    p.is_participating
                      ? <span className="flex items-center gap-1 text-xs text-green-700"><UserCheck className="w-3.5 h-3.5" />Enrolled</span>
                      : <span className="flex items-center gap-1 text-xs text-amber-600"><UserX className="w-3.5 h-3.5" />Not Enrolled</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Ineligible</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => onEdit(p)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={() => onDelete(p.id)}>
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
  );
}