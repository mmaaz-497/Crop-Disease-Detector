'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import gsap from 'gsap';

interface UploadCardProps {
  previewUrl: string | null;
  onFileSelect: (file: File) => void;
}

export default function UploadCard({ previewUrl, onFileSelect }: UploadCardProps) {
  const { lang } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Mount fade-up — no scope arg so GSAP doesn't track child nodes
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    gsap.set(el, { opacity: 0, y: 20 });
    const tween = gsap.to(el, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
    return () => {
      tween.kill();
      gsap.set(el, { clearProps: 'opacity,y' });
    };
  }, []);

  // Drag-over visual feedback — kill previous tween first
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    gsap.killTweensOf(el, 'scale');
    const tween = gsap.to(el, { scale: isDragOver ? 1.02 : 1, duration: 0.15, ease: 'power2.out' });
    return () => { tween.kill(); };
  }, [isDragOver]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  }

  return (
    <div
      ref={cardRef}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`w-full rounded-2xl border-2 border-dashed transition-colors bg-white p-5 ${
        isDragOver ? 'border-accent bg-accent/5' : 'border-accent/40'
      }`}
    >
      {previewUrl ? (
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-40 h-40 rounded-xl overflow-hidden shadow-md">
            <Image
              src={previewUrl}
              alt="Selected crop leaf"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <p className="text-xs text-gray-500">{t('uploadSubtitle', lang)}</p>
          {/* Allow re-selection */}
          <div className="flex gap-3">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="text-xs text-primary underline underline-offset-2"
            >
              {t('cameraBtn', lang)}
            </button>
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="text-xs text-primary underline underline-offset-2"
            >
              {t('galleryBtn', lang)}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
            <span className="text-3xl">🌿</span>
          </div>
          <div className="text-center">
            <p className="font-semibold text-primary text-base">{t('uploadTitle', lang)}</p>
            <p className="text-xs text-gray-400 mt-1">{t('uploadSubtitle', lang)}</p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 min-h-[48px] flex items-center justify-center gap-2 bg-primary text-white rounded-xl font-semibold text-sm"
            >
              📷 {t('cameraBtn', lang)}
            </button>
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="flex-1 min-h-[48px] flex items-center justify-center gap-2 border-2 border-primary text-primary rounded-xl font-semibold text-sm bg-white"
            >
              🖼️ {t('galleryBtn', lang)}
            </button>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleInputChange}
        aria-label="Take a photo"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleInputChange}
        aria-label="Choose from gallery"
      />
    </div>
  );
}
