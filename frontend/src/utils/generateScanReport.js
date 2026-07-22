// /frontend/src/utils/generateScanReport.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Custom premium color palette
const COLORS = {
  emerald: [16, 185, 129],
  emeraldDark: [4, 120, 87],
  emeraldLight: [209, 250, 229],
  
  charcoal: [31, 41, 55],
  slateGray: [75, 85, 99],
  coolGray: [156, 163, 175],
  lightGray: [243, 244, 246],
  borderGray: [229, 231, 235],
  white: [255, 255, 255],
  
  blue: [37, 99, 235],
  blueLight: [239, 246, 255],
  
  amber: [217, 119, 6],
  amberLight: [254, 243, 199],
  
  red: [220, 38, 38],
  redLight: [254, 226, 226],
};

const REC_STYLE = {
  Reuse: { fill: COLORS.emeraldLight, accent: COLORS.emerald, label: "Reuse" },
  Repair: { fill: COLORS.blueLight, accent: COLORS.blue, label: "Repair" },
  Refurbish: { fill: COLORS.amberLight, accent: COLORS.amber, label: "Refurbish" },
  Recycle: { fill: COLORS.redLight, accent: COLORS.red, label: "Recycle" },
};

const MATERIAL_LABELS = {
  copper_grams: "Copper",
  aluminium_grams: "Aluminium",
  gold_mg: "Gold",
  silver_grams: "Silver",
  plastic_grams: "Plastic",
  glass_grams: "Glass",
  rubber_grams: "Rubber",
  steel_grams: "Steel",
};

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 16;
const CONTENT_W = PAGE_W - MARGIN * 2;

