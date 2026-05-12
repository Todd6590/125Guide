import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EmployerInfoStep({ data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  const handleEIN = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
    const formatted = digits.length > 2 ? `${digits.slice(0, 2)}-${digits.slice(2)}` : digits;
    update("employer_ein", formatted);
  };

  const handlePhone = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    let formatted = digits;
    if (digits.length > 6) formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    else if (digits.length > 3) formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    else if (digits.length > 0) formatted = `(${digits}`;
    update("employer_phone", formatted);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-xl font-semibold">Employer Information</h3>
        <p className="text-sm text-muted-foreground mt-1">Enter the sponsoring employer's details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="employer_name">Legal Business Name *</Label>
          <Input
            id="employer_name"
            placeholder="Acme Corporation, Inc."
            value={data.employer_name || ""}
            onChange={(e) => update("employer_name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employer_ein">Employer Identification Number (EIN)</Label>
          <Input
            id="employer_ein"
            placeholder="XX-XXXXXXX"
            value={data.employer_ein || ""}
            onChange={handleEIN}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employer_phone">Phone Number</Label>
          <Input
            id="employer_phone"
            placeholder="(555) 123-4567"
            value={data.employer_phone || ""}
            onChange={handlePhone}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="employer_address">Street Address</Label>
          <Input
            id="employer_address"
            placeholder="123 Main Street"
            value={data.employer_address || ""}
            onChange={(e) => update("employer_address", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employer_city">City</Label>
          <Input
            id="employer_city"
            placeholder="Springfield"
            value={data.employer_city || ""}
            onChange={(e) => update("employer_city", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employer_state">State</Label>
            <Input
              id="employer_state"
              placeholder="IL"
              value={data.employer_state || ""}
              onChange={(e) => update("employer_state", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employer_zip">ZIP Code</Label>
            <Input
              id="employer_zip"
              placeholder="62701"
              value={data.employer_zip || ""}
              onChange={(e) => update("employer_zip", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}