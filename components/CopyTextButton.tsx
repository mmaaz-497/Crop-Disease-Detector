'use client';

import { useRef, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import type { DiagnosisResult } from '@/types/diagnosis';
import gsap from 'gsap';

interface CopyTextButtonProps {
  result: DiagnosisResult;
}

function buildCopyText(result: DiagnosisResult, lang: string): string {
  const lines = [
    result.disease,
    '',
    `${lang === 'ur' ? 'شدت' : 'Severity'}: ${result.severity}`,
    '',
    lang === 'ur' ? 'علاج:' : 'Treatment:',
    ...result.treatmentSteps,
    '',
    `${lang === 'ur' ? 'اسپرے' : 'Spray'}: ${result.spraySchedule}`,
    '',
    `${lang === 'ur' ? 'برانڈ دوائیں' : 'Brand medicines'}: ${result.medicines.brandNames.join(', ')}`,
    `${lang === 'ur' ? 'جنرک دوائیں' : 'Generic medicines'}: ${result.medicines.genericNames.join(', ')}`,
  ];
  return lines.join('\n');
}

export default function CopyTextButton({ result }: CopyTextButtonProps) {
  const { lang } = useLanguage();
  const [copied, setCopied] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildCopyText(result, lang));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available — silent fail
    }
  }

  function onMouseEnter() {
    gsap.to(btnRef.current, { scale: 1.04, duration: 0.15 });
  }
  function onMouseLeave() {
    gsap.to(btnRef.current, { scale: 1, duration: 0.15 });
  }

  return (
    <button
      ref={btnRef}
      onClick={handleCopy}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="flex-1 min-h-[48px] flex items-center justify-center gap-2 border-2 border-primary text-primary rounded-xl font-semibold text-sm bg-white transition-colors hover:bg-primary/5"
    >
      {copied ? (
        <span className="text-accent font-bold">{t('copiedMsg', lang)}</span>
      ) : (
        <>
          <span>📋</span>
          {t('copyBtn', lang)}
        </>
      )}
    </button>
  );
}
