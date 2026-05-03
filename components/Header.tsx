'use client';

import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import LanguageToggle from './LanguageToggle';

interface HeaderProps {
  showBack?: boolean;
  backHref?: string;
}

export default function Header({ showBack = false, backHref = '/' }: HeaderProps) {
  const { lang } = useLanguage();

  return (
    <header className="bg-primary sticky top-0 z-40 shadow-lg">
      {/* Main bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-3">

        {/* Left: brand or back button */}
        <div className="flex items-center gap-2.5 min-w-0">
          {showBack ? (
            <Link
              href={backHref}
              className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors text-sm font-semibold group"
            >
              <span className="text-base transition-transform group-hover:-translate-x-0.5">
                {lang === 'ur' ? '→' : '←'}
              </span>
              <span>{t('backHome', lang)}</span>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xl leading-none" role="img" aria-label="leaf">🌿</span>
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-white text-base leading-tight tracking-tight">
                  Zaraat AI
                </p>
                <p className="text-accent text-[11px] font-medium leading-tight truncate">
                  {t('tagline', lang)}
                </p>
              </div>
            </Link>
          )}
        </div>

        {/* Right: nav + toggle */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {!showBack && (
            <Link
              href="/faq"
              className="hidden sm:block text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              {t('faqLink', lang)}
            </Link>
          )}
          <LanguageToggle />
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-0.5 bg-gradient-to-r from-accent/60 via-accent to-accent/60" />
    </header>
  );
}
