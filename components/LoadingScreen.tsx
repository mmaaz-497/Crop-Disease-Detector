'use client';

import { useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import gsap from 'gsap';

interface LoadingScreenProps {
  visible: boolean;
}

export default function LoadingScreen({ visible }: LoadingScreenProps) {
  const { lang } = useLanguage();
  const screenRef = useRef<HTMLDivElement>(null);
  const leafRef = useRef<SVGSVGElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (visible) {
      // Reset bar to 0 before animating
      if (barRef.current) gsap.set(barRef.current, { width: '0%' });

      ctxRef.current = gsap.context(() => {
        // Fade in screen
        gsap.fromTo(screenRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });

        // Rotate leaf indefinitely
        gsap.to(leafRef.current, {
          rotation: 360,
          duration: 2,
          repeat: -1,
          ease: 'none',
          transformOrigin: 'center center',
        });

        // Progress bar: crawl to 95% over 8 seconds
        gsap.to(barRef.current, {
          width: '95%',
          duration: 8,
          ease: 'power1.inOut',
        });
      });
    } else {
      ctxRef.current?.revert();
      ctxRef.current = null;
      if (barRef.current) gsap.set(barRef.current, { width: '0%' });
      if (screenRef.current) gsap.set(screenRef.current, { opacity: 0 });
    }

    return () => {
      ctxRef.current?.revert();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={screenRef}
      className="fixed inset-0 bg-base/95 z-50 flex flex-col items-center justify-center gap-6 px-6"
      style={{ opacity: 0 }}
    >
      {/* Leaf SVG */}
      <svg
        ref={leafRef}
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        <path
          d="M32 4C18 4 8 18 8 32C8 46 18 56 32 56C46 56 56 46 56 32C56 18 46 4 32 4Z"
          fill="#74C69D"
          opacity="0.3"
        />
        <path
          d="M32 8C20 8 12 20 12 32C12 44 20 52 32 52C44 52 52 44 52 32C52 20 44 8 32 8Z"
          fill="#1B4332"
          opacity="0.8"
        />
        <path d="M32 12C32 12 20 28 32 52C44 28 32 12 32 12Z" fill="#74C69D" />
      </svg>

      <div className="text-center space-y-2">
        <p className="text-primary font-bold text-lg">{t('loadingMsg', lang)}</p>
        <p className="text-gray-500 text-sm">{t('loadingHint', lang)}</p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs bg-accent/20 rounded-full h-2 overflow-hidden">
        <div
          ref={barRef}
          className="h-full bg-accent rounded-full"
          style={{ width: '0%' }}
        />
      </div>
    </div>
  );
}