function fmtDate() {
  return new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function generateScanReport(result, deviceDisplayName, { reasons = [], visualRows = [] } = {}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 0;
  let pageNum = 1;

  const setFill = (c) => doc.setFillColor(...c);
  const setText = (c) => doc.setTextColor(...c);
  const setDraw = (c) => doc.setDrawColor(...c);

  function drawFooter() {
    setDraw(COLORS.borderGray);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, PAGE_H - 14, PAGE_W - MARGIN, PAGE_H - 14);
    doc.setFontSize(7.5);
    setText(COLORS.coolGray);
    doc.setFont("helvetica", "normal");
    doc.text("EcoView AI Circular Economy Framework \u00B7 Certification of E-Waste Audit", MARGIN, PAGE_H - 9);
    doc.text(`Page ${pageNum}`, PAGE_W - MARGIN, PAGE_H - 9, { align: "right" });
  }

  function newPage() {
    drawFooter();
    doc.addPage();
    pageNum += 1;
    y = MARGIN;
  }

  function ensureSpace(height) {
    if (y + height > PAGE_H - 20) newPage();
  }

  function sectionTitle(title, accent = COLORS.emeraldDark) {
    ensureSpace(14);
    setFill(accent);
    doc.roundedRect(MARGIN, y, 1.4, 5, 0.7, 0.7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    setText(COLORS.charcoal);
    doc.text(title, MARGIN + 4.5, y + 4.2);
    y += 8;
  }

  // ---------- HEADER BAND ----------
  // Top thick colored strip
  setFill(COLORS.emeraldDark);
  doc.rect(0, 0, PAGE_W, 6, "F");

  // Logo & Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  setText(COLORS.charcoal);
  doc.text("EcoView AI", MARGIN, 18);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setText(COLORS.slateGray);
  doc.text("E-Waste Analysis & Circularity Passport", MARGIN, 23);
  
  // Official Badge
  setFill(COLORS.emeraldLight);
  doc.roundedRect(MARGIN + 62, 14, 26, 5, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  setText(COLORS.emeraldDark);
  doc.text("VERIFIED REPORT", MARGIN + 64, 17.5);

  // Passport & Issue date details on top-right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  setText(COLORS.charcoal);
  doc.text(`PASSPORT ID:`, PAGE_W - MARGIN - 42, 16, { align: "left" });
  doc.setFont("helvetica", "normal");
  setText(COLORS.slateGray);
  doc.text(result.passport_id || "N/A", PAGE_W - MARGIN, 16, { align: "right" });
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  setText(COLORS.charcoal);
  doc.text(`DATE ISSUED:`, PAGE_W - MARGIN - 42, 21, { align: "left" });
  doc.setFont("helvetica", "normal");
  setText(COLORS.slateGray);
  doc.text(fmtDate(), PAGE_W - MARGIN, 21, { align: "right" });
  
  // Thin line below header
  setDraw(COLORS.borderGray);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, 28, PAGE_W - MARGIN, 28);

  y = 36;

  // ---------- DEVICE TITLE ----------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  setText(COLORS.charcoal);
  doc.text(deviceDisplayName || "Unknown Device", MARGIN, y);
  y += 5.5;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setText(COLORS.coolGray);
  const metaBits = [
    result.device_category,
    result.brand && result.brand !== "Unknown" ? `Brand: ${result.brand}` : null,
    result.estimated_age ? `Est. Age: ${result.estimated_age}` : null,
  ].filter(Boolean);
  doc.text(metaBits.join("   \u00B7   "), MARGIN, y);
  y += 8;

  // ---------- HERO TWO-COLUMN BANNER ----------
  const col1W = 106;
  const col2W = 68;
  const colGap = 4;
  const col2X = MARGIN + col1W + colGap;
  const bannerH = 34; // fixed height for this hero block to align columns
  
  ensureSpace(bannerH);
  
  // LEFT COLUMN: Recommendation Banner
  const rec = REC_STYLE[result.recommendation] || REC_STYLE.Recycle;
  setFill(rec.fill);
  doc.roundedRect(MARGIN, y, col1W, bannerH, 2.5, 2.5, "F");
  // Left border highlight
  setFill(rec.accent);
  doc.roundedRect(MARGIN, y, 2.2, bannerH, 1.1, 1.1, "F");
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setText(COLORS.slateGray);
  doc.text("RECOMMENDED ACTION", MARGIN + 6, y + 6);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  setText(rec.accent);
  doc.text(rec.label.toUpperCase(), MARGIN + 6, y + 13);
  
  // Reasons list inside recommendation card
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setText(COLORS.slateGray);
  let ry = y + 17;
  reasons.slice(0, 3).forEach((r) => { // limit to top 3 reasons to fit height
    const lines = doc.splitTextToSize(`\u2022 ${r}`, col1W - 12);
    doc.text(lines, MARGIN + 6, ry + 4);
    ry += lines.length * 4;
  });
  
  // RIGHT COLUMN: Eco-Score Circular Gauge
  setFill(COLORS.lightGray);
  doc.roundedRect(col2X, y, col2W, bannerH, 2.5, 2.5, "F");
  
  const circleX = col2X + 16;
  const circleY = y + bannerH / 2;
  const radius = 10;
  
  // Draw circular track
  setDraw(COLORS.borderGray);
  doc.setLineWidth(2.5);
  doc.circle(circleX, circleY, radius, "S");
  
  // Draw score color track
  const scoreVal = result.eco_score || 0;
  const trackColor = scoreVal >= 70 ? COLORS.emerald : scoreVal >= 40 ? COLORS.amber : COLORS.red;
  setDraw(trackColor);
  doc.setLineWidth(2.5);
  doc.circle(circleX, circleY, radius, "S");
  
  // Score text inside circle
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setText(COLORS.charcoal);
  doc.text(`${scoreVal}`, circleX, circleY + 1.5, { align: "center" });
  
  // Labels on the right side of the card
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setText(COLORS.charcoal);
  doc.text("Circularity Score", col2X + 30, y + 13);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  setText(COLORS.slateGray);
  doc.text("Out of 100 points", col2X + 30, y + 18);
  doc.text("based on AI audit", col2X + 30, y + 22);
  
  y += bannerH + 8;

  // ---------- DEVICE OVERVIEW TABLE ----------
  sectionTitle("Audit Overview");
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    theme: "striped",
    styles: { fontSize: 8.5, textColor: COLORS.slateGray, cellPadding: 2 },
    headStyles: { fillColor: COLORS.emeraldDark, textColor: COLORS.white, fontSize: 8.5, fontStyle: "bold" },
    columnStyles: { 0: { fontStyle: "bold", textColor: COLORS.charcoal, cellWidth: 50 } },
    body: [
      ["Device Classification", deviceDisplayName || "\u2014"],
      ["Circularity Category", result.device_category || "\u2014"],
      ["Manufacturer / Brand", result.brand || "Unknown"],
      ["Device Lifecycle Age", result.estimated_age || "Unknown"],
      ["Visual Grade Status", result.condition || "\u2014"],
      ["User Diagnostics Flag", result.user_problem || "No manual issues reported"],
    ],
  });
  y = doc.lastAutoTable.finalY + 8;

  // ---------- CONDITION SCORES ----------
  sectionTitle("Circularity Potential Breakdown");
  const scoreRows = [
    ["Repairability Potential", result.repairability_score, COLORS.blue],
    ["Reuse Feasibility", result.reuse_score, COLORS.emerald],
    ["Recycling Extraction Rate", result.recycle_score, COLORS.red],
  ].filter(([, v]) => v !== undefined && v !== null);

  ensureSpace(scoreRows.length * 7 + 4);
  scoreRows.forEach(([label, value, color]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setText(COLORS.charcoal);
    doc.text(label, MARGIN, y + 3.5);
    doc.setFont("helvetica", "bold");
    setText(color);
    doc.text(`${value}%`, MARGIN + 50, y + 3.5, { align: "right" });

    // Sleek progress bar
    const barW = CONTENT_W - 56;
    const barX = MARGIN + 56;
    setFill(COLORS.lightGray);
    doc.roundedRect(barX, y + 1, barW, 2.5, 1.25, 1.25, "F");
    setFill(color);
    doc.roundedRect(barX, y + 1, Math.max(2, (barW * Math.min(value, 100)) / 100), 2.5, 1.25, 1.25, "F");
    y += 7;
  });
  y += 5;

  // ---------- VISUAL INSPECTION ----------
  if (visualRows.length > 0) {
    sectionTitle("Visual Inspection Checklist");
    ensureSpace(visualRows.length * 6 + 4);
    visualRows.forEach(({ label, ok }) => {
      // Draw status capsule badge
      setFill(ok ? COLORS.emeraldLight : COLORS.redLight);
      doc.roundedRect(MARGIN, y + 0.5, 13, 4, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      setText(ok ? COLORS.emeraldDark : COLORS.red);
      doc.text(ok ? "PASSED" : "FLAGGED", MARGIN + 1.5, y + 3.4);
      
      // Label text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      setText(COLORS.slateGray);
      doc.text(label, MARGIN + 16, y + 3.5);
      y += 5.5;
    });
    y += 4;
  }

  // ---------- AI DIAGNOSTIC INSIGHTS ----------
  if (result.possible_causes && result.possible_causes.length > 0) {
    sectionTitle("AI Diagnostics & Risk Estimation");
    result.possible_causes.forEach((c) => {
      ensureSpace(8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      setText(COLORS.charcoal);
      doc.text(c.cause, MARGIN, y + 3.5);
      
      doc.setFont("helvetica", "bold");
      const riskColor = c.likelihood >= 70 ? COLORS.red : c.likelihood >= 40 ? COLORS.amber : COLORS.emeraldDark;
      setText(riskColor);
      doc.text(`${c.likelihood}% Risk`, MARGIN + CONTENT_W, y + 3.5, { align: "right" });
      
      const barW = CONTENT_W;
      setFill(COLORS.lightGray);
      doc.roundedRect(MARGIN, y + 5, barW, 2, 1, 1, "F");
      setFill(riskColor);
      doc.roundedRect(MARGIN, y + 5, Math.max(2, (barW * Math.min(c.likelihood, 100)) / 100), 2, 1, 1, "F");
      y += 10;
    });
    y += 2;
  }

  // ---------- REPAIRABILITY SUMMARY ----------
  const rs = result.repairability_summary || {};
  if (Object.keys(rs).length > 0) {
    sectionTitle("Repair Feasibility Assessment");
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      theme: "striped",
      styles: { fontSize: 8.5, textColor: COLORS.slateGray, cellPadding: 2 },
      headStyles: { fillColor: COLORS.emeraldDark, textColor: COLORS.white, fontSize: 8.5, fontStyle: "bold" },
      columnStyles: { 0: { fontStyle: "bold", textColor: COLORS.charcoal, cellWidth: 60 } },
      body: [
        ["Estimated Difficulty", rs.repair_difficulty || "\u2014"],
        ["Estimated Cost Range", `Rs. ${(rs.estimated_repair_cost_low || 0).toLocaleString()} \u2013 Rs. ${(rs.estimated_repair_cost_high || 0).toLocaleString()}`],
        ["Success Rate Probability", `${rs.repair_success_probability || 0}%`],
        ["Economically Worth Repairing?", rs.economically_worth_repair ? "RECOMMENDED" : "NOT ADVISED"],
      ],
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // ---------- MATERIAL RECOVERY ----------
  if (result.materials && Object.keys(result.materials).length > 0) {
    sectionTitle("Recoverable Circular Material Breakdown");
    const rows = Object.entries(result.materials)
      .filter(([, v]) => v > 0)
      .map(([key, v]) => [MATERIAL_LABELS[key] || key, `${v} ${key.includes("mg") ? "mg" : "g"}`]);

    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      theme: "striped",
      headStyles: { fillColor: COLORS.emeraldDark, textColor: COLORS.white, fontSize: 8.5, fontStyle: "bold" },
      styles: { fontSize: 8.5, textColor: COLORS.slateGray, cellPadding: 2 },
      head: [["Material Component", "Recovered Weight / Quantity"]],
      body: rows,
      foot: [["ESTIMATED RECOVERABLE VALUE", `Rs. ${(result.material_value_inr || 0).toLocaleString()}`]],
      footStyles: { fillColor: COLORS.lightGray, textColor: COLORS.charcoal, fontStyle: "bold", fontSize: 8.5 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // ---------- BUYBACK PREDICTION ----------
  if (result.buyback_price_current !== undefined) {
    sectionTitle("Estimated Secondary Market Pricing");
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      theme: "striped",
      styles: { fontSize: 8.5, textColor: COLORS.slateGray, cellPadding: 2 },
      headStyles: { fillColor: COLORS.emeraldDark, textColor: COLORS.white, fontSize: 8.5, fontStyle: "bold" },
      columnStyles: { 0: { fontStyle: "bold", textColor: COLORS.charcoal, cellWidth: 60 } },
      body: [
        ["Current Resale Price (As-is)", `Rs. ${(result.buyback_price_current || 0).toLocaleString()}`],
        ["Projected Price (Post-repair)", `Rs. ${(result.buyback_price_after_repair || 0).toLocaleString()}`],
        ["Expected Profit Margin", `Rs. ${(result.repair_profit || 0).toLocaleString()}`],
        ["Recommended Action Pathway", result.should_repair_for_resale ? "Perform repairs before resale" : "Sell directly as-is / recycle"],
      ],
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // ---------- ENVIRONMENTAL IMPACT ----------
  sectionTitle("Environmental Offset Valuation");
  ensureSpace(28);
  const impactBoxes = [
    { label: "CO2 Offset Avoided", value: `${result.carbon_saved_kg ?? 0} kg`, color: COLORS.emeraldDark, bg: COLORS.emeraldLight },
    { label: "Water Conserved", value: `${(result.water_saved_liters ?? 0).toLocaleString()} L`, color: COLORS.blue, bg: COLORS.blueLight },
    { label: "Landfill Diverted", value: `${result.landfill_reduction_kg ?? 0} kg`, color: COLORS.amber, bg: COLORS.amberLight },
  ];
  const boxW = (CONTENT_W - 8) / 3;
  impactBoxes.forEach((box, i) => {
    const bx = MARGIN + i * (boxW + 4);
    setFill(box.bg);
    doc.roundedRect(bx, y, boxW, 20, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    setText(box.color);
    doc.text(box.value, bx + boxW / 2, y + 9, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    setText(COLORS.charcoal);
    doc.text(box.label, bx + boxW / 2, y + 15, { align: "center" });
  });
  y += 26;

  // ---------- ECOPOINTS CALLOUT ----------
  ensureSpace(18);
  setFill(COLORS.lightGray);
  doc.roundedRect(MARGIN, y, CONTENT_W, 16, 2, 2, "F");
  
  // Left border accent
  setFill(COLORS.emerald);
  doc.roundedRect(MARGIN, y, 2.2, 16, 1.1, 1.1, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setText(COLORS.charcoal);
  doc.text(`VALIDATED PASSPORT: ${result.passport_id || "N/A"}`, MARGIN + 6, y + 10);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setText(COLORS.emeraldDark);
  doc.text(`${result.eco_points ?? 0} ECOPOINTS EARNED`, PAGE_W - MARGIN - 6, y + 10, { align: "right" });

  y += 22;

  drawFooter();
  return doc;
}