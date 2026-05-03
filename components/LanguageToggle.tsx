'use client';

import { useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import gsap from 'gsap';

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const sliderRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slider = sliderRef.current;
    const track = trackRef.current;
    if (!slider || !track) return;
    const half = track.offsetWidth / 2;
    gsap.killTweensOf(slider);
    const tween = gsap.to(slider, {
      x: lang === 'en' ? half : 0,
      duration: 0.25,
      ease: 'power2.inOut',
    });
    return () => { tween.kill(); };
  }, [lang]);

  return (
    <div
      ref={trackRef}
      className="relative flex items-center bg-white/15 rounded-full p-0.5 h-9 w-[88px] cursor-pointer select-none flex-shrink-0"
      onClick={() => setLang(lang === 'ur' ? 'en' : 'ur')}
      role="button"
      aria-label={lang === 'ur' ? 'Switch to English' : 'اردو پر جائیں'}
    >
      {/* sliding active pill */}
      <span
        ref={sliderRef}
        className="absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-white shadow-sm"
      />

      {/* labels — always LTR so positions stay consistent */}
      <div className="relative flex w-full" dir="ltr">
        <span
          className={`flex-1 text-center text-[13px] font-bold transition-colors duration-200 z-10 ${
            lang === 'ur' ? 'text-primary' : 'text-white/60'
          }`}
        >
          اردو
        </span>
        <span
          className={`flex-1 text-center text-[13px] font-bold transition-colors duration-200 z-10 ${
            lang === 'en' ? 'text-primary' : 'text-white/60'
          }`}
        >
          EN
        </span>
      </div>
    </div>
  );
}
