import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

const EMPTY = {
  company_name: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  ein: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  industry: "",
  employee_count: "",
  status: "prospect",
  notes: "",
  plan_renewal_date: "",
};

export default function ClientForm({ client, onSave, onCancel, saving }) {
  const [form, setForm] = useState(client ? { ...EMPTY, ...client } : EMPTY);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-card z-10">
          <h2 className="font-serif text-xl font-semibold">
            {client ? "Edit Client" : "Add New Client"}
          </h2>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Company */}
          <div className="space-y-1">
            <Label>Company Name *</Label>
            <Input
              required
              value={form.company_name}
              onChange={(e) => set("company_name", e.target.value)}
              placeholder="Acme Corporation"
            />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Contact Name</Label>
              <Input
                value={form.contact_name}
                onChange={(e) => set("contact_name", e.target.value)}
                placeholder="Jane Smith"
              />
            </div>
            <div className="space-y-1">
              <Label>Contact Email</Label>
              <Input
                type="email"
                value={form.contact_email}
                onChange={(e) => set("contact_email", e.target.value)}
                placeholder="jane@acme.com"
              />
            </div>
            <div className="space-y-1">
              <Label>Contact Phone</Label>
              <Input
                value={form.contact_phone}
                onChange={(e) => set("contact_phone", e.target.value)}
                placeholder="(555) 000-0000"
              />
            </div>
            <div className="space-y-1">
              <Label>EIN</Label>
              <Input
                value={form.ein}
                onChange={(e) => set("ein", e.target.value)}
                placeholder="XX-XXXXXXX"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <Label>Street Address</Label>
            <Input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="123 Main St"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="col-span-2 space-y-1">
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Chicago" />
            </div>
            <div className="space-y-1">
              <Label>State</Label>
              <Input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="IL" maxLength={2} />
            </div>
            <div className="space-y-1">
              <Label>ZIP</Label>
              <Input value={form.zip} onChange={(e) => set("zip", e.target.value)} placeholder="60601" />
            </div>
          </div>

          {/* Business Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Industry</Label>
              <Input
                value={form.industry}
                onChange={(e) => set("industry", e.target.value)}
                placeholder="Healthcare, Retail…"
              />
            </div>
            <div className="space-y-1">
              <Label>Employee Count</Label>
              <Input
                type="number"
                value={form.employee_count}
                onChange={(e) => set("employee_count", e.target.value)}
                placeholder="50"
              />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Renewal Date */}
          <div className="space-y-1">
            <Label>Plan Renewal / Review Date</Label>
            <Input
              type="date"
              value={form.plan_renewal_date}
              onChange={(e) => set("plan_renewal_date", e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label>Internal Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Add any notes about this client…"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : client ? "Save Changes" : "Add Client"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}