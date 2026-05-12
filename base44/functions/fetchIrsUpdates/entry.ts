import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow both admin-triggered and scheduled calls
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const today = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();

    // Use LLM with web search to fetch the latest IRS Section 125 limits
    const researchPrompt = `You are an IRS tax law researcher. Using your knowledge and the latest available information, provide the current IRS Section 125 Cafeteria Plan limits and rules for tax year ${currentYear}.

Research and return the following specific values:
1. Health FSA maximum annual employee election limit (per IRC §125 / Rev. Proc.)
2. Health FSA maximum carryover amount
3. DCAP (Dependent Care FSA) maximum annual election - married filing jointly or single
4. DCAP maximum for married filing separately
5. HSA contribution limit for self-only HDHP coverage
6. HSA contribution limit for family HDHP coverage
7. Simple Cafeteria Plan maximum employee count threshold
8. Grace period maximum days (standard is 75 days / 2 months 15 days)
9. Any key IRS notices or Revenue Procedures that set these limits for ${currentYear}

Also write a comprehensive compliance rules text paragraph (2-4 paragraphs) that can be used as context for an AI compliance checker. Include all the structural requirements: written plan document, SPD, EIN, plan number format, administrator requirements, eligibility nondiscrimination, entry dates, claims deadlines, election change events, carryover vs grace period mutual exclusivity, POP requirements, and Simple Cafeteria Plan requirements.

Return your response as a structured JSON object.`;

    const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: researchPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          fiscal_year: { type: "number" },
          fsa_max_election: { type: "number" },
          fsa_carryover_max: { type: "number" },
          dcap_max_election: { type: "number" },
          dcap_max_mfs: { type: "number" },
          hsa_self_only: { type: "number" },
          hsa_family: { type: "number" },
          simple_cafeteria_max_employees: { type: "number" },
          grace_period_max_days: { type: "number" },
          irs_notice_references: {
            type: "array",
            items: { type: "string" }
          },
          full_rules_text: { type: "string" },
          source_summary: { type: "string" }
        },
        required: ["fiscal_year", "fsa_max_election", "full_rules_text"]
      }
    });

    if (!aiResult || !aiResult.fsa_max_election) {
      return Response.json({ error: 'Failed to retrieve IRS rules from AI.' }, { status: 500 });
    }

    // Deactivate all previous rulesets
    const existingRules = await base44.asServiceRole.entities.IrsRules.list();
    for (const rule of existingRules) {
      if (rule.is_active) {
        await base44.asServiceRole.entities.IrsRules.update(rule.id, { is_active: false });
      }
    }

    // Check if a record for this fiscal year already exists
    const existingForYear = existingRules.find(r => r.fiscal_year === aiResult.fiscal_year);

    let savedRule;
    const ruleData = {
      fiscal_year: aiResult.fiscal_year || currentYear,
      is_active: true,
      fsa_max_election: aiResult.fsa_max_election,
      fsa_carryover_max: aiResult.fsa_carryover_max,
      dcap_max_election: aiResult.dcap_max_election,
      dcap_max_mfs: aiResult.dcap_max_mfs || 2500,
      hsa_self_only: aiResult.hsa_self_only,
      hsa_family: aiResult.hsa_family,
      simple_cafeteria_max_employees: aiResult.simple_cafeteria_max_employees || 100,
      grace_period_max_days: aiResult.grace_period_max_days || 75,
      full_rules_text: aiResult.full_rules_text,
      source_summary: aiResult.source_summary,
      irs_notice_references: aiResult.irs_notice_references || [],
      last_fetched: today,
    };

    if (existingForYear) {
      savedRule = await base44.asServiceRole.entities.IrsRules.update(existingForYear.id, ruleData);
    } else {
      savedRule = await base44.asServiceRole.entities.IrsRules.create(ruleData);
    }

    return Response.json({
      message: `IRS rules for ${aiResult.fiscal_year} successfully updated and set as active.`,
      fiscal_year: aiResult.fiscal_year,
      fsa_max_election: aiResult.fsa_max_election,
      fsa_carryover_max: aiResult.fsa_carryover_max,
      dcap_max_election: aiResult.dcap_max_election,
      hsa_self_only: aiResult.hsa_self_only,
      hsa_family: aiResult.hsa_family,
      irs_notice_references: aiResult.irs_notice_references,
      last_fetched: today,
      rule_id: savedRule?.id,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});