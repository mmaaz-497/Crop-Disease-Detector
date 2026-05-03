'use client';

import { useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import type { ErrorCode } from '@/types/diagnosis';
import type { StringKey } from '@/lib/i18n';
import gsap from 'gsap';

interface ErrorToastProps {
  code: ErrorCode | null;
  onRetry: () => void;
  onDismiss: () => void;
}

const errorKeyMap: Record<ErrorCode, StringKey> = {
  INVALID_IMAGE: 'errInvalidImage',
  NOT_A_CROP: 'errNotACrop',
  DIAGNOSIS_FAILED: 'errDiagnosisFailed',
  UPSTREAM_ERROR: 'errUpstream',
  TIMEOUT: 'errTimeout',
  RATE_LIMITED: 'errRateLimited',
};

export default function ErrorToast({ code, onRetry, onDismiss }: ErrorToastProps) {
  const { lang } = useLanguage();
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = toastRef.current;
    if (!code || !el) return;
    gsap.killTweensOf(el);
    gsap.fromTo(el, { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' });
    return () => { gsap.killTweensOf(el); };
  }, [code]);

  if (!code) return null;

  function handleDismiss() {
    if (!toastRef.current) { onDismiss(); return; }
    gsap.to(toastRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.2,
      onComplete: onDismiss,
    });
  }

  const key = errorKeyMap[code];

  return (
    <div
      ref={toastRef}
      className="fixed top-14 start-4 end-4 z-50 bg-red-50 border border-red-200 rounded-2xl p-4 shadow-lg flex items-start gap-3"
      role="alert"
    >
      <span className="text-red-500 text-xl flex-shrink-0" aria-hidden>⚠️</span>
      <p className="flex-1 text-sm text-red-700 font-medium">{t(key, lang)}</p>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={onRetry}
          className="text-xs bg-red-600 text-white rounded-lg px-3 py-1.5 font-semibold hover:bg-red-700 transition-colors min-h-[32px]"
        >
          {t('retryBtn', lang)}
        </button>
        <button
          onClick={handleDismiss}
          className="text-xs text-red-500 hover:text-red-700 transition-colors px-1 min-h-[32px]"
          aria-label="Dismiss"
        >
          {t('dismissBtn', lang)}
        </button>
      </div>
    </div>
  );
}
