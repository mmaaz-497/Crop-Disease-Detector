'use client';

import { useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import gsap from 'gsap';

interface AnalyzeButtonProps {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}

export default function AnalyzeButton({ disabled, loading, onClick }: AnalyzeButtonProps) {
  const { lang } = useLanguage();
  const btnRef = useRef<HTMLButtonElement>(null);

  const isDisabled = disabled || loading;

  function onMouseEnter() {
    if (isDisabled) return;
    gsap.to(btnRef.current, { scale: 1.04, duration: 0.15, ease: 'power2.out' });
  }

  function onMouseLeave() {
    gsap.to(btnRef.current, { scale: 1, duration: 0.15, ease: 'power2.out' });
  }

  function onTouchStart() {
    if (isDisabled) return;
    gsap.to(btnRef.current, { scale: 0.97, duration: 0.1 });
  }

  function onTouchEnd() {
    gsap.to(btnRef.current, { scale: 1, duration: 0.15 });
  }

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      disabled={isDisabled}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className={`w-full min-h-[52px] rounded-2xl font-bold text-lg text-white transition-colors flex items-center justify-center gap-2 ${
        isDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary shadow-md'
      }`}
    >
      {loading && (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {loading ? t('analyzingBtn', lang) : t('analyzeBtn', lang)}
    </button>
  );
}
