'use client';

import { useRef, useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import type { ScanRecord } from '@/types/diagnosis';
import { getScans } from '@/lib/storage';
import SeverityBadge from './SeverityBadge';
import gsap from 'gsap';

export default function RecentScansList() {
  const { lang } = useLanguage();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const loaded = getScans();
    setScans(loaded);
  }, []);

  useEffect(() => {
    if (scans.length === 0) return;
    const items = listRef.current?.querySelectorAll('li');
    if (!items || items.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.from(items, {
        opacity: 0,
        y: 10,
        stagger: 0.07,
        duration: 0.3,
        ease: 'power2.out',
      });
    }, listRef);
    return () => ctx.revert();
  }, [scans]);

  async function handleReExport(scan: ScanRecord) {
    try {
      const { generateDiagnosisPDF } = await import('@/lib/pdf');
      await generateDiagnosisPDF(scan, scan.date, scan.lang);
    } catch {
      // silent
    }
  }

  if (scans.length === 0) {
    return (
      <section className="mt-6">
        <h2 className="font-bold text-primary text-lg mb-3">{t('recentTitle', lang)}</h2>
        <p className="text-sm text-gray-400 text-center py-6">{t('noRecentScans', lang)}</p>
      </section>
    );
  }

  return (
    <section className="mt-6">
      <h2 className="font-bold text-primary text-lg mb-3">{t('recentTitle', lang)}</h2>
      <ul ref={listRef} className="space-y-3">
        {scans.map((scan) => (
          <li
            key={scan.id}
            className="bg-white rounded-2xl border border-accent/20 p-4 flex items-start gap-3 shadow-sm"
          >
            {/* Thumbnail */}
            {scan.imageThumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={scan.imageThumb}
                alt="Scan thumbnail"
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🌿</span>
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm font-semibold text-primary truncate">{scan.disease}</p>
              <p className="text-xs text-gray-400">
                {new Date(scan.date).toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-PK', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              <SeverityBadge severity={scan.severity} />
            </div>

            {/* PDF re-export */}
            <button
              onClick={() => handleReExport(scan)}
              className="flex-shrink-0 p-2 rounded-xl bg-base hover:bg-accent/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title={t('pdfBtn', lang)}
              aria-label={t('pdfBtn', lang)}
            >
              📄
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
