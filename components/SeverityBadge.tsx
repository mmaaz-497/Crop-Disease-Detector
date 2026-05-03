'use client';

import { useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import type { SeverityLevel } from '@/types/diagnosis';
import gsap from 'gsap';

interface SeverityBadgeProps {
  severity: SeverityLevel;
}

const colorMap: Record<SeverityLevel, string> = {
  Mild: 'bg-accent text-white',
  Moderate: 'bg-amber-500 text-white',
  Severe: 'bg-red-500 text-white',
};

const labelKey: Record<SeverityLevel, 'severityMild' | 'severityModerate' | 'severitySevere'> = {
  Mild: 'severityMild',
  Moderate: 'severityModerate',
  Severe: 'severitySevere',
};

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const { lang } = useLanguage();
  const badgeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = badgeRef.current;
    if (!el) return;
    gsap.killTweensOf(el);
    gsap.set(el, { scale: 0 });
    const tween = gsap.to(el, { scale: 1, duration: 0.4, ease: 'back.out(2)', delay: 0.3 });
    return () => {
      tween.kill();
      gsap.set(el, { clearProps: 'scale' });
    };
  }, []);

  return (
    <span
      ref={badgeRef}
      className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${colorMap[severity]}`}
    >
      {t(labelKey[severity], lang)} — {severity}
    </span>
  );
}
