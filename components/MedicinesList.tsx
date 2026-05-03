'use client';

import { useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import type { MedicineSet } from '@/types/diagnosis';
import gsap from 'gsap';

interface MedicinesListProps {
  medicines: MedicineSet;
}

export default function MedicinesList({ medicines }: MedicinesListProps) {
  const { lang } = useLanguage();
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = divRef.current;
    if (!el) return;
    gsap.killTweensOf(el);
    gsap.set(el, { opacity: 0, y: 15 });
    const tween = gsap.to(el, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.8 });
    return () => {
      tween.kill();
      gsap.set(el, { clearProps: 'opacity,y' });
    };
  }, []);

  return (
    <div ref={divRef} className="space-y-3">
      <h3 className="font-bold text-primary text-base flex items-center gap-2">
        <span>💊</span>
        {t('medicinesTitle', lang)}
      </h3>

      {/* Brand Names */}
      <div className="bg-white border border-accent/30 rounded-xl p-3 space-y-1.5">
        <p className="text-xs font-semibold text-primary uppercase tracking-wide">
          {t('brandLabel', lang)}
        </p>
        {medicines.brandNames.length > 0 ? (
          <ul className="space-y-1">
            {medicines.brandNames.map((name, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-accent mt-0.5 flex-shrink-0">•</span>
                {name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 italic">{t('medicinesNone', lang)}</p>
        )}
      </div>

      {/* Generic Names */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-1.5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {t('genericLabel', lang)}
        </p>
        {medicines.genericNames.length > 0 ? (
          <ul className="space-y-1">
            {medicines.genericNames.map((name, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-gray-400 mt-0.5 flex-shrink-0">🧪</span>
                {name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 italic">{t('medicinesNone', lang)}</p>
        )}
      </div>
    </div>
  );
}
