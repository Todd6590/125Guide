import { format } from "date-fns";

function formatDate(d) {
  if (!d) return "___________";
  return format(new Date(d + "T00:00:00"), "MMMM d, yyyy");
}

function blank(val) {
  return val || "___________";
}

export default function ErisaWrapPreview({ plan }) {
  const p = plan;
  const showPOP = ["pop", "full_flex", "simple_cafeteria"].includes(p.plan_type);
  const showFSA = ["health_fsa", "full_flex", "simple_cafeteria"].includes(p.plan_type);
  const showLimitedFSA = p.plan_type === "limited_fsa";
  const showDCAP = ["dcap", "full_flex", "simple_cafeteria"].includes(p.plan_type);

  const addr = [p.employer_address, p.employer_city, p.employer_state, p.employer_zip]
    .filter(Boolean)
    .join(", ") || "___________";

  return (
    <div className="bg-white rounded-xl border shadow-sm max-w-4xl mx-auto">
      <div className="p-8 md:p-12 space-y-6 text-sm leading-relaxed text-foreground">
        {/* Header */}
        <div className="text-center space-y-2 pb-6 border-b">
          <h1 className="font-serif text-2xl font-bold uppercase tracking-wide">
            ERISA Wrap Summary Plan Description
          </h1>
          <p className="text-muted-foreground text-xs">
            As Required by the Employee Retirement Income Security Act of 1974 (ERISA)
          </p>
        </div>

        <p>
          This Summary Plan Description ("SPD") is furnished to you as required by the Employee Retirement Income Security
          Act of 1974, as amended ("ERISA"). This SPD describes the key features of the{" "}
          <strong>{blank(p.plan_name)}</strong> (the "Plan") sponsored by <strong>{blank(p.employer_name)}</strong>.
          This document, together with any insurance certificates, evidence of coverage documents, or other benefit materials
          provided to you, constitutes the complete SPD for the Plan.
        </p>

        <section className="space-y-2">
          <h3 className="font-serif font-bold text-base border-b pb-1">GENERAL PLAN INFORMATION</h3>
          <p><strong>Plan Name:</strong> {blank(p.plan_name)}</p>
          <p><strong>Plan Sponsor / Employer:</strong> {blank(p.employer_name)}, EIN: {blank(p.employer_ein)}</p>
          <p><strong>Employer Address:</strong> {addr}</p>
          {p.employer_phone && <p><strong>Employer Phone:</strong> {p.employer_phone}</p>}
          <p><strong>Plan Number:</strong> {blank(p.plan_number)}</p>
          <p><strong>Plan Year:</strong> {formatDate(p.plan_year_start)} through {formatDate(p.plan_year_end)}</p>
          <p><strong>Original Effective Date:</strong> {formatDate(p.effective_date)}</p>
          <p><strong>Type of Plan:</strong> Welfare Benefit Plan — Section 125 Cafeteria Plan</p>
          <p><strong>Type of Administration:</strong> Employer/Plan Administrator with Third-Party Administrator as applicable</p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif font-bold text-base border-b pb-1">PLAN ADMINISTRATOR</h3>
          <p>
            <strong>{blank(p.plan_administrator_name)}</strong>
            {p.plan_administrator_title ? `, ${p.plan_administrator_title}` : ""}<br />
            {blank(p.employer_name)}<br />
            {addr}
            {p.plan_administrator_phone && <><br />Phone: {p.plan_administrator_phone}</>}
            {p.plan_administrator_email && <><br />Email: {p.plan_administrator_email}</>}
          </p>
          <p>
            The Plan Administrator is responsible for the overall operation and administration of the Plan and is the agent
            for service of legal process. Service of legal process may also be made upon the Plan Sponsor at the address listed above.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif font-bold text-base border-b pb-1">PLAN FUNDING AND TYPE OF BENEFITS</h3>
          <p>
            The Plan is funded entirely through Participant salary reduction contributions and, where applicable, Employer
            contributions. Benefits are paid either directly by the insurance carrier or through reimbursement accounts
            maintained under the Plan. The Plan does not hold trust assets for welfare benefits subject to ERISA.
          </p>
          {p.claims_administrator && (
            <p><strong>Claims Administrator / TPA:</strong> {p.claims_administrator}</p>
          )}
        </section>

        <section className="space-y-2">
          <h3 className="font-serif font-bold text-base border-b pb-1">ELIGIBILITY FOR PARTICIPATION</h3>
          <p>
            {blank(p.eligibility_class || "All common-law employees of the Employer")} are eligible to participate in this
            Plan. Employees must satisfy any applicable waiting period before becoming eligible to enroll. See Article III
            of the Plan Document for complete eligibility requirements. Participation is voluntary.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif font-bold text-base border-b pb-1">BENEFITS PROVIDED UNDER THE PLAN</h3>
          <p>This Plan provides the following benefits, as elected by eligible Participants:</p>
          <ul className="list-disc ml-6 space-y-1">
            {showPOP && <li>Pre-Tax Premium Payment (POP) — allows eligible employees to pay their share of employer-sponsored insurance premiums on a pre-tax basis through salary reduction.</li>}
            {showFSA && <li>Health Flexible Spending Account (Health FSA) — allows eligible employees to set aside pre-tax dollars to pay for eligible medical, dental, and vision expenses under Section 213(d) of the Code.</li>}
            {showLimitedFSA && <li>Limited Purpose FSA — allows employees enrolled in an HSA-eligible HDHP to set aside pre-tax dollars for eligible dental and vision expenses only.</li>}
            {showDCAP && <li>Dependent Care Assistance Program (DCAP) — allows eligible employees to set aside pre-tax dollars for eligible dependent care expenses under Section 129 of the Code.</li>}
          </ul>
          <p className="text-xs text-muted-foreground italic">
            For full details on benefit limits, carryover, and grace periods, refer to Article IV of the Plan Document
            and any accompanying benefit summaries or insurance certificates.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif font-bold text-base border-b pb-1">COBRA CONTINUATION COVERAGE RIGHTS</h3>
          <p>
            If the Plan includes any group health benefits (such as a Health FSA or group medical premiums), Participants
            and their covered dependents may have the right to elect COBRA continuation coverage upon a qualifying event.
            Qualifying events include:
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Termination of employment (other than for gross misconduct)</li>
            <li>Reduction in hours of employment</li>
            <li>Death of the covered employee</li>
            <li>Divorce or legal separation from the covered employee</li>
            <li>Dependent child ceasing to be a dependent under Plan terms</li>
            <li>Employee becoming entitled to Medicare</li>
          </ul>
          <p>
            COBRA continuation coverage may be elected within 60 days of receiving notice. The cost may be up to 102% of
            the applicable premium. For the Health FSA, COBRA applies only if the employee has a positive account balance
            at the time of the qualifying event.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif font-bold text-base border-b pb-1">HIPAA SPECIAL ENROLLMENT RIGHTS</h3>
          <p>
            If the Plan includes group health benefits, Participants who lose other health coverage or who experience
            certain family status changes (marriage, birth, adoption, or placement for adoption) may be entitled to
            special enrollment rights under HIPAA. Special enrollment must generally be requested within 30 days of the
            qualifying event. Contact the Plan Administrator for more information.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif font-bold text-base border-b pb-1">PRIVACY OF HEALTH INFORMATION (HIPAA)</h3>
          <p>
            To the extent the Plan covers health benefits, the Plan is subject to HIPAA privacy and security rules.
            The Plan Sponsor has certified it will not use Protected Health Information (PHI) for employment-related
            actions and has agreed to safeguard PHI. Participants have the right to access and request amendment of
            their PHI. A separate HIPAA Notice of Privacy Practices is available from the Plan Administrator upon request.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif font-bold text-base border-b pb-1">WOMEN'S HEALTH AND CANCER RIGHTS ACT (WHCRA)</h3>
          <p>
            If the Plan provides medical and surgical benefits for mastectomy, it must also provide coverage for
            reconstructive surgery, prostheses, and physical complications including lymphedemas. Contact the Plan
            Administrator or applicable insurance carrier for details.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif font-bold text-base border-b pb-1">NEWBORNS' AND MOTHERS' HEALTH PROTECTION ACT</h3>
          <p>
            If the Plan provides maternity or newborn infant care benefits, the Plan may not restrict benefits for a
            hospital stay to less than 48 hours following a normal vaginal delivery or 96 hours following a cesarean
            section. Contact the Plan Administrator or applicable insurance carrier for details.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif font-bold text-base border-b pb-1">CLAIMS AND APPEALS PROCEDURES</h3>
          <p><strong>Filing a Claim:</strong> All claims must be submitted in writing within{" "}
            {blank(p.claims_filing_deadline || "90 days")} following the end of the Plan Year in which the expense was incurred.</p>
          <p><strong>Claim Denial:</strong> If your claim is wholly or partially denied, you will receive written notice within
            30 days explaining the reason for denial, the Plan provisions relied upon, and a description of the appeals process.</p>
          <p><strong>Appeals:</strong> You may appeal a denied claim within 180 days of receiving the denial notice. A decision
            will be rendered within 60 days, with a possible 45-day extension.</p>
          <p><strong>External Review:</strong> For health benefit claims, if your internal appeal is denied, you may have the
            right to request an independent external review. Contact the Plan Administrator for more information.</p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif font-bold text-base border-b pb-1">YOUR RIGHTS UNDER ERISA</h3>
          <p>As a participant in this Plan, you are entitled to certain rights and protections under ERISA:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Receive information about the Plan and benefits.</strong> Examine, without charge, all Plan documents at the Plan Administrator's office, including the latest annual report (Form 5500 Series, if applicable). Obtain copies upon written request (a reasonable copy fee may be charged).</li>
            <li><strong>Continue group health plan coverage.</strong> Continue health care coverage for yourself, your spouse, or your dependents following a COBRA qualifying event.</li>
            <li><strong>Prudent actions by plan fiduciaries.</strong> Plan fiduciaries have a duty to act prudently and in the interest of all Plan Participants and beneficiaries.</li>
            <li><strong>Enforce your rights.</strong> If your claim is denied or ignored, you have the right to know why, obtain copies of relevant documents without charge, and appeal within certain time schedules. You may also file suit in federal court.</li>
            <li><strong>Assistance with questions.</strong> Contact the nearest office of the Employee Benefits Security Administration (EBSA), U.S. Department of Labor, or visit <em>www.dol.gov/ebsa</em>.</li>
          </ul>
          <p>
            No one, including your employer, may fire you or otherwise discriminate against you for exercising your ERISA rights.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif font-bold text-base border-b pb-1">AMENDMENT AND TERMINATION</h3>
          <p>
            The Employer reserves the right to amend, modify, or terminate this Plan at any time, subject to applicable law.
            Participants will be notified as required. No amendment or termination shall reduce or eliminate any benefit to
            which a Participant is already entitled.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif font-bold text-base border-b pb-1">AGENT FOR SERVICE OF LEGAL PROCESS</h3>
          <p>
            Legal process may be served upon: <strong>{blank(p.plan_administrator_name)}</strong>, Plan Administrator,{" "}
            <strong>{blank(p.employer_name)}</strong>, {addr}.
          </p>
        </section>

        <p className="text-xs text-muted-foreground italic pt-4 border-t">
          This ERISA Wrap Summary Plan Description is incorporated into and made a part of the {blank(p.plan_name)}.
          Prepared for the Plan Year beginning {formatDate(p.plan_year_start)}.
        </p>
      </div>
    </div>
  );
}