'use client';

import { useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import gsap from 'gsap';

interface SprayScheduleProps {
  schedule: string;
}

export default function SpraySchedule({ schedule }: SprayScheduleProps) {
  const { lang } = useLanguage();
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = divRef.current;
    if (!el) return;
    gsap.killTweensOf(el);
    gsap.set(el, { opacity: 0, y: 15 });
    const tween = gsap.to(el, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.7 });
    return () => {
      tween.kill();
      gsap.set(el, { clearProps: 'opacity,y' });
    };
  }, []);

  const isNA = !schedule || schedule.trim().toUpperCase() === 'N/A';

  return (
    <div ref={divRef} className="bg-accent/10 rounded-xl p-4 space-y-1">
      <h3 className="font-bold text-primary text-base flex items-center gap-2">
        <span>💧</span>
        {t('sprayTitle', lang)}
      </h3>
      {isNA ? (
        <p className="text-sm text-gray-400 italic">{t('sprayNA', lang)}</p>
      ) : (
        <p className="text-sm text-gray-700 italic leading-relaxed">{schedule}</p>
      )}
    </div>
  );
}
