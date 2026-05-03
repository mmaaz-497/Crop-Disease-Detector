'use client';

import { useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import type { DiagnosisResult } from '@/types/diagnosis';
import SeverityBadge from './SeverityBadge';
import TreatmentSteps from './TreatmentSteps';
import SpraySchedule from './SpraySchedule';
import MedicinesList from './MedicinesList';
import gsap from 'gsap';

interface ResultCardProps {
  result: DiagnosisResult;
}

export default function ResultCard({ result }: ResultCardProps) {
  const { lang } = useLanguage();
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    gsap.killTweensOf(el);
    gsap.set(el, { opacity: 0, scale: 0.85 });
    const tween = gsap.to(el, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' });
    return () => {
      tween.kill();
      gsap.set(el, { clearProps: 'opacity,scale' });
    };
  }, [result]);

  return (
    <div className="space-y-5">
      {/* Issue name */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-accent/20 space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {t('diseaseLabel', lang)}
          </p>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {result.category === 'Disease'
              ? t('categoryDisease', lang)
              : result.category === 'Pest'
              ? t('categoryPest', lang)
              : t('categoryNutrient', lang)}
          </span>
        </div>
        <h2 ref={titleRef} className="text-xl font-bold text-primary leading-snug">
          {result.disease}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {t('severityLabel', lang)}:
          </span>
          <SeverityBadge severity={result.severity} />
        </div>
      </div>

      {/* Treatment steps */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-accent/20">
        <TreatmentSteps steps={result.treatmentSteps} />
      </div>

      {/* Spray schedule */}
      <SpraySchedule schedule={result.spraySchedule} />

      {/* Medicines */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-accent/20">
        <MedicinesList medicines={result.medicines} />
      </div>
    </div>
  );
}
