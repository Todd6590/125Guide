import { PLAN_TYPE_INFO } from "./PlanTypeCard";
import { format } from "date-fns";

function formatDate(d) {
  if (!d) return "___________";
  return format(new Date(d + "T00:00:00"), "MMMM d, yyyy");
}

function blank(val) {
  return val || "___________";
}

const WAITING_TEXT = {
  none: "immediately upon meeting all other eligibility requirements",
  first_of_month: "on the first day of the month following the date of hire",
  "30_days": "after completing 30 days of service",
  "60_days": "after completing 60 days of service",
  "90_days": "after completing 90 days of service",
  first_of_month_30: "on the first day of the month following 30 days of service",
  first_of_month_60: "on the first day of the month following 60 days of service",
  first_of_month_90: "on the first day of the month following 90 days of service",
};

const ENTRY_TEXT = {
  immediate: "immediately upon satisfying the eligibility requirements",
  first_of_month: "on the first day of the month coinciding with or next following the date eligibility requirements are satisfied",
  quarterly: "on the first day of each calendar quarter (January 1, April 1, July 1, or October 1) coinciding with or next following the date eligibility requirements are satisfied",
  semi_annual: "on a semi-annual basis (January 1 or July 1) coinciding with or next following the date eligibility requirements are satisfied",
  annual: "on the first day of each Plan Year coinciding with or next following the date eligibility requirements are satisfied",
};

