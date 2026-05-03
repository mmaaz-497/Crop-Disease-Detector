'use client';

import { useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import gsap from 'gsap';

interface TreatmentStepsProps {
  steps: string[];
}


export default function TreatmentSteps({ steps }: TreatmentStepsProps) {
  const { lang } = useLanguage();
  const olRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const items = olRef.current?.querySelectorAll('li');
    if (!items || items.length === 0) return;
    gsap.killTweensOf(items);
    const tween = gsap.from(items, {
      opacity: 0,
      x: lang === 'ur' ? 20 : -20,
      stagger: 0.1,
      duration: 0.4,
      ease: 'power2.out',
      delay: 0.5,
    });
    return () => {
      tween.kill();
      gsap.set(items, { clearProps: 'opacity,x' });
    };
  }, [lang, steps]);

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-primary text-base">{t('treatmentTitle', lang)}</h3>
      <ol ref={olRef} className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <span className="text-sm text-gray-700 leading-relaxed pt-0.5">{step.replace(/^\d+\.\s*/, '')}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
