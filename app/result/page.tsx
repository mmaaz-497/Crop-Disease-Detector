'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import type { DiagnosisResult } from '@/types/diagnosis';
import Header from '@/components/Header';
import ResultCard from '@/components/ResultCard';
import CopyTextButton from '@/components/CopyTextButton';
import PDFExportButton from '@/components/PDFExportButton';

export default function ResultPage() {
  const { lang } = useLanguage();
  const router = useRouter();
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [scanDate, setScanDate] = useState<string>(new Date().toISOString());

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('zaraat_current_result');
      const dateRaw = sessionStorage.getItem('zaraat_current_date');
      if (!raw) {
        router.replace('/');
        return;
      }
      setResult(JSON.parse(raw));
      if (dateRaw) setScanDate(dateRaw);
    } catch {
      router.replace('/');
    }
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base">
      <Header showBack backHref="/" />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-12">
        <h1 className="text-2xl font-bold text-primary">{t('resultTitle', lang)}</h1>

        <ResultCard result={result} />

        {/* Action buttons */}
        <div className="flex gap-3">
          <CopyTextButton result={result} />
          <PDFExportButton result={result} scanDate={scanDate} />
        </div>

        {/* Scan Again */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block text-primary font-semibold text-sm underline underline-offset-2 hover:text-primary/80 transition-colors"
          >
            {t('scanAgain', lang)}
          </Link>
        </div>
      </main>
    </div>
  );
}
