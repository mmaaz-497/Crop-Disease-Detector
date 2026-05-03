import type { DiagnosisResult, Language, SeverityLevel } from '@/types/diagnosis';

const PAGE_W = 210;
const MARGIN = 20;
const CONTENT_W = PAGE_W - 2 * MARGIN;

const SEVERITY_COLORS: Record<SeverityLevel, [number, number, number]> = {
  Mild: [116, 198, 157],
  Moderate: [245, 158, 11],
  Severe: [239, 68, 68],
};

async function loadFontBase64(): Promise<string | null> {
  try {
    const res = await fetch('/fonts/NotoNaskhArabic.b64.txt');
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function addPageIfNeeded(doc: import('jspdf').jsPDF, y: number, extra = 20): number {
  if (y > 260) {
    doc.addPage();
    return MARGIN + 10;
  }
  return y;
}

export async function generateDiagnosisPDF(
  result: DiagnosisResult,
  scanDate: string,
  lang: Language,
): Promise<void> {
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Attempt to load Urdu font
  let fontLoaded = false;
  if (lang === 'ur') {
    const b64 = await loadFontBase64();
    if (b64) {
      doc.addFileToVFS('NotoNaskhArabic.ttf', b64);
      doc.addFont('NotoNaskhArabic.ttf', 'NotoNaskhArabic', 'normal');
      doc.setFont('NotoNaskhArabic');
      fontLoaded = true;
    }
  }
  if (!fontLoaded) {
    doc.setFont('helvetica');
  }

  const isRTL = lang === 'ur';
  let y = MARGIN;

  // Helper: render a text line respecting RTL
  function renderLine(text: string, yPos: number, xOverride?: number): void {
    if (isRTL) {
      const tw = doc.getTextWidth(text);
      const x = xOverride !== undefined ? xOverride : PAGE_W - MARGIN - tw;
      doc.text(text, x, yPos);
    } else {
      doc.text(text, xOverride !== undefined ? xOverride : MARGIN, yPos);
    }
  }

  // Helper: wrapped text
  function renderWrapped(text: string, yPos: number): number {
    const lines = doc.splitTextToSize(text, CONTENT_W) as string[];
    lines.forEach((line: string, i: number) => {
      renderLine(line, yPos + i * 5.5);
    });
    return yPos + lines.length * 5.5;
  }

  // ── Block 1: Header ────────────────────────────────────────────────────────
  doc.setFontSize(20);
  doc.setTextColor(27, 67, 50);
  doc.setFont(fontLoaded ? 'NotoNaskhArabic' : 'helvetica', 'bold');
  renderLine('Zaraat AI | زرعت اے آئی', y);
  y += 7;

  doc.setFontSize(9);
  doc.setTextColor(100, 120, 100);
  doc.setFont(fontLoaded ? 'NotoNaskhArabic' : 'helvetica', 'normal');
  renderLine(
    lang === 'ur' ? 'AI فصل تشخیص رپورٹ' : 'AI Crop Diagnosis Report',
    y,
  );
  y += 5;

  // Rule
  doc.setDrawColor(116, 198, 157);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 7;

  // ── Block 2: Metadata ──────────────────────────────────────────────────────
  doc.setFontSize(9);
  doc.setTextColor(120);
  const dateLabel = lang === 'ur' ? 'تاریخ: ' : 'Date: ';
  renderLine(dateLabel + scanDate.slice(0, 10), y);
  y += 10;

  // ── Block 3: Disease Name ──────────────────────────────────────────────────
  y = addPageIfNeeded(doc, y);
  doc.setFontSize(15);
  doc.setTextColor(27, 67, 50);
  doc.setFont(fontLoaded ? 'NotoNaskhArabic' : 'helvetica', 'bold');
  y = renderWrapped(result.disease, y);
  y += 5;

  // ── Block 4: Severity Badge ────────────────────────────────────────────────
  y = addPageIfNeeded(doc, y);
  const [r, g, b] = SEVERITY_COLORS[result.severity];
  doc.setFillColor(r, g, b);
  doc.roundedRect(MARGIN, y, 55, 8, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFont(fontLoaded ? 'NotoNaskhArabic' : 'helvetica', 'bold');
  doc.text(result.severity, MARGIN + 3, y + 5.5);
  y += 14;

  // ── Block 5: Treatment Steps ───────────────────────────────────────────────
  y = addPageIfNeeded(doc, y);
  doc.setFontSize(11);
  doc.setTextColor(27, 67, 50);
  doc.setFont(fontLoaded ? 'NotoNaskhArabic' : 'helvetica', 'bold');
  renderLine(lang === 'ur' ? 'علاج کے اقدامات:' : 'Treatment Steps:', y);
  y += 7;

  doc.setFont(fontLoaded ? 'NotoNaskhArabic' : 'helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);

  result.treatmentSteps.forEach((step) => {
    y = addPageIfNeeded(doc, y);
    y = renderWrapped(step, y);
    y += 2;
  });
  y += 5;

  // ── Block 6: Spray Schedule ────────────────────────────────────────────────
  y = addPageIfNeeded(doc, y);
  doc.setFontSize(11);
  doc.setTextColor(27, 67, 50);
  doc.setFont(fontLoaded ? 'NotoNaskhArabic' : 'helvetica', 'bold');
  renderLine(lang === 'ur' ? 'اسپرے شیڈول:' : 'Spray Schedule:', y);
  y += 7;
  doc.setFont(fontLoaded ? 'NotoNaskhArabic' : 'helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  y = renderWrapped(result.spraySchedule, y);
  y += 7;

  // ── Block 7: Medicines ─────────────────────────────────────────────────────
  y = addPageIfNeeded(doc, y);
  doc.setFontSize(11);
  doc.setTextColor(27, 67, 50);
  doc.setFont(fontLoaded ? 'NotoNaskhArabic' : 'helvetica', 'bold');
  renderLine(lang === 'ur' ? 'دوائیں:' : 'Medicines:', y);
  y += 7;

  doc.setFont(fontLoaded ? 'NotoNaskhArabic' : 'helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(27, 67, 50);
  renderLine(lang === 'ur' ? 'برانڈ نام:' : 'Brand Names:', y);
  y += 5;
  doc.setFont(fontLoaded ? 'NotoNaskhArabic' : 'helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  result.medicines.brandNames.forEach((name) => {
    y = addPageIfNeeded(doc, y);
    renderLine('• ' + name, y);
    y += 5.5;
  });
  y += 3;

  doc.setFont(fontLoaded ? 'NotoNaskhArabic' : 'helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100);
  renderLine(lang === 'ur' ? 'جنرک نام:' : 'Generic Names:', y);
  y += 5;
  doc.setFont(fontLoaded ? 'NotoNaskhArabic' : 'helvetica', 'normal');
  doc.setTextColor(80);
  result.medicines.genericNames.forEach((name) => {
    y = addPageIfNeeded(doc, y);
    renderLine('🧪 ' + name, y);
    y += 5.5;
  });

  // ── Block 8: Footer ────────────────────────────────────────────────────────
  doc.setFontSize(8);
  doc.setTextColor(160);
  const footerText =
    lang === 'ur'
      ? 'زرعت اے آئی کی طرف سے تیار — صرف رہنمائی کے لیے'
      : 'Generated by Zaraat AI — For guidance only';
  doc.text(footerText, MARGIN, 287);

  const dateStr = scanDate.slice(0, 10);
  doc.save(`Zaraat AI-${dateStr}.pdf`);
}
