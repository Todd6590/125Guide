import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PlanDetailsStep({ data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-xl font-semibold">Plan Details</h3>
        <p className="text-sm text-muted-foreground mt-1">Specify the plan identification and timing details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="plan_name">Plan Name *</Label>
          <Input
            id="plan_name"
            placeholder="Acme Corporation Section 125 Cafeteria Plan"
            value={data.plan_name || ""}
            onChange={(e) => update("plan_name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plan_number">Plan Number (3-digit)</Label>
          <Input
            id="plan_number"
            placeholder="501"
            value={data.plan_number || ""}
            onChange={(e) => update("plan_number", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="effective_date">Original Effective Date</Label>
          <Input
            id="effective_date"
            type="date"
            value={data.effective_date || ""}
            onChange={(e) => update("effective_date", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plan_year_start">Plan Year Start</Label>
          <Input
            id="plan_year_start"
            type="date"
            value={data.plan_year_start || ""}
            onChange={(e) => update("plan_year_start", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plan_year_end">Plan Year End</Label>
          <Input
            id="plan_year_end"
            type="date"
            value={data.plan_year_end || ""}
            onChange={(e) => update("plan_year_end", e.target.value)}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="plan_administrator_name">Plan Administrator Name</Label>
          <Input
            id="plan_administrator_name"
            placeholder="Jane Smith"
            value={data.plan_administrator_name || ""}
            onChange={(e) => update("plan_administrator_name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plan_administrator_title">Administrator Title</Label>
          <Input
            id="plan_administrator_title"
            placeholder="HR Director"
            value={data.plan_administrator_title || ""}
            onChange={(e) => update("plan_administrator_title", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plan_administrator_phone">Administrator Phone</Label>
          <Input
            id="plan_administrator_phone"
            placeholder="(555) 123-4567"
            value={data.plan_administrator_phone || ""}
            onChange={(e) => update("plan_administrator_phone", e.target.value)}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="plan_administrator_email">Administrator Email</Label>
          <Input
            id="plan_administrator_email"
            placeholder="benefits@acmecorp.com"
            value={data.plan_administrator_email || ""}
            onChange={(e) => update("plan_administrator_email", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}