import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const LIFE_EVENTS = [
  "Marriage",
  "Divorce or legal separation",
  "Birth or adoption of a child",
  "Death of a spouse or dependent",
  "Change in employment status of employee or spouse",
  "Change in dependent eligibility",
  "Significant cost or coverage change",
  "COBRA qualifying event",
  "Judgment, decree, or order",
  "Medicare or Medicaid entitlement",
];

export default function EligibilityStep({ data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  const toggleEvent = (event) => {
    const current = data.election_change_events || [];
    const updated = current.includes(event)
      ? current.filter((e) => e !== event)
      : [...current, event];
    update("election_change_events", updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-xl font-semibold">Eligibility & Elections</h3>
        <p className="text-sm text-muted-foreground mt-1">Define who is eligible and how elections work.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="eligibility_class">Eligible Employee Class</Label>
          <Input
            id="eligibility_class"
            placeholder="All full-time employees regularly scheduled for 30+ hours per week"
            value={data.eligibility_class || ""}
            onChange={(e) => update("eligibility_class", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="waiting_period">Waiting Period</Label>
          <Select value={data.waiting_period || ""} onValueChange={(v) => update("waiting_period", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select waiting period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No waiting period</SelectItem>
              <SelectItem value="first_of_month">First of month following hire</SelectItem>
              <SelectItem value="30_days">30 days</SelectItem>
              <SelectItem value="60_days">60 days</SelectItem>
              <SelectItem value="90_days">90 days</SelectItem>
              <SelectItem value="first_of_month_30">First of month after 30 days</SelectItem>
              <SelectItem value="first_of_month_60">First of month after 60 days</SelectItem>
              <SelectItem value="first_of_month_90">First of month after 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hours_required">Minimum Hours/Week</Label>
          <Input
            id="hours_required"
            type="number"
            placeholder="30"
            value={data.hours_required || ""}
            onChange={(e) => update("hours_required", e.target.value ? Number(e.target.value) : "")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="entry_dates">Entry Dates</Label>
          <Select value={data.entry_dates || ""} onValueChange={(v) => update("entry_dates", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select entry dates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediately upon eligibility</SelectItem>
              <SelectItem value="first_of_month">First of next month</SelectItem>
              <SelectItem value="quarterly">Quarterly (Jan, Apr, Jul, Oct)</SelectItem>
              <SelectItem value="semi_annual">Semi-annually (Jan, Jul)</SelectItem>
              <SelectItem value="annual">Annually (plan year start)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {data.plan_type === "simple_cafeteria" && (
          <div className="space-y-2">
            <Label htmlFor="total_employees">Total Number of Employees</Label>
            <Input
              id="total_employees"
              type="number"
              placeholder="50"
              value={data.total_employees || ""}
              onChange={(e) => update("total_employees", e.target.value ? Number(e.target.value) : "")}
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label>Qualifying Life Events (mid-year election changes)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {LIFE_EVENTS.map((event) => (
            <label key={event} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
              <Checkbox
                checked={(data.election_change_events || []).includes(event)}
                onCheckedChange={() => toggleEvent(event)}
                className="mt-0.5"
              />
              <span className="text-sm">{event}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}