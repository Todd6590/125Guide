import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULT = {
  first_name: "", last_name: "", job_title: "", employment_type: "full_time",
  annual_compensation: "", ownership_pct: "", is_officer: false,
  is_hce: false, is_key_employee: false, is_eligible: true, is_participating: false,
  fsa_election: "", dcap_election: "", premium_only_election: "",
  family_status: "single", dependents_count: 0,
};

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export default function ParticipantForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ ...DEFAULT, ...initial });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.first_name || !form.last_name) return;
    onSave({
      ...form,
      annual_compensation: parseFloat(form.annual_compensation) || 0,
      ownership_pct: parseFloat(form.ownership_pct) || 0,
      fsa_election: parseFloat(form.fsa_election) || 0,
      dcap_election: parseFloat(form.dcap_election) || 0,
      premium_only_election: parseFloat(form.premium_only_election) || 0,
      dependents_count: parseInt(form.dependents_count) || 0,
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name *">
          <Input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} className="h-8 text-sm" />
        </Field>
        <Field label="Last Name *">
          <Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} className="h-8 text-sm" />
        </Field>
        <Field label="Job Title">
          <Input value={form.job_title} onChange={(e) => set("job_title", e.target.value)} className="h-8 text-sm" />
        </Field>
        <Field label="Employment Type">
          <Select value={form.employment_type} onValueChange={(v) => set("employment_type", v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="full_time">Full-Time</SelectItem>
              <SelectItem value="part_time">Part-Time</SelectItem>
              <SelectItem value="seasonal">Seasonal</SelectItem>
              <SelectItem value="leased">Leased</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Annual Compensation ($)">
          <Input type="number" value={form.annual_compensation} onChange={(e) => set("annual_compensation", e.target.value)} className="h-8 text-sm" placeholder="0" />
        </Field>
        <Field label="Ownership % (if any)">
          <Input type="number" value={form.ownership_pct} onChange={(e) => set("ownership_pct", e.target.value)} className="h-8 text-sm" placeholder="0" />
        </Field>
      </div>

      <div className="rounded-lg border p-3 space-y-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Classifications</p>
        <Toggle label="Officer" checked={form.is_officer} onChange={(v) => set("is_officer", v)} />
        <Toggle label="Highly Compensated Employee (HCE)" checked={form.is_hce} onChange={(v) => set("is_hce", v)} />
        <Toggle label="Key Employee" checked={form.is_key_employee} onChange={(v) => set("is_key_employee", v)} />
        <Toggle label="Eligible to Participate" checked={form.is_eligible} onChange={(v) => set("is_eligible", v)} />
        <Toggle label="Currently Participating / Enrolled" checked={form.is_participating} onChange={(v) => set("is_participating", v)} />
      </div>

      <div className="rounded-lg border p-3 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Annual Elections ($)</p>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Health FSA">
            <Input type="number" value={form.fsa_election} onChange={(e) => set("fsa_election", e.target.value)} className="h-8 text-sm" placeholder="0" />
          </Field>
          <Field label="DCAP">
            <Input type="number" value={form.dcap_election} onChange={(e) => set("dcap_election", e.target.value)} className="h-8 text-sm" placeholder="0" />
          </Field>
          <Field label="Premium Only (POP)">
            <Input type="number" value={form.premium_only_election} onChange={(e) => set("premium_only_election", e.target.value)} className="h-8 text-sm" placeholder="0" />
          </Field>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={handleSave} disabled={!form.first_name || !form.last_name}>Save Participant</Button>
      </div>
    </div>
  );
}