export default function PlanDocumentPreview({ plan }) {
  const p = plan;
  const typeInfo = PLAN_TYPE_INFO[p.plan_type] || {};
  const showPOP = ["pop", "full_flex", "simple_cafeteria"].includes(p.plan_type);
  const showFSA = ["health_fsa", "full_flex", "simple_cafeteria"].includes(p.plan_type);
  const showDCAP = ["dcap", "full_flex", "simple_cafeteria"].includes(p.plan_type);

  const addr = [p.employer_address, p.employer_city, p.employer_state, p.employer_zip]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="bg-white rounded-xl border shadow-sm max-w-4xl mx-auto">
      <div className="p-8 md:p-12 space-y-8 text-sm leading-relaxed text-foreground print:text-black">
        {/* Title Page */}
        <div className="text-center space-y-4 pb-8 border-b">
          <h1 className="font-serif text-2xl md:text-3xl font-bold uppercase tracking-wide">
            {blank(p.plan_name)}
          </h1>
          <p className="text-base text-muted-foreground">
            A Section 125 {typeInfo.title || "Cafeteria"} Plan
          </p>
          <div className="text-muted-foreground space-y-1">
            <p>Sponsored by: <strong>{blank(p.employer_name)}</strong></p>
            <p>EIN: {blank(p.employer_ein)}</p>
            <p>Plan Number: {blank(p.plan_number)}</p>
            <p>Effective Date: {formatDate(p.effective_date)}</p>
          </div>
        </div>

        {/* Article I */}
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold">ARTICLE I — PURPOSE</h2>
          <p>
            <strong>{blank(p.employer_name)}</strong> (hereinafter referred to as the "Employer") hereby establishes
            the <strong>{blank(p.plan_name)}</strong> (hereinafter referred to as the "Plan") effective{" "}
            {formatDate(p.effective_date)}. The purpose of this Plan is to allow eligible Employees to elect to
            receive certain benefits on a pre-tax basis pursuant to Section 125 of the Internal Revenue Code of 1986,
            as amended.
          </p>
        </section>

        {/* Article II */}
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold">ARTICLE II — DEFINITIONS</h2>
          <p><strong>2.1 "Employer"</strong> means {blank(p.employer_name)}, located at {blank(addr)}, or any successor thereto.</p>
          <p><strong>2.2 "Plan Administrator"</strong> means {blank(p.plan_administrator_name)}{p.plan_administrator_title ? `, ${p.plan_administrator_title}` : ""}, who shall be responsible for the day-to-day administration of this Plan. The Plan Administrator may be contacted at {blank(p.plan_administrator_email || p.plan_administrator_phone)}.</p>
          <p><strong>2.3 "Plan Year"</strong> means the 12-month period beginning {formatDate(p.plan_year_start)} and ending {formatDate(p.plan_year_end)}.</p>
          <p><strong>2.4 "Participant"</strong> means any eligible Employee who has enrolled in this Plan in accordance with Article III.</p>
          <p><strong>2.5 "Compensation"</strong> means the total wages, salary, and other earnings paid to an Employee by the Employer during the Plan Year.</p>
          {showFSA && (
            <p><strong>2.6 "Health Flexible Spending Account" or "Health FSA"</strong> means an account established under this Plan from which eligible medical care expenses (as defined under Section 213(d) of the Code) may be reimbursed.</p>
          )}
          {showDCAP && (
            <p><strong>2.{showFSA ? "7" : "6"} "Dependent Care Assistance Account" or "DCAP"</strong> means an account established under this Plan from which eligible dependent care expenses (as defined under Section 129 of the Code) may be reimbursed.</p>
          )}
        </section>

        {/* Article III */}
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold">ARTICLE III — ELIGIBILITY AND PARTICIPATION</h2>
          <p><strong>3.1 Eligible Employees.</strong> {blank(p.eligibility_class || "All common-law employees of the Employer")} shall be eligible to participate in this Plan.</p>
          <p><strong>3.2 Waiting Period.</strong> An eligible Employee may enter the Plan {WAITING_TEXT[p.waiting_period] || blank(null)}.{p.hours_required ? ` Employees must be regularly scheduled for at least ${p.hours_required} hours per week.` : ""}</p>
          <p><strong>3.3 Entry Date.</strong> An eligible Employee shall become a Participant {ENTRY_TEXT[p.entry_dates] || blank(null)}.</p>
          <p><strong>3.4 Termination of Participation.</strong> A Participant shall cease to be a Participant on the earliest of: (a) the date the Plan is terminated; (b) the date the Participant ceases to be an eligible Employee; or (c) the end of the Plan Year in which the Participant revokes their election.</p>
          {p.plan_type === "simple_cafeteria" && p.total_employees && (
            <p><strong>3.5 Simple Cafeteria Plan.</strong> The Employer represents that it employs an average of {p.total_employees} employees during either of the two preceding years, which satisfies the requirement of 100 or fewer employees for a simple cafeteria plan under Section 125(j) of the Code.</p>
          )}
        </section>

        {/* Article IV */}
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold">ARTICLE IV — BENEFITS</h2>

          {showPOP && (
            <>
              <p><strong>4.1 Premium Payment Benefit.</strong> A Participant may elect to have their share of the premiums for the following employer-sponsored benefit plans paid on a pre-tax basis through salary reduction:</p>
              {p.benefits_offered?.length > 0 ? (
                <ul className="list-disc ml-6 space-y-1">
                  {p.benefits_offered.map((b) => <li key={b}>{b}</li>)}
                </ul>
              ) : (
                <p className="ml-6 text-muted-foreground italic">[Benefits to be specified]</p>
              )}
            </>
          )}

          {showFSA && (
            <>
              <p><strong>4.{showPOP ? "2" : "1"} Health Flexible Spending Account.</strong> A Participant may elect to contribute to a Health FSA on a pre-tax basis through salary reduction. The maximum annual election is <strong>${blank(p.fsa_max_election?.toLocaleString())}</strong> and the minimum annual election is <strong>${blank(p.fsa_min_election?.toLocaleString())}</strong>. Reimbursements shall be made for eligible medical care expenses as defined under Section 213(d) of the Code incurred by the Participant, their spouse, or eligible dependents during the Plan Year.</p>
              {p.fsa_grace_period && (
                <p><strong>Grace Period.</strong> A Participant shall have an additional period of two (2) months and fifteen (15) days following the end of the Plan Year to incur eligible expenses that may be reimbursed from any unused balance in the Health FSA from the immediately preceding Plan Year.</p>
              )}
              {p.fsa_carryover && (
                <p><strong>Carryover.</strong> Up to <strong>${blank(p.fsa_carryover_amount?.toLocaleString())}</strong> of unused Health FSA amounts remaining at the end of a Plan Year may be carried over and used to pay eligible expenses in the immediately following Plan Year.</p>
              )}
              {!p.fsa_grace_period && !p.fsa_carryover && (
                <p><strong>Use-It-or-Lose-It.</strong> Any unused Health FSA balance at the end of the Plan Year (and any applicable run-out period) shall be forfeited.</p>
              )}
              <p><strong>Uniform Coverage.</strong> The full annual election amount shall be available to the Participant at all times during the Plan Year, regardless of the amount of contributions made to date.</p>
            </>
          )}

          {showDCAP && (
            <>
              <p><strong>4.{showPOP && showFSA ? "3" : showPOP || showFSA ? "2" : "1"} Dependent Care Assistance Account.</strong> A Participant may elect to contribute to a DCAP on a pre-tax basis through salary reduction. The maximum annual election is <strong>${blank(p.dcap_max_election?.toLocaleString())}</strong> and the minimum annual election is <strong>${blank(p.dcap_min_election?.toLocaleString())}</strong>. The statutory maximum is $5,000 per year ($2,500 if married filing separately). Reimbursements shall be made for eligible dependent care expenses as defined under Section 129 of the Code.</p>
            </>
          )}

          {p.employer_contribution && (
            <p><strong>Employer Contributions.</strong> {blank(p.employer_contribution_amount)}</p>
          )}
        </section>

        {/* Article V */}
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold">ARTICLE V — ELECTIONS</h2>
          <p><strong>5.1 Initial Election.</strong> Each eligible Employee shall make an initial election during the enrollment period established by the Plan Administrator prior to the date on which they first become a Participant.</p>
          <p><strong>5.2 Annual Election.</strong> Prior to the beginning of each Plan Year, each Participant shall make a new election for the upcoming Plan Year during the open enrollment period established by the Plan Administrator.</p>
          <p><strong>5.3 Changes in Elections.</strong> A Participant may change or revoke an election during a Plan Year only upon the occurrence of a "change in status" event as permitted under Treasury Regulation §1.125-4, including but not limited to:</p>
          {p.election_change_events?.length > 0 ? (
            <ul className="list-disc ml-6 space-y-1">
              {p.election_change_events.map((e) => <li key={e}>{e}</li>)}
            </ul>
          ) : (
            <p className="ml-6 text-muted-foreground italic">[Qualifying events to be specified]</p>
          )}
          <p>Any election change must be consistent with the change in status event and must be made within 30 days of the event.</p>
        </section>

        {/* Article VI */}
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold">ARTICLE VI — CLAIMS PROCEDURES</h2>
          <p><strong>6.1 Claims Administrator.</strong> {p.claims_administrator ? `Claims shall be administered by ${p.claims_administrator}.` : "The Plan Administrator shall serve as the Claims Administrator."} All claims for benefits under this Plan must be submitted in writing using forms prescribed by the Claims Administrator.</p>
          <p><strong>6.2 Filing Deadline.</strong> Claims must be submitted within {blank(p.claims_filing_deadline || "90 days")} after the end of the Plan Year in which the expense was incurred.</p>
          <p><strong>6.3 Denied Claims.</strong> If a claim is denied in whole or in part, the Claims Administrator shall notify the claimant in writing within 30 days. The notice shall include the reason for denial, references to relevant Plan provisions, and a description of the appeals process.</p>
          <p><strong>6.4 Appeals.</strong> A claimant may file a written appeal within 180 days of receiving a denial. The Plan Administrator shall review the appeal and issue a decision within 60 days.</p>
        </section>

        {/* Article VII */}
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold">ARTICLE VII — GENERAL PROVISIONS</h2>
          <p><strong>7.1 Amendment and Termination.</strong> The Employer reserves the right to amend or terminate this Plan at any time by written action.</p>
          <p><strong>7.2 Non-Discrimination.</strong> {p.plan_type === "simple_cafeteria" ? "This Plan is intended to be a Simple Cafeteria Plan under Section 125(j) of the Code and is deemed to satisfy the nondiscrimination requirements of Section 125." : "This Plan is intended to satisfy the nondiscrimination requirements of Section 125 of the Code. The Plan Administrator shall conduct appropriate nondiscrimination testing as required."}</p>
          <p><strong>7.3 HIPAA Privacy.</strong> The Plan shall comply with the privacy and security requirements of the Health Insurance Portability and Accountability Act of 1996 (HIPAA), as applicable.</p>
          <p><strong>7.4 COBRA.</strong> If applicable, the Employer shall offer continuation coverage as required by the Consolidated Omnibus Budget Reconciliation Act of 1985 (COBRA).</p>
          <p><strong>7.5 Governing Law.</strong> This Plan shall be construed in accordance with applicable federal law and, to the extent not preempted, the laws of the state in which the Employer is located.</p>
          <p><strong>7.6 No Guarantee of Employment.</strong> Nothing in this Plan shall be construed as a contract of employment or as granting any Employee the right to continued employment.</p>
        </section>

        {/* Signature */}
        <section className="space-y-6 pt-8 border-t">
          <h2 className="font-serif text-lg font-bold">ADOPTION OF PLAN</h2>
          <p>
            IN WITNESS WHEREOF, <strong>{blank(p.employer_name)}</strong> has caused this Plan to be executed
            on this _____ day of ____________, ______.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
            <div className="space-y-4">
              <div className="border-b border-foreground/30 pb-1">
                <p className="text-xs text-muted-foreground">Signature of Authorized Representative</p>
              </div>
              <div className="border-b border-foreground/30 pb-1">
                <p className="text-xs text-muted-foreground">Print Name and Title</p>
              </div>
              <div className="border-b border-foreground/30 pb-1">
                <p className="text-xs text-muted-foreground">Date</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}