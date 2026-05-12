import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, Users, CalendarClock, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  prospect: "bg-blue-100 text-blue-700",
  inactive: "bg-muted text-muted-foreground",
};

export default function ClientCard({ client, onEdit, onDelete }) {
  return (
    <div className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">{client.company_name}</h3>
            {client.contact_name && (
              <p className="text-xs text-muted-foreground truncate">{client.contact_name}</p>
            )}
          </div>
        </div>
        <Badge className={`text-xs shrink-0 ${STATUS_STYLES[client.status] || STATUS_STYLES.prospect}`}>
          {client.status || "Prospect"}
        </Badge>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
        {client.contact_email && (
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{client.contact_email}</span>
          </div>
        )}
        {client.contact_phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>{client.contact_phone}</span>
          </div>
        )}
        {client.employee_count && (
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>{client.employee_count} employees</span>
          </div>
        )}
        {client.plan_renewal_date && (
          <div className="flex items-center gap-2">
            <CalendarClock className="w-3.5 h-3.5 shrink-0" />
            <span>Renewal: {format(new Date(client.plan_renewal_date), "MMM d, yyyy")}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t">
        <Button size="sm" variant="outline" className="gap-1.5 flex-1" onClick={() => onEdit(client)}>
          <Pencil className="w-3.5 h-3.5" /> Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-destructive hover:text-destructive"
          onClick={() => onDelete(client)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}