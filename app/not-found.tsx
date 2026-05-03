'use client';

import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';

export default function NotFound() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center px-4 text-center gap-4">
      <span className="text-6xl font-black text-primary/20">404</span>
      <h1 className="text-2xl font-bold text-primary">{t('notFoundMsg', lang)}</h1>
      <Link
        href="/"
        className="mt-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold min-h-[52px] flex items-center hover:bg-primary/90 transition-colors"
      >
        {t('goHome', lang)}
      </Link>
    </div>
  );
}
