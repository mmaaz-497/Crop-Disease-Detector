'use client';

import { useRef, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import type { DiagnosisResult } from '@/types/diagnosis';
import gsap from 'gsap';

interface PDFExportButtonProps {
  result: DiagnosisResult;
  scanDate: string;
}

export default function PDFExportButton({ result, scanDate }: PDFExportButtonProps) {
  const { lang } = useLanguage();
  const [generating, setGenerating] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  async function handleDownload() {
    if (generating) return;
    setGenerating(true);
    try {
      const { generateDiagnosisPDF } = await import('@/lib/pdf');
      await generateDiagnosisPDF(result, scanDate, lang);
    } catch {
      // PDF generation failed silently — user can retry
    } finally {
      setGenerating(false);
    }
  }

  function onMouseEnter() {
    if (generating) return;
    gsap.to(btnRef.current, { scale: 1.04, duration: 0.15 });
  }
  function onMouseLeave() {
    gsap.to(btnRef.current, { scale: 1, duration: 0.15 });
  }

  return (
    <button
      ref={btnRef}
      onClick={handleDownload}
      disabled={generating}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="flex-1 min-h-[48px] flex items-center justify-center gap-2 bg-primary text-white rounded-xl font-semibold text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {generating ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {t('pdfGenerating', lang)}
        </>
      ) : (
        <>
          <span>📄</span>
          {t('pdfBtn', lang)}
        </>
      )}
    </button>
  );
}
