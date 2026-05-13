import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Info } from "lucide-react";

const REMEDIATION = {
  eligibility: [
    "Expand plan eligibility to include more NHCE groups (e.g., reduce the waiting period or lower the hours-per-week threshold).",
    "Review part-time and seasonal employee classifications — if they meet the hours threshold they may need to be offered eligibility.",
    "Consider adopting the 'ratio percentage test' safe harbor by ensuring NHCE eligibility rate is at least 70%.",
    "Document all exclusion categories carefully; excluded groups must meet IRS narrow exception requirements.",
  ],
  benefits: [
    "Increase NHCE awareness and enrollment through open enrollment communications and plan education.",
    "Offer employer contributions or matching HSA/FSA seed amounts to incentivize NHCE participation.",
    "Simplify the enrollment process to reduce friction for NHCEs.",
    "Review and lower the minimum election amount to make participation more accessible.",
    "Consider auto-enrollment for NHCEs with an opt-out, subject to plan design review.",
  ],
  concentration: [
    "Review whether key employees' elections are disproportionately high.",
    "Reduce key employee benefit elections or cap at a lower amount.",
    "Encourage broader NHCE participation to reduce the key employee concentration percentage.",
    "Consider restructuring benefit tiers so key employees do not skew the total benefit pool.",
  ],
  adp: [
    "Cap HCE FSA/DCAP elections to bring the average closer to 125% of NHCE average.",
    "Run a corrective distribution or use excess benefits recharacterization before year-end.",
    "Increase NHCE awareness of available FSA/DCAP benefits to raise their average elections.",
    "Work with your TPA to run mid-year ADP projections and adjust HCE limits proactively.",
  ],
};

function TestRow({ label, pass, detail, remediation }) {
  return (
    <div className={`rounded-xl border p-4 space-y-2 ${pass ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
      <div className="flex items-start gap-3">
        {pass
          ? <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          : <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className={`font-semibold text-sm ${pass ? "text-green-800" : "text-red-800"}`}>{label}</p>
            <Badge className={`text-xs ${pass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {pass ? "PASS" : "FAIL"}
            </Badge>
          </div>
          <p className={`text-xs mt-1 ${pass ? "text-green-700" : "text-red-700"}`}>{detail}</p>
        </div>
      </div>
      {!pass && remediation && (
        <div className="pl-8 space-y-1.5">
          <p className="text-xs font-semibold text-red-800 uppercase tracking-wide">Remediation Steps</p>
          <ul className="space-y-1">
            {remediation.map((step, i) => (
              <li key={i} className="flex gap-2 text-xs text-red-700">
                <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-red-200 text-red-800 flex items-center justify-center font-bold text-[10px]">{i + 1}</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function NDTResultReport({ results, planName, testYear }) {
  const { stats, eligibilityPass, benefitsPass, concentrationPass, adpPass, adpTestApplicable } = results;
  const allPass = eligibilityPass && benefitsPass && concentrationPass && adpPass;

  return (
    <div className="space-y-5">
      <div className={`rounded-xl border-2 p-4 flex items-center gap-4 ${allPass ? "bg-green-50 border-green-400" : "bg-red-50 border-red-400"}`}>
        {allPass
          ? <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
          : <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />}
        <div>
          <p className={`font-bold text-lg ${allPass ? "text-green-800" : "text-red-800"}`}>
            {allPass ? "All Tests Passed" : "One or More Tests Failed"}
          </p>
          <p className={`text-sm ${allPass ? "text-green-700" : "text-red-700"}`}>
            {planName} — Plan Year {testYear}
          </p>
        </div>
        <Badge className={`ml-auto text-base px-4 py-1 ${allPass ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {allPass ? "PASS" : "FAIL"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Participants", value: stats.totalParticipants },
          { label: "HCEs", value: stats.hceCount },
          { label: "NHCEs", value: stats.nhceCount },
          { label: "Participating", value: stats.participatingCount },
          { label: "HCE Elig. Rate", value: `${stats.hceEligRate}%` },
          { label: "NHCE Elig. Rate", value: `${stats.nhceEligRate}%` },
          { label: "HCE Part. Rate", value: `${stats.hcePartRate}%` },
          { label: "NHCE Part. Rate", value: `${stats.nhcePartRate}%` },
        ].map((s) => (
          <div key={s.label} className="bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <TestRow
          label="Eligibility Test (IRC §125(b))"
          pass={eligibilityPass}
          detail={`NHCE eligibility rate: ${stats.nhceEligRate}% (must be ≥70%, or ≥70% of HCE rate of ${stats.hceEligRate}%)`}
          remediation={REMEDIATION.eligibility}
        />
        <TestRow
          label="Benefits / Participation Test (IRC §125(b))"
          pass={benefitsPass}
          detail={`NHCE participation rate: ${stats.nhcePartRate}% vs HCE rate: ${stats.hcePartRate}% (NHCE must be ≥70% of HCE rate)`}
          remediation={REMEDIATION.benefits}
        />
        <TestRow
          label="Key Employee Concentration Test (IRC §125(b)(2))"
          pass={concentrationPass}
          detail={`Key employees represent ${stats.keyConcentration}% of plan benefits (IRS limit: 25%)`}
          remediation={REMEDIATION.concentration}
        />
        {adpTestApplicable && (
          <TestRow
            label="Average Deferral Percentage (ADP) Test"
            pass={adpPass}
            detail={`HCE avg election: $${stats.hceAvgElection.toLocaleString()} vs NHCE avg: $${stats.nhceAvgElection.toLocaleString()}${stats.adpRatio ? ` (ratio: ${stats.adpRatio}x, limit 1.25x)` : ""}`}
            remediation={REMEDIATION.adp}
          />
        )}
      </div>

      <div className="flex gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>This report is for informational purposes only and does not constitute legal or tax advice. Consult a qualified benefits attorney or CPA before taking corrective action.</span>
      </div>
    </div>
  );
}