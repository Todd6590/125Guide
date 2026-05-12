import { jsPDF } from "jspdf";
import { format } from "date-fns";

export default function generateAmendmentPDF(alerts) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addPage = () => {
    doc.addPage();
    y = margin;
  };

  const checkY = (needed = 10) => {
    if (y + needed > pageHeight - margin) addPage();
  };

  const addText = (text, fontSize = 10, style = "normal", color = [30, 30, 30]) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", style);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text || "", contentWidth);
    checkY(lines.length * (fontSize * 0.4 + 1));
    doc.text(lines, margin, y);
    y += lines.length * (fontSize * 0.4 + 1) + 2;
  };

  const addHRule = () => {
    checkY(4);
    doc.setDrawColor(180, 180, 180);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;
  };

  // Cover page
  doc.setFillColor(28, 40, 74);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 215, 0);
  doc.text("Section 125 Plan Compliance", margin, 18);
  doc.setFontSize(13);
  doc.setTextColor(220, 230, 255);
  doc.text("Amendment Drafts & Compliance Findings", margin, 28);
  y = 50;

  addText(`Generated: ${format(new Date(), "MMMM d, yyyy")}`, 9, "normal", [100, 100, 100]);
  addText(
    `This document contains ${alerts.length} compliance finding(s) and AI-generated draft amendment language. ` +
    `Always consult a qualified ERISA/benefits attorney before implementing any amendments. ` +
    `This is not legal advice.`,
    9, "italic", [120, 100, 60]
  );
  y += 6;
  addHRule();

  const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 };
  const sorted = [...alerts].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3)
  );

  sorted.forEach((alert, idx) => {
    checkY(20);
    y += 4;

    // Alert header
    doc.setFillColor(245, 245, 250);
    doc.roundedRect(margin - 2, y - 4, contentWidth + 4, 14, 2, 2, "F");

    const severityColors = {
      critical: [200, 50, 50],
      warning: [180, 120, 0],
      info: [50, 100, 180],
    };
    const sc = severityColors[alert.severity] || [100, 100, 100];

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...sc);
    doc.text(`${idx + 1}. [${(alert.severity || "").toUpperCase()}] ${alert.issue || ""}`, margin, y + 4);
    y += 14;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const meta = [
      alert.plan_name && `Plan: ${alert.plan_name}`,
      alert.employer_name && `Employer: ${alert.employer_name}`,
      alert.category && `Category: ${alert.category}`,
      alert.check_date && `Check Date: ${format(new Date(alert.check_date), "MMM d, yyyy")}`,
    ].filter(Boolean).join("   |   ");
    if (meta) {
      const metaLines = doc.splitTextToSize(meta, contentWidth);
      doc.text(metaLines, margin, y);
      y += metaLines.length * 4 + 2;
    }

    if (alert.detail) {
      addText("Issue Detail:", 9, "bold", [50, 50, 80]);
      addText(alert.detail, 9, "normal", [50, 50, 50]);
    }

    if (alert.recommendation) {
      addText("Recommendation:", 9, "bold", [50, 50, 80]);
      addText(alert.recommendation, 9, "normal", [50, 50, 50]);
    }

    if (alert.amendment_text) {
      addText("Draft Amendment Language:", 9, "bold", [50, 50, 80]);
      // Box for amendment
      const amendLines = doc.splitTextToSize(alert.amendment_text, contentWidth - 8);
      const boxH = amendLines.length * 4.2 + 6;
      checkY(boxH + 4);
      doc.setFillColor(250, 252, 255);
      doc.setDrawColor(180, 190, 220);
      doc.roundedRect(margin, y, contentWidth, boxH, 2, 2, "FD");
      doc.setFontSize(8.5);
      doc.setFont("courier", "normal");
      doc.setTextColor(30, 30, 60);
      doc.text(amendLines, margin + 4, y + 4.5);
      y += boxH + 4;
    }

    if (idx < sorted.length - 1) {
      y += 3;
      addHRule();
    }
  });

  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 160, 160);
    doc.text(
      `Section 125 Compliance Report  |  Page ${i} of ${pageCount}  |  For review purposes only — not legal advice`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  doc.save(`Section125_Compliance_Amendments_${format(new Date(), "yyyy-MM-dd")}.pdf`);
}