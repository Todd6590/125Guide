import { jsPDF } from "jspdf";
import { format } from "date-fns";

/**
 * Generates a ready-to-sign PDF plan amendment document.
 * @param {Array} alerts - Array of ComplianceAlert records
 * @param {Object} options - { single: boolean } — if true, treated as a formal single amendment doc
 */
export default function generateAmendmentPDF(alerts, options = {}) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 22;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addPage = () => { doc.addPage(); y = margin; };
  const checkY = (needed = 10) => { if (y + needed > pageHeight - 20) addPage(); };

  const text = (str, { size = 10, style = "normal", color = [30, 30, 30], font = "helvetica", indent = 0, lineSpacing = 1.35 } = {}) => {
    doc.setFontSize(size);
    doc.setFont(font, style);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(str || "", contentWidth - indent);
    const lineH = size * 0.352778 * lineSpacing;
    checkY(lines.length * lineH + 2);
    doc.text(lines, margin + indent, y);
    y += lines.length * lineH + 2;
  };

  const hRule = (thick = false, color = [200, 200, 210]) => {
    checkY(5);
    doc.setDrawColor(...color);
    doc.setLineWidth(thick ? 0.6 : 0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
    doc.setLineWidth(0.2);
  };

  const space = (mm = 4) => { checkY(mm); y += mm; };

  const today = format(new Date(), "MMMM d, yyyy");
  const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 };
  const sorted = [...alerts].sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3));

  // ─── COVER HEADER ──────────────────────────────────────────────────────────
  // Dark navy bar
  doc.setFillColor(20, 36, 74);
  doc.rect(0, 0, pageWidth, 48, "F");

  // Gold accent line
  doc.setFillColor(212, 167, 69);
  doc.rect(0, 48, pageWidth, 1.5, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 200, 255);
  doc.text("SECTION 125 CAFETERIA PLAN", margin, 14);

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Plan Amendment Document", margin, 26);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(190, 210, 240);
  doc.text(`${sorted.length} Amendment${sorted.length !== 1 ? "s" : ""}  ·  Generated ${today}`, margin, 36);

  // Doc number top-right
  doc.setFontSize(8);
  doc.setTextColor(140, 160, 200);
  doc.text(`REF: AMD-${Date.now().toString().slice(-8)}`, pageWidth - margin, 14, { align: "right" });

  y = 58;

  // ─── LEGAL DISCLAIMER ──────────────────────────────────────────────────────
  doc.setFillColor(255, 250, 235);
  doc.setDrawColor(212, 167, 69);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "FD");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bolditalic");
  doc.setTextColor(140, 100, 20);
  doc.text("IMPORTANT NOTICE:", margin + 3, y + 5.5);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(120, 90, 20);
  const disclaimer = "This document contains AI-generated draft amendment language for review purposes only. This is NOT legal advice. Consult a qualified ERISA/benefits attorney before implementing any plan amendments.";
  const dlLines = doc.splitTextToSize(disclaimer, contentWidth - 38);
  doc.text(dlLines, margin + 34, y + 5.5);
  y += 24;

  // ─── AMENDMENTS ────────────────────────────────────────────────────────────
  sorted.forEach((alert, idx) => {
    const isLast = idx === sorted.length - 1;
    const severityColors = {
      critical: [185, 28, 28],
      warning: [161, 98, 7],
      info: [29, 78, 216],
    };
    const sc = severityColors[alert.severity] || [80, 80, 80];
    const bgColors = {
      critical: [254, 242, 242],
      warning: [255, 251, 235],
      info: [239, 246, 255],
    };
    const bg = bgColors[alert.severity] || [248, 248, 252];

    space(6);
    checkY(60);

    // Amendment number banner
    doc.setFillColor(...bg);
    doc.setDrawColor(...sc);
    doc.setLineWidth(0.5);
    const bannerH = 12;
    doc.roundedRect(margin, y, contentWidth, bannerH, 2, 2, "FD");

    // Left severity pill
    doc.setFillColor(...sc);
    doc.roundedRect(margin + 3, y + 2.5, 22, 7, 1.5, 1.5, "F");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text((alert.severity || "").toUpperCase(), margin + 14, y + 7.5, { align: "center" });

    doc.setFontSize(10.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...sc);
    doc.text(`Amendment ${idx + 1}: ${alert.issue || ""}`, margin + 28, y + 7.5);
    y += bannerH + 4;

    // Meta row
    const metaParts = [
      alert.plan_name && `Plan: ${alert.plan_name}`,
      alert.employer_name && `Employer: ${alert.employer_name}`,
      alert.category && `Category: ${alert.category}`,
      alert.check_date && `Check Date: ${format(new Date(alert.check_date), "MMM d, yyyy")}`,
    ].filter(Boolean);
    if (metaParts.length) {
      text(metaParts.join("   ·   "), { size: 8, color: [100, 100, 120] });
    }

    space(3);

    if (alert.detail) {
      text("COMPLIANCE ISSUE", { size: 7.5, style: "bold", color: [100, 100, 130] });
      text(alert.detail, { size: 9, color: [50, 50, 70], indent: 2 });
      space(3);
    }

    if (alert.recommendation) {
      text("RECOMMENDED ACTION", { size: 7.5, style: "bold", color: [100, 100, 130] });
      text(alert.recommendation, { size: 9, color: [50, 50, 70], indent: 2 });
      space(3);
    }

    if (alert.amendment_text) {
      text("DRAFT AMENDMENT LANGUAGE", { size: 7.5, style: "bold", color: [100, 100, 130] });
      space(1);

      const amendLines = doc.splitTextToSize(alert.amendment_text, contentWidth - 10);
      const boxH = Math.max(amendLines.length * 4 + 10, 20);
      checkY(boxH + 4);

      // Amendment text box - formal look
      doc.setFillColor(248, 250, 255);
      doc.setDrawColor(160, 175, 220);
      doc.setLineWidth(0.4);
      doc.roundedRect(margin, y, contentWidth, boxH, 2, 2, "FD");

      // Left accent bar
      doc.setFillColor(80, 110, 200);
      doc.rect(margin, y, 2, boxH, "F");

      doc.setFontSize(9);
      doc.setFont("times", "normal");
      doc.setTextColor(20, 30, 70);
      doc.text(amendLines, margin + 6, y + 5.5);
      y += boxH + 4;
    }

    // ─── SIGNATURE BLOCK ───────────────────────────────────────────────────
    space(4);
    checkY(52);

    text("AUTHORIZED SIGNATURES", { size: 7.5, style: "bold", color: [100, 100, 130] });
    space(2);

    // Two-column signature block
    const colW = (contentWidth - 8) / 2;
    const sigBoxH = 38;

    // Left: Employer
    doc.setFillColor(250, 250, 255);
    doc.setDrawColor(200, 205, 220);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, colW, sigBoxH, 2, 2, "FD");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 70, 120);
    doc.text("EMPLOYER / PLAN SPONSOR", margin + 4, y + 7);
    doc.setDrawColor(160, 165, 185);
    doc.line(margin + 4, y + 19, margin + colW - 4, y + 19);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 140);
    doc.text("Authorized Signature", margin + 4, y + 23);
    doc.line(margin + 4, y + 30, margin + colW - 4, y + 30);
    doc.text("Printed Name & Title", margin + 4, y + 34);

    // Right: Date signed
    const rx = margin + colW + 8;
    doc.setFillColor(250, 250, 255);
    doc.roundedRect(rx, y, colW, sigBoxH, 2, 2, "FD");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 70, 120);
    doc.text("PLAN ADMINISTRATOR", rx + 4, y + 7);
    doc.setDrawColor(160, 165, 185);
    doc.line(rx + 4, y + 19, rx + colW - 4, y + 19);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 140);
    doc.text("Authorized Signature", rx + 4, y + 23);
    doc.line(rx + 4, y + 30, rx + colW - 4, y + 30);
    doc.text("Date", rx + 4, y + 34);

    y += sigBoxH + 4;

    // Effective date line
    space(2);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 100);
    doc.text("Amendment Effective Date: ____________________________", margin + 2, y);
    y += 7;

    if (!isLast) {
      space(4);
      hRule(true, [180, 185, 210]);
    }
  });

  // ─── FOOTER ON ALL PAGES ───────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(20, 36, 74);
    doc.rect(0, pageHeight - 10, pageWidth, 10, "F");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(170, 185, 220);
    doc.text(
      `Section 125 Plan Amendment  ·  Confidential  ·  Page ${i} of ${pageCount}  ·  Not Legal Advice`,
      pageWidth / 2, pageHeight - 3.5, { align: "center" }
    );
  }

  const planName = sorted[0]?.plan_name?.replace(/\s+/g, "_") || "Plan";
  doc.save(`${planName}_Amendment_${format(new Date(), "yyyy-MM-dd")}.pdf`);
}