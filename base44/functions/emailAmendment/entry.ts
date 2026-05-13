import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { alertIds, recipientEmail, recipientName, notes } = await req.json();

    if (!alertIds?.length || !recipientEmail) {
      return Response.json({ error: 'alertIds and recipientEmail are required' }, { status: 400 });
    }

    // Fetch all alerts
    const allAlerts = await base44.entities.ComplianceAlert.list();
    const alerts = allAlerts.filter(a => alertIds.includes(a.id));

    if (!alerts.length) {
      return Response.json({ error: 'No matching alerts found' }, { status: 404 });
    }

    const planName = alerts[0]?.plan_name || "Section 125 Plan";
    const employerName = alerts[0]?.employer_name || "";
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 };
    const sorted = [...alerts].sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3));

    // Build email body
    let amendmentSections = sorted.map((alert, idx) => {
      const severityLabel = { critical: "🔴 CRITICAL", warning: "🟡 WARNING", info: "🔵 INFO" }[alert.severity] || alert.severity;
      return `
<div style="margin-bottom:28px; border-left:4px solid ${alert.severity === 'critical' ? '#dc2626' : alert.severity === 'warning' ? '#d97706' : '#2563eb'}; padding-left:16px;">
  <h3 style="margin:0 0 4px; font-size:15px; color:#1e1e3f;">Amendment ${idx + 1}: ${alert.issue}</h3>
  <p style="margin:0 0 6px; font-size:12px; color:#888;">${severityLabel} · ${alert.category || ''} · ${alert.check_date ? new Date(alert.check_date).toLocaleDateString() : ''}</p>
  ${alert.detail ? `<p style="font-size:13px; color:#444; margin:0 0 10px;"><strong>Issue:</strong> ${alert.detail}</p>` : ''}
  ${alert.recommendation ? `<p style="font-size:13px; color:#444; margin:0 0 10px;"><strong>Recommendation:</strong> ${alert.recommendation}</p>` : ''}
  ${alert.amendment_text ? `
  <div style="background:#f5f7ff; border:1px solid #c7d2fe; border-radius:6px; padding:12px; margin-top:8px;">
    <p style="margin:0 0 6px; font-size:11px; font-weight:bold; text-transform:uppercase; color:#6366f1; letter-spacing:0.05em;">Draft Amendment Language</p>
    <p style="margin:0; font-family:Georgia,serif; font-size:13px; color:#1e1e3f; line-height:1.6; white-space:pre-wrap;">${alert.amendment_text}</p>
  </div>` : ''}
</div>`;
    }).join('');

    const emailBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width:680px; margin:0 auto; background:#f8fafc; padding:0;">

  <!-- Header -->
  <div style="background:#14244a; padding:28px 32px; border-radius:8px 8px 0 0;">
    <p style="margin:0 0 4px; font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:#93b4e8;">Section 125 Cafeteria Plan</p>
    <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:700;">Plan Amendment Document</h1>
    <p style="margin:6px 0 0; color:#93b4e8; font-size:13px;">${planName}${employerName ? ` · ${employerName}` : ''} · ${today}</p>
  </div>

  <!-- Body -->
  <div style="background:#ffffff; padding:28px 32px; border:1px solid #e5e7eb; border-top:none;">

    <!-- Greeting -->
    <p style="color:#374151; font-size:14px;">Dear ${recipientName || recipientEmail},</p>
    <p style="color:#374151; font-size:14px; line-height:1.6;">
      Please find below <strong>${sorted.length} plan amendment${sorted.length !== 1 ? 's' : ''}</strong> identified during your recent Section 125 compliance review. 
      Each amendment includes draft language ready for attorney review and plan sponsor signature.
    </p>

    ${notes ? `<div style="background:#fffbeb; border:1px solid #fcd34d; border-radius:6px; padding:12px 16px; margin:16px 0;">
      <p style="margin:0; font-size:13px; color:#92400e;"><strong>Note:</strong> ${notes}</p>
    </div>` : ''}

    <!-- Legal disclaimer -->
    <div style="background:#fff8e6; border-left:4px solid #d4a745; padding:10px 14px; margin:16px 0; border-radius:0 4px 4px 0;">
      <p style="margin:0; font-size:12px; color:#92400e; font-style:italic;">
        <strong>Important:</strong> This document contains AI-generated draft language for review purposes only. This is not legal advice. Please consult a qualified ERISA/benefits attorney before implementing any amendments.
      </p>
    </div>

    <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;">

    <!-- Amendments -->
    ${amendmentSections}

    <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;">

    <!-- CTA -->
    <p style="color:#374151; font-size:13px; line-height:1.6;">
      Please print and execute the required amendments, obtain authorized signatures, and retain a copy in your plan document file. 
      Contact your benefits attorney for guidance on proper implementation and effective dates.
    </p>
    <p style="color:#374151; font-size:13px;">Sent via Section 125 Plan Document Creator</p>
  </div>

  <!-- Footer -->
  <div style="background:#f1f5f9; padding:16px 32px; border-radius:0 0 8px 8px; border:1px solid #e5e7eb; border-top:none;">
    <p style="margin:0; font-size:11px; color:#9ca3af; text-align:center;">
      Confidential — For authorized recipient only. Not legal advice. Section 125 Plan Document Creator.
    </p>
  </div>

</body>
</html>`;

    await base44.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: `Plan Amendment Required: ${planName} (${sorted.length} item${sorted.length !== 1 ? 's' : ''})`,
      body: emailBody,
    });

    return Response.json({
      success: true,
      message: `Amendment email sent to ${recipientEmail}`,
      alertCount: sorted.length,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});