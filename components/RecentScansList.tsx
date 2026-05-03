'use client';

import { useRef, useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import type { ScanRecord } from '@/types/diagnosis';
import { getScans, deleteScan } from '@/lib/storage';
import SeverityBadge from './SeverityBadge';
import gsap from 'gsap';

export default function RecentScansList() {
  const { lang } = useLanguage();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const listRef = useRef<HTMLUListElement>(null);
  const rowRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  useEffect(() => {
    setScans(getScans());
  }, []);

  useEffect(() => {
    if (scans.length === 0) return;
    const items = listRef.current?.querySelectorAll('li');
    if (!items || items.length === 0) return;
    gsap.killTweensOf(items);
    const tween = gsap.from(items, {
      opacity: 0,
      y: 10,
      stagger: 0.07,
      duration: 0.3,
      ease: 'power2.out',
    });
    return () => { tween.kill(); };
  }, [scans.length]);

  function handleDelete(id: string) {
    const el = rowRefs.current.get(id);
    if (el) {
      gsap.to(el, {
        opacity: 0,
        x: lang === 'ur' ? 40 : -40,
        height: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
        duration: 0.28,
        ease: 'power2.in',
        onComplete: () => {
          deleteScan(id);
          setScans((prev) => prev.filter((s) => s.id !== id));
          rowRefs.current.delete(id);
        },
      });
    } else {
      deleteScan(id);
      setScans((prev) => prev.filter((s) => s.id !== id));
    }
  }

  async function handleReExport(scan: ScanRecord) {
    try {
      const { generateDiagnosisPDF } = await import('@/lib/pdf');
      // No captureRef available from history — use null (falls back to text-only)
      await generateDiagnosisPDF(scan, scan.date, scan.lang, null);
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
            ref={(el) => {
              if (el) rowRefs.current.set(scan.id, el);
            }}
            className="bg-white rounded-2xl border border-accent/20 p-4 flex items-start gap-3 shadow-sm overflow-hidden"
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

            {/* Actions */}
            <div className="flex flex-col gap-1.5 flex-shrink-0">
              <button
                onClick={() => handleReExport(scan)}
                className="p-2 rounded-xl bg-base hover:bg-accent/10 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                title={t('pdfBtn', lang)}
                aria-label={t('pdfBtn', lang)}
              >
                📄
              </button>
              <button
                onClick={() => handleDelete(scan.id)}
                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center text-red-500 hover:text-red-600"
                title={t('deleteBtn', lang)}
                aria-label={t('deleteBtn', lang)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
