import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Plus, Trash2, FlaskConical, CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";

const EMPTY_ROW = () => ({ id: Date.now() + Math.random(), name: "", hce: false, key_employee: false, eligible: true, participating: true });

const SAMPLE_EMPLOYEES = [
  { id: 1, name: "CEO (Owner >5%)", hce: true, key_employee: true, eligible: true, participating: true },
  { id: 2, name: "VP of Sales (HCE)", hce: true, key_employee: false, eligible: true, participating: true },
  { id: 3, name: "Manager A (HCE)", hce: true, key_employee: false, eligible: true, participating: true },
  { id: 4, name: "Employee 1", hce: false, key_employee: false, eligible: true, participating: true },
  { id: 5, name: "Employee 2", hce: false, key_employee: false, eligible: true, participating: true },
  { id: 6, name: "Employee 3", hce: false, key_employee: false, eligible: true, participating: true },
  { id: 7, name: "Employee 4", hce: false, key_employee: false, eligible: true, participating: false },
  { id: 8, name: "Employee 5 (Part-time)", hce: false, key_employee: false, eligible: false, participating: false },
];

function runTests(employees) {
  const eligible = employees.filter((e) => e.eligible);
  const participating = employees.filter((e) => e.participating);
  const hceEligible = eligible.filter((e) => e.hce);
  const nhceEligible = eligible.filter((e) => !e.hce);
  const hceParticipating = participating.filter((e) => e.hce);
  const nhceParticipating = participating.filter((e) => !e.hce);
  const keyParticipating = participating.filter((e) => e.key_employee);
  const total = employees.length;

  // Eligibility Test: NHCE participation rate >= 70% of HCE rate (or 70% of all NHCEs eligible)
  const hceEligRate = eligible.length > 0 ? hceEligible.length / Math.max(employees.filter(e=>e.hce).length,1) : 0;
  const nhceEligRate = employees.filter(e=>!e.hce).length > 0 ? nhceEligible.length / employees.filter(e=>!e.hce).length : 0;
  const eligibilityPass = nhceEligRate >= 0.70 || (hceEligRate > 0 && nhceEligRate >= hceEligRate * 0.70);

  // Benefits Test: % of NHCEs participating >= 70% of % of HCEs participating
  const hcePartRate = hceEligible.length > 0 ? hceParticipating.length / hceEligible.length : 0;
  const nhcePartRate = nhceEligible.length > 0 ? nhceParticipating.length / nhceEligible.length : 0;
  const benefitsPass = hcePartRate === 0 || nhcePartRate >= hcePartRate * 0.70;

  // Key Employee Concentration Test: Key employees cannot receive >25% of total benefits
  const keyConcentration = participating.length > 0 ? keyParticipating.length / participating.length : 0;
  const concentrationPass = keyConcentration <= 0.25;

  return {
    eligibilityPass,
    benefitsPass,
    concentrationPass,
    stats: {
      totalEmployees: total,
      eligibleCount: eligible.length,
      participatingCount: participating.length,
      hceEligRate: Math.round(hceEligRate * 100),
      nhceEligRate: Math.round(nhceEligRate * 100),
      hcePartRate: Math.round(hcePartRate * 100),
      nhcePartRate: Math.round(nhcePartRate * 100),
      keyConcentration: Math.round(keyConcentration * 100),
    },
  };
}

