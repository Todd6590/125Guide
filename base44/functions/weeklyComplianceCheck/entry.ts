import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const IRS_RULES_2025 = `
IRS Section 125 Cafeteria Plan Compliance Rules (2025):
- Health FSA maximum annual election: $3,300 (up from $3,200 in 2024)
- Health FSA carryover maximum: $660 (up from $640 in 2024)
- DCAP maximum annual election: $5,000 ($2,500 if married filing separately)
- HSA contribution limits: $4,300 self-only / $8,550 family
- Plan year must be 12 consecutive months (except short first year or plan termination)
- Plan must have a written plan document
- Plan must have a Summary Plan Description (SPD)
- Employer EIN is required for ERISA plans
- Plan number must be a 3-digit number (001-999)
- Plan administrator must be named with contact information
- Eligibility class must be defined and non-discriminatory
- Waiting period must be specified
- Entry dates must be specified (immediate, first of month, first of quarter, etc.)
- For grace periods: may not exceed 2 months and 15 days after plan year end
- For carryover: cannot be combined with grace period in same plan
- Claims filing deadline must be specified (typically 90 days after plan year end or service date)
- Premium Only Plans (POP): must list specific insurance premiums being salary-reduced
- Simple Cafeteria Plans: employer must have 100 or fewer employees and meet contribution requirements
- Election change events must be documented (birth, marriage, divorce, loss of coverage, etc.)
- Plan must specify if employer contributions are made and the amount/formula
`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all complete plans
    const allPlans = await base44.asServiceRole.entities.PlanDocument.list();
    const completePlans = allPlans.filter(p => p.status === 'complete');

    if (completePlans.length === 0) {
      return Response.json({ message: 'No complete plans to check.', checked: 0, alerts: 0 });
    }

    const today = new Date().toISOString().split('T')[0];
    let totalAlerts = 0;
    const planResults = [];

    for (const plan of completePlans) {
      // Ask AI to review this plan
      const planJson = JSON.stringify({
        plan_name: plan.plan_name,
        plan_type: plan.plan_type,
        employer_name: plan.employer_name,
        employer_ein: plan.employer_ein,
        plan_year_start: plan.plan_year_start,
        plan_year_end: plan.plan_year_end,
        effective_date: plan.effective_date,
        plan_number: plan.plan_number,
        plan_administrator_name: plan.plan_administrator_name,
        plan_administrator_phone: plan.plan_administrator_phone,
        plan_administrator_email: plan.plan_administrator_email,
        eligibility_class: plan.eligibility_class,
        waiting_period: plan.waiting_period,
        hours_required: plan.hours_required,
        entry_dates: plan.entry_dates,
        benefits_offered: plan.benefits_offered,
        fsa_max_election: plan.fsa_max_election,
        fsa_carryover: plan.fsa_carryover,
        fsa_carryover_amount: plan.fsa_carryover_amount,
        fsa_grace_period: plan.fsa_grace_period,
        limited_fsa_max_election: plan.limited_fsa_max_election,
        dcap_max_election: plan.dcap_max_election,
        claims_filing_deadline: plan.claims_filing_deadline,
        total_employees: plan.total_employees,
        employer_contribution: plan.employer_contribution,
        employer_contribution_amount: plan.employer_contribution_amount,
      });

      const prompt = `You are an IRS Section 125 compliance expert. Review this cafeteria plan document data against the current IRS rules and identify any compliance issues.

CURRENT IRS RULES:
${IRS_RULES_2025}

TODAY'S DATE: ${today}

PLAN DATA:
${planJson}

Analyze the plan and return a JSON array of compliance issues found. For each issue include:
- severity: "critical" (plan may be disqualified), "warning" (needs correction), or "info" (best practice suggestion)
- category: short category label (e.g. "IRS Limits", "Plan Year", "Missing Information", "Eligibility", "Grace Period / Carryover")
- issue: one-sentence description of the problem
- detail: 2-3 sentences explaining why this is an issue and the applicable IRS rule
- recommendation: specific corrective action recommended
- amendment_text: draft amendment language to correct this issue (formal legal language suitable for a plan amendment)

Return ONLY a JSON array. If the plan is fully compliant, return an empty array [].`;

      const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  severity: { type: "string" },
                  category: { type: "string" },
                  issue: { type: "string" },
                  detail: { type: "string" },
                  recommendation: { type: "string" },
                  amendment_text: { type: "string" }
                }
              }
            }
          }
        }
      });

      const issues = aiResult?.issues || [];

      // Store alerts in database
      for (const iss of issues) {
        await base44.asServiceRole.entities.ComplianceAlert.create({
          plan_id: plan.id,
          plan_name: plan.plan_name,
          employer_name: plan.employer_name,
          severity: iss.severity || 'warning',
          category: iss.category || 'General',
          issue: iss.issue,
          detail: iss.detail,
          recommendation: iss.recommendation,
          amendment_text: iss.amendment_text,
          status: 'open',
          check_date: today,
        });
        totalAlerts++;
      }

      planResults.push({
        plan_name: plan.plan_name,
        employer_name: plan.employer_name,
        issues_found: issues.length,
      });
    }

    // Send email notification if alerts were found
    if (totalAlerts > 0) {
      const criticalCount = planResults.reduce((acc, p) => acc + (p.issues_found > 0 ? 1 : 0), 0);
      const emailBody = `
Hello,

Your weekly Section 125 compliance check has been completed. Here is a summary:

Plans Checked: ${completePlans.length}
Plans with Issues: ${criticalCount}
Total Alerts Generated: ${totalAlerts}

Plans Reviewed:
${planResults.map(p => `• ${p.plan_name} (${p.employer_name || 'N/A'}): ${p.issues_found} issue(s)`).join('\n')}

Please log in to your Section 125 Plan Document Creator to review the detailed findings and download amendment drafts for any issues found.

This is an automated compliance check. Always consult a qualified benefits attorney before implementing any amendments.

Best regards,
Section 125 Plan Document Creator
      `.trim();

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject: `⚠️ Section 125 Compliance Alert: ${totalAlerts} Issue(s) Found`,
        body: emailBody,
      });
    }

    return Response.json({
      message: 'Compliance check complete.',
      checked: completePlans.length,
      alerts: totalAlerts,
      results: planResults,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});