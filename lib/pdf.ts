import type { DiagnosisResult, Language } from '@/types/diagnosis';

const PAGE_W = 210;   // A4 mm
const MARGIN = 16;
const CAPTURE_PX = 640; // fixed pixel width for the off-screen clone

/** Strip every inline style GSAP may have left on the cloned tree */
function resetGsapStyles(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>('[style]').forEach((el) => {
    el.style.removeProperty('transform');
    el.style.removeProperty('opacity');
    el.style.removeProperty('visibility');
    el.style.removeProperty('will-change');
    el.style.opacity = '1';
  });
  // Also clear root itself
  root.style.removeProperty('transform');
  root.style.removeProperty('opacity');
  root.style.opacity = '1';
}

/** Render captureElement into an off-screen fixed-width container and return canvas */
async function captureFixedWidth(
  captureElement: HTMLElement,
): Promise<HTMLCanvasElement> {
  const { default: html2canvas } = await import('html2canvas');

  // Off-screen container — fixed 640 px wide, not part of layout flow
  const wrapper = document.createElement('div');
  wrapper.style.cssText = [
    'position:fixed',
    'top:0',
    'left:-9999px',
    `width:${CAPTURE_PX}px`,
    'background:#F0FFF4',
    'padding:12px',
    'box-sizing:border-box',
    'z-index:-9999',
  ].join(';');

  const clone = captureElement.cloneNode(true) as HTMLElement;
  clone.style.width = '100%';
  clone.style.maxWidth = '100%';
  clone.style.overflow = 'visible';
  resetGsapStyles(clone);

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#F0FFF4',
      logging: false,
      width: CAPTURE_PX,
      windowWidth: CAPTURE_PX,
    });
    return canvas;
  } finally {
    document.body.removeChild(wrapper);
  }
}

export async function generateDiagnosisPDF(
  result: DiagnosisResult,
  scanDate: string,
  lang: Language,
  captureElement: HTMLElement | null,
): Promise<void> {
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const usableW = PAGE_W - 2 * MARGIN;
  let y = MARGIN;

  // ── Header (pure ASCII — Helvetica handles it perfectly) ──────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(27, 67, 50);
  doc.text('Zaraat AI', MARGIN, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(90, 120, 90);
  doc.text(
    lang === 'ur' ? 'AI Crop Diagnosis Report (Urdu)' : 'AI Crop Diagnosis Report',
    MARGIN,
    y,
  );
  y += 5.5;

  // Meta row: date left, category+severity right
  doc.setFontSize(8.5);
  doc.setTextColor(140);
  doc.text('Date: ' + scanDate.slice(0, 10), MARGIN, y);
  const categoryLabel =
    result.category === 'Pest'
      ? 'Pest'
      : result.category === 'Nutrient Deficiency'
      ? 'Nutrient Deficiency'
      : 'Disease';
  const metaRight = categoryLabel + '  |  Severity: ' + result.severity;
  doc.text(metaRight, PAGE_W - MARGIN - doc.getTextWidth(metaRight), y);
  y += 5;

  // Green separator
  doc.setDrawColor(116, 198, 157);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 7;

  // ── Body ──────────────────────────────────────────────────────────────────
  if (captureElement) {
    const canvas = await captureFixedWidth(captureElement);

    const imgData = canvas.toDataURL('image/png');
    // canvas.width is at 2× scale, so logical pixels = canvas.width / 2
    const logicalW = canvas.width / 2;
    const logicalH = canvas.height / 2;

    // Map logical pixels → mm using the capture container width
    const mmPerPx = usableW / logicalW;
    const imgH = logicalH * mmPerPx;

    const remainingPage = 287 - y - 6; // leave 6mm above footer

    if (imgH <= remainingPage) {
      // Fits on current page
      doc.addImage(imgData, 'PNG', MARGIN, y, usableW, imgH);
      y += imgH;
    } else {
      // Try to fit by scaling down proportionally
      const scale = remainingPage / imgH;
      const scaledW = usableW * scale;
      const scaledH = imgH * scale;
      const xOffset = MARGIN + (usableW - scaledW) / 2;
      doc.addImage(imgData, 'PNG', xOffset, y, scaledW, scaledH);
      y += scaledH;
    }
  } else {
    // Text-only fallback (used when re-exporting from history without live DOM)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(27, 67, 50);
    const diseaseLines = doc.splitTextToSize(result.disease, usableW) as string[];
    doc.text(diseaseLines, MARGIN, y);
    y += diseaseLines.length * 6 + 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50);
    doc.text('Treatment Steps:', MARGIN, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70);
    result.treatmentSteps.forEach((step) => {
      if (y > 275) { doc.addPage(); y = MARGIN; }
      const wrapped = doc.splitTextToSize(step, usableW) as string[];
      doc.text(wrapped, MARGIN, y);
      y += wrapped.length * 5 + 2;
    });

    if (result.spraySchedule && result.spraySchedule.toUpperCase() !== 'N/A') {
      y += 3;
      doc.setFont('helvetica', 'bold');
      doc.text('Spray Schedule:', MARGIN, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      const sprayLines = doc.splitTextToSize(result.spraySchedule, usableW) as string[];
      doc.text(sprayLines, MARGIN, y);
    }
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(170);
  doc.text('Generated by Zaraat AI — For guidance only', MARGIN, 289);

  doc.save(`Zaraat-AI-${scanDate.slice(0, 10)}.pdf`);
}