function TestResult({ label, pass, detail }) {
  const Icon = pass ? CheckCircle2 : XCircle;
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${pass ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${pass ? "text-green-600" : "text-red-500"}`} />
      <div>
        <p className={`text-sm font-medium ${pass ? "text-green-800" : "text-red-800"}`}>{label}</p>
        <p className={`text-xs mt-0.5 ${pass ? "text-green-600" : "text-red-600"}`}>{detail}</p>
      </div>
      <Badge className={`ml-auto text-xs ${pass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        {pass ? "PASS" : "FAIL"}
      </Badge>
    </div>
  );
}

export default function NondiscriminationTester() {
  const [enabled, setEnabled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [useSample, setUseSample] = useState(null); // null = not chosen yet, true/false after choice
  const [employees, setEmployees] = useState([]);
  const [results, setResults] = useState(null);

  const addRow = () => setEmployees((prev) => [...prev, EMPTY_ROW()]);
  const removeRow = (id) => setEmployees((prev) => prev.filter((e) => e.id !== id));
  const updateRow = (id, field, value) =>
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const loadSample = () => {
    setEmployees(SAMPLE_EMPLOYEES.map(e => ({ ...e, id: e.id })));
    setUseSample(true);
    setResults(null);
  };

  const startBlank = () => {
    setEmployees([EMPTY_ROW()]);
    setUseSample(false);
    setResults(null);
  };

  const handleRunTests = () => {
    setResults(runTests(employees));
  };

  if (!enabled) {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl border border-dashed border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <FlaskConical className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Nondiscrimination Testing</p>
            <p className="text-xs text-muted-foreground">Optionally run IRS Section 125 compliance tests on your participant census.</p>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <FlaskConical className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Nondiscrimination Testing</p>
            <p className="text-xs text-muted-foreground">IRS Section 125 compliance calculator</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={enabled}
            onCheckedChange={(v) => { setEnabled(v); if (!v) setExpanded(false); }}
            onClick={(e) => e.stopPropagation()}
          />
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t p-4 space-y-5">
          {/* Info banner */}
          <div className="flex gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Section 125 plans must pass three IRS nondiscrimination tests: <strong>Eligibility</strong>, <strong>Benefits</strong>, and the <strong>Key Employee Concentration</strong> test. HCEs are generally officers, 5%+ owners, or employees earning above the IRS compensation threshold.</span>
          </div>

          {/* Choose mode */}
          {useSample === null && (
            <div className="text-center space-y-3 py-4">
              <p className="text-sm text-muted-foreground">How would you like to get started?</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button variant="outline" size="sm" onClick={loadSample} className="gap-2">
                  <FlaskConical className="w-4 h-4" /> Load Sample Data
                </Button>
                <Button variant="outline" size="sm" onClick={startBlank} className="gap-2">
                  <Plus className="w-4 h-4" /> Enter My Own Data
                </Button>
              </div>
            </div>
          )}

          {/* Census Table */}
          {useSample !== null && (
            <>
              {useSample && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Sample Data</Badge>
                  <span className="text-xs text-muted-foreground">Edit rows below or</span>
                  <button onClick={startBlank} className="text-xs text-primary underline">start with your own data</button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 pr-3 font-medium w-1/3">Employee / Group Label</th>
                      <th className="text-center py-2 px-2 font-medium">HCE?</th>
                      <th className="text-center py-2 px-2 font-medium">Key Employee?</th>
                      <th className="text-center py-2 px-2 font-medium">Eligible?</th>
                      <th className="text-center py-2 px-2 font-medium">Participating?</th>
                      <th className="py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-muted/30">
                        <td className="py-1.5 pr-3">
                          <Input
                            value={emp.name}
                            onChange={(e) => updateRow(emp.id, "name", e.target.value)}
                            placeholder="e.g. Employee, Manager…"
                            className="h-7 text-xs"
                          />
                        </td>
                        {["hce", "key_employee", "eligible", "participating"].map((field) => (
                          <td key={field} className="text-center py-1.5 px-2">
                            <input
                              type="checkbox"
                              checked={emp[field]}
                              onChange={(e) => updateRow(emp.id, field, e.target.checked)}
                              className="w-4 h-4 accent-primary cursor-pointer"
                            />
                          </td>
                        ))}
                        <td className="py-1.5">
                          <button onClick={() => removeRow(emp.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={addRow} className="gap-2 text-muted-foreground">
                  <Plus className="w-3.5 h-3.5" /> Add Employee
                </Button>
                <Button size="sm" onClick={handleRunTests} className="gap-2">
                  <FlaskConical className="w-3.5 h-3.5" /> Run Tests
                </Button>
              </div>
            </>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-4 pt-2 border-t">
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 text-center">
                {[
                  { label: "Total", value: results.stats.totalEmployees },
                  { label: "Eligible", value: results.stats.eligibleCount },
                  { label: "Participating", value: results.stats.participatingCount },
                  { label: "HCE Part. Rate", value: `${results.stats.hcePartRate}%` },
                  { label: "NHCE Part. Rate", value: `${results.stats.nhcePartRate}%` },
                ].map((s) => (
                  <div key={s.label} className="bg-muted/40 rounded-lg p-2">
                    <p className="text-lg font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <TestResult
                  label="Eligibility Test"
                  pass={results.eligibilityPass}
                  detail={`NHCE eligibility rate: ${results.stats.nhceEligRate}% (must be ≥70% or ≥70% of HCE rate of ${results.stats.hceEligRate}%)`}
                />
                <TestResult
                  label="Benefits Test"
                  pass={results.benefitsPass}
                  detail={`NHCE participation rate: ${results.stats.nhcePartRate}% vs HCE rate: ${results.stats.hcePartRate}% (NHCE must be ≥70% of HCE rate)`}
                />
                <TestResult
                  label="Key Employee Concentration Test"
                  pass={results.concentrationPass}
                  detail={`Key employees represent ${results.stats.keyConcentration}% of plan benefits (limit: 25%)`}
                />
              </div>

              {(!results.eligibilityPass || !results.benefitsPass || !results.concentrationPass) && (
                <div className="flex gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>One or more tests failed. Consider broadening eligibility to more NHCEs or reviewing participation incentives. Consult a benefits attorney for guidance.</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}