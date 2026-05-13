import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { PLAN_TYPE_INFO } from "@/components/plans/PlanTypeCard";

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

export function generatePlanPDF(plan) {
  const p = plan;
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const typeInfo = PLAN_TYPE_INFO[p.plan_type] || {};
  const showPOP = ["pop", "full_flex", "simple_cafeteria"].includes(p.plan_type);
  const showFSA = ["health_fsa", "full_flex", "simple_cafeteria"].includes(p.plan_type);
  const showLimitedFSA = p.plan_type === "limited_fsa";
  const showDCAP = ["dcap", "full_flex", "simple_cafeteria"].includes(p.plan_type);

  const addr = [p.employer_address, p.employer_city, p.employer_state, p.employer_zip]
    .filter(Boolean)
    .join(", ");

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginL = 72;
  const marginR = 72;
  const contentW = pageW - marginL - marginR;
  let y = 72;

  function checkPageBreak(needed = 40) {
    if (y + needed > pageH - 72) {
      doc.addPage();
      y = 72;
    }
  }

  function addHeading1(text) {
    checkPageBreak(50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text(text, pageW / 2, y, { align: "center" });
    y += 28;
  }

  function addHeading2(text) {
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    // underline simulation
    doc.text(text, marginL, y);
    const textW = doc.getTextWidth(text);
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.75);
    doc.line(marginL, y + 2, marginL + textW, y + 2);
    y += 20;
  }

  function addParagraph(text, options = {}) {
    checkPageBreak(30);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    const lines = doc.splitTextToSize(text, contentW);
    lines.forEach((line) => {
      checkPageBreak(14);
      doc.text(line, marginL, y);
      y += 14;
    });
    y += 4;
  }

  function addBoldParagraph(boldPart, normalPart) {
    checkPageBreak(30);
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);

    // Combine bold + normal text, then wrap the whole thing
    const fullText = boldPart + normalPart;
    const lines = doc.splitTextToSize(fullText, contentW);

    lines.forEach((line, idx) => {
      checkPageBreak(14);
      if (idx === 0) {
        // First line: render bold part then normal
        const boldWidth = doc.getStringUnitWidth(boldPart) * 10 / doc.internal.scaleFactor;
        doc.setFont("helvetica", "bold");
        doc.text(boldPart, marginL, y);
        doc.setFont("helvetica", "normal");
        const remainder = line.slice(boldPart.length);
        doc.text(remainder, marginL + boldWidth, y);
      } else {
        doc.setFont("helvetica", "normal");
        doc.text(line, marginL, y);
      }
      y += 14;
    });
    y += 4;
  }

  function addBulletList(items) {
    items.forEach((item) => {
      checkPageBreak(16);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text("•", marginL + 10, y);
      const lines = doc.splitTextToSize(item, contentW - 20);
      lines.forEach((line, i) => {
        checkPageBreak(14);
        doc.text(line, marginL + 22, y);
        y += 14;
      });
    });
    y += 4;
  }

  function addDivider() {
    checkPageBreak(20);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(marginL, y, pageW - marginR, y);
    y += 14;
  }

  function addSpacer(h = 10) {
    y += h;
  }

  // ── TITLE PAGE ──
  addSpacer(40);
  addHeading1(blank(p.plan_name).toUpperCase());
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`A Section 125 ${typeInfo.title || "Cafeteria"} Plan`, pageW / 2, y, { align: "center" });
  y += 22;
  addDivider();
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Sponsored by: ${blank(p.employer_name)}`, pageW / 2, y, { align: "center" }); y += 16;
  doc.text(`EIN: ${blank(p.employer_ein)}`, pageW / 2, y, { align: "center" }); y += 16;
  doc.text(`Plan Number: ${blank(p.plan_number)}`, pageW / 2, y, { align: "center" }); y += 16;
  doc.text(`Effective Date: ${formatDate(p.effective_date)}`, pageW / 2, y, { align: "center" }); y += 16;
  addDivider();
  addSpacer(10);

  // ── ARTICLE I ──
  addHeading2("ARTICLE I — PURPOSE");
  addParagraph(
    `${blank(p.employer_name)} (hereinafter referred to as the "Employer") hereby establishes the ` +
    `${blank(p.plan_name)} (hereinafter referred to as the "Plan") effective ${formatDate(p.effective_date)}. ` +
    `The purpose of this Plan is to allow eligible Employees to elect to receive certain benefits on a pre-tax basis ` +
    `pursuant to Section 125 of the Internal Revenue Code of 1986, as amended.`
  );

  // ── ARTICLE II ──
  addHeading2("ARTICLE II — DEFINITIONS");
  addBoldParagraph('2.1 "Employer" ', `means ${blank(p.employer_name)}, located at ${blank(addr)}, or any successor thereto.`);
  addBoldParagraph('2.2 "Plan Administrator" ', `means ${blank(p.plan_administrator_name)}${p.plan_administrator_title ? `, ${p.plan_administrator_title}` : ""}, who shall be responsible for the day-to-day administration of this Plan. Contact: ${blank(p.plan_administrator_email || p.plan_administrator_phone)}.`);
  addBoldParagraph('2.3 "Plan Year" ', `means the 12-month period beginning ${formatDate(p.plan_year_start)} and ending ${formatDate(p.plan_year_end)}.`);
  addBoldParagraph('2.4 "Participant" ', `means any eligible Employee who has enrolled in this Plan in accordance with Article III.`);
  addBoldParagraph('2.5 "Compensation" ', `means the total wages, salary, and other earnings paid to an Employee by the Employer during the Plan Year.`);
  if (showFSA) addBoldParagraph('2.6 "Health Flexible Spending Account" or "Health FSA" ', `means an account established under this Plan from which eligible medical care expenses (as defined under Section 213(d) of the Code) may be reimbursed.`);
  if (showLimitedFSA) addBoldParagraph('2.6 "Limited Purpose Flexible Spending Account" or "Limited Purpose FSA" ', `means an account established under this Plan from which eligible dental and vision care expenses only (as defined under Section 213(d) of the Code) may be reimbursed. This account is designed for Participants who are also contributing to a Health Savings Account (HSA) and are enrolled in a High Deductible Health Plan (HDHP).`);
  if (showDCAP) addBoldParagraph(`2.${showFSA ? "7" : "6"} "Dependent Care Assistance Account" or "DCAP" `, `means an account established under this Plan from which eligible dependent care expenses (as defined under Section 129 of the Code) may be reimbursed.`);

  // ── ARTICLE III ──
  addHeading2("ARTICLE III — ELIGIBILITY AND PARTICIPATION");
  addBoldParagraph("3.1 Eligible Employees. ", `${blank(p.eligibility_class || "All common-law employees of the Employer")} shall be eligible to participate in this Plan.`);
  addBoldParagraph("3.2 Waiting Period. ", `An eligible Employee may enter the Plan ${WAITING_TEXT[p.waiting_period] || blank(null)}.${p.hours_required ? ` Employees must be regularly scheduled for at least ${p.hours_required} hours per week.` : ""}`);
  addBoldParagraph("3.3 Entry Date. ", `An eligible Employee shall become a Participant ${ENTRY_TEXT[p.entry_dates] || blank(null)}.`);
  addBoldParagraph("3.4 Termination of Participation. ", `A Participant shall cease to be a Participant on the earliest of: (a) the date the Plan is terminated; (b) the date the Participant ceases to be an eligible Employee; or (c) the end of the Plan Year in which the Participant revokes their election.`);
  if (p.plan_type === "simple_cafeteria" && p.total_employees) {
    addBoldParagraph("3.5 Simple Cafeteria Plan. ", `The Employer represents that it employs an average of ${p.total_employees} employees during either of the two preceding years, which satisfies the requirement of 100 or fewer employees for a simple cafeteria plan under Section 125(j) of the Code.`);
  }

  // ── ARTICLE IV ──
  addHeading2("ARTICLE IV — BENEFITS");
  if (showPOP) {
    addBoldParagraph("4.1 Premium Payment Benefit. ", "A Participant may elect to have their share of the premiums for the following employer-sponsored benefit plans paid on a pre-tax basis through salary reduction:");
    if (p.benefits_offered?.length > 0) addBulletList(p.benefits_offered);
  }
  if (showFSA) {
    addBoldParagraph(`4.${showPOP ? "2" : "1"} Health Flexible Spending Account. `, `A Participant may elect to contribute to a Health FSA on a pre-tax basis through salary reduction. The maximum annual election is $${blank(p.fsa_max_election?.toLocaleString())} and the minimum annual election is $${blank(p.fsa_min_election?.toLocaleString())}. Reimbursements shall be made for eligible medical care expenses incurred by the Participant, their spouse, or eligible dependents during the Plan Year.`);
    if (p.fsa_grace_period) addBoldParagraph("Grace Period. ", "A Participant shall have an additional period of two (2) months and fifteen (15) days following the end of the Plan Year to incur eligible expenses reimbursable from any unused Health FSA balance.");
    if (p.fsa_carryover) addBoldParagraph("Carryover. ", `Up to $${blank(p.fsa_carryover_amount?.toLocaleString())} of unused Health FSA amounts remaining at the end of a Plan Year may be carried over to the immediately following Plan Year.`);
    if (!p.fsa_grace_period && !p.fsa_carryover) addBoldParagraph("Use-It-or-Lose-It. ", "Any unused Health FSA balance at the end of the Plan Year (and any applicable run-out period) shall be forfeited.");
    addBoldParagraph("Uniform Coverage. ", "The full annual election amount shall be available to the Participant at all times during the Plan Year, regardless of the amount of contributions made to date.");
  }
  if (showLimitedFSA) {
    addBoldParagraph("4.1 Limited Purpose Flexible Spending Account. ", `A Participant enrolled in an HSA-compatible HDHP and contributing to an HSA may elect to contribute to a Limited Purpose FSA on a pre-tax basis. Reimbursements are limited exclusively to eligible dental and vision expenses. The maximum annual election is $${blank(p.limited_fsa_max_election?.toLocaleString())} and the minimum is $${blank(p.limited_fsa_min_election?.toLocaleString())}.`);
    if (p.limited_fsa_grace_period) addBoldParagraph("Grace Period. ", "A Participant shall have an additional 2 months and 15 days following the Plan Year end to incur eligible dental and vision expenses reimbursable from any unused Limited FSA balance.");
    if (p.limited_fsa_carryover) addBoldParagraph("Carryover. ", `Up to $${blank(p.limited_fsa_carryover_amount?.toLocaleString())} of unused Limited Purpose FSA amounts may be carried over to the immediately following Plan Year.`);
    if (!p.limited_fsa_grace_period && !p.limited_fsa_carryover) addBoldParagraph("Use-It-or-Lose-It. ", "Any unused Limited Purpose FSA balance at the end of the Plan Year shall be forfeited.");
    addBoldParagraph("HSA Compatibility. ", "This Limited Purpose FSA is designed to be compatible with HSA eligibility under Section 223 of the Code.");
  }
  if (showDCAP) {
    addBoldParagraph(`4.${showPOP && showFSA ? "3" : showPOP || showFSA ? "2" : "1"} Dependent Care Assistance Account. `, `A Participant may elect to contribute to a DCAP on a pre-tax basis. The maximum annual election is $${blank(p.dcap_max_election?.toLocaleString())} and the minimum is $${blank(p.dcap_min_election?.toLocaleString())}. The statutory maximum is $5,000 per year ($2,500 if married filing separately).`);
  }
  if (p.employer_contribution) addBoldParagraph("Employer Contributions. ", blank(p.employer_contribution_amount));

  // ── ARTICLE V ──
  addHeading2("ARTICLE V — ELECTIONS");
  addBoldParagraph("5.1 Initial Election. ", "Each eligible Employee shall make an initial election during the enrollment period established by the Plan Administrator prior to the date on which they first become a Participant.");
  addBoldParagraph("5.2 Annual Election. ", "Prior to the beginning of each Plan Year, each Participant shall make a new election for the upcoming Plan Year during the open enrollment period established by the Plan Administrator.");
  addBoldParagraph("5.3 Changes in Elections. ", "A Participant may change or revoke an election during a Plan Year only upon the occurrence of a \"change in status\" event as permitted under Treasury Regulation §1.125-4, including but not limited to:");
  if (p.election_change_events?.length > 0) addBulletList(p.election_change_events);
  addParagraph("Any election change must be consistent with the change in status event and must be made within 30 days of the event.");

  // ── ARTICLE VI ──
  addHeading2("ARTICLE VI — CLAIMS PROCEDURES");
  addBoldParagraph("6.1 Claims Administrator. ", `${p.claims_administrator ? `Claims shall be administered by ${p.claims_administrator}.` : "The Plan Administrator shall serve as the Claims Administrator."} All claims must be submitted in writing using forms prescribed by the Claims Administrator.`);
  addBoldParagraph("6.2 Filing Deadline. ", `Claims must be submitted within ${blank(p.claims_filing_deadline || "90 days")} after the end of the Plan Year in which the expense was incurred.`);
  addBoldParagraph("6.3 Denied Claims. ", "If a claim is denied in whole or in part, the Claims Administrator shall notify the claimant in writing within 30 days, including the reason for denial and a description of the appeals process.");
  addBoldParagraph("6.4 Appeals. ", "A claimant may file a written appeal within 180 days of receiving a denial. The Plan Administrator shall review and issue a decision within 60 days.");

  // ── ARTICLE VII ──
  addHeading2("ARTICLE VII — GENERAL PROVISIONS");
  addBoldParagraph("7.1 Amendment and Termination. ", "The Employer reserves the right to amend or terminate this Plan at any time by written action.");
  addBoldParagraph("7.2 Non-Discrimination. ", p.plan_type === "simple_cafeteria"
    ? "This Plan is intended to be a Simple Cafeteria Plan under Section 125(j) of the Code and is deemed to satisfy the nondiscrimination requirements of Section 125."
    : "This Plan is intended to satisfy the nondiscrimination requirements of Section 125 of the Code. The Plan Administrator shall conduct appropriate nondiscrimination testing as required.");
  addBoldParagraph("7.3 HIPAA Privacy. ", "The Plan shall comply with the privacy and security requirements of HIPAA, as applicable.");
  addBoldParagraph("7.4 COBRA. ", "If applicable, the Employer shall offer continuation coverage as required by COBRA.");
  addBoldParagraph("7.5 Governing Law. ", "This Plan shall be construed in accordance with applicable federal law and, to the extent not preempted, the laws of the state in which the Employer is located.");
  addBoldParagraph("7.6 No Guarantee of Employment. ", "Nothing in this Plan shall be construed as a contract of employment or as granting any Employee the right to continued employment.");

  // ── SIGNATURE ──
  checkPageBreak(160);
  addDivider();
  addHeading2("ADOPTION OF PLAN");
  addParagraph(`IN WITNESS WHEREOF, ${blank(p.employer_name)} has caused this Plan to be executed on this _____ day of ____________, ______.`);
  addSpacer(30);

  const col1X = marginL;
  const lineY1 = y + 40;
  const lineY2 = y + 80;
  const lineY3 = y + 120;
  const lineWidth = contentW * 0.45;

  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.5);
  doc.line(col1X, lineY1, col1X + lineWidth, lineY1);
  doc.line(col1X, lineY2, col1X + lineWidth, lineY2);
  doc.line(col1X, lineY3, col1X + lineWidth, lineY3);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Signature of Authorized Representative", col1X, lineY1 + 10);
  doc.text("Print Name and Title", col1X, lineY2 + 10);
  doc.text("Date", col1X, lineY3 + 10);

  // Force download via blob URL
  const fileName = `${(p.plan_name || "plan-document").replace(/\s+/g, "-").toLowerCase()}.pdf`;
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}