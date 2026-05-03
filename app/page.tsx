'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { nanoid } from 'nanoid';
import { useLanguage } from '@/hooks/useLanguage';
import { useUpload } from '@/hooks/useUpload';
import { t } from '@/lib/i18n';
import { saveScan } from '@/lib/storage';
import type { DiagnosisResult, DiagnosisError, ErrorCode, ScanRecord } from '@/types/diagnosis';
import Header from '@/components/Header';
import UploadCard from '@/components/UploadCard';
import ContextInput from '@/components/ContextInput';
import AnalyzeButton from '@/components/AnalyzeButton';
import ErrorToast from '@/components/ErrorToast';
import LoadingScreen from '@/components/LoadingScreen';
import RecentScansList from '@/components/RecentScansList';

export default function HomePage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const { selectedFile, previewUrl, imageThumb, validationError, handleFileSelect } = useUpload();

  const [contextText, setContextText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorCode | null>(null);

  // Surface client-side validation errors from useUpload immediately
  useEffect(() => {
    if (validationError) setError(validationError as ErrorCode);
  }, [validationError]);

  async function handleAnalyze() {
    if (!selectedFile || loading) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('context', contextText.trim());
    formData.append('language', lang);

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const json = await res.json();

      if (!res.ok) {
        const err = json as DiagnosisError;
        setError(err.error?.code ?? 'UPSTREAM_ERROR');
        setLoading(false);
        return;
      }

      const result = json as DiagnosisResult;

      // Build ScanRecord and persist
      const scan: ScanRecord = {
        ...result,
        id: nanoid(8),
        date: new Date().toISOString(),
        lang,
        imageThumb: imageThumb ?? undefined,
      };
      saveScan(scan);

      // Pass result via sessionStorage to avoid URL encoding of large data
      sessionStorage.setItem('zaraat_current_result', JSON.stringify(result));
      sessionStorage.setItem('zaraat_current_date', scan.date);

      router.push('/result');
    } catch {
      setError('UPSTREAM_ERROR');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-base">
      <Header />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-16">
        {/* Tagline */}
        <div className="text-center space-y-1 pt-2">
          <p className="text-primary/70 text-sm">{t('tagline', lang)}</p>
        </div>

        {/* Upload Card */}
        <UploadCard previewUrl={previewUrl} onFileSelect={handleFileSelect} />

        {/* Optional Context */}
        <ContextInput value={contextText} onChange={setContextText} />

        {/* Analyze CTA */}
        <AnalyzeButton
          disabled={!selectedFile}
          loading={loading}
          onClick={handleAnalyze}
        />

        {/* Recent Scans */}
        <RecentScansList />

        {/* FAQ Footer Link */}
        <footer className="text-center pt-4">
          <Link
            href="/faq"
            className="text-sm text-primary/70 hover:text-primary underline underline-offset-2 transition-colors"
          >
            {t('faqLink', lang)}
          </Link>
        </footer>
      </main>

      {/* Overlays */}
      <LoadingScreen visible={loading} />
      <ErrorToast
        code={error}
        onRetry={() => {
          setError(null);
          handleAnalyze();
        }}
        onDismiss={() => setError(null)}
      />
    </div>
  );
}
