'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';

interface ContextInputProps {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
}

export default function ContextInput({ value, onChange, maxLength = 500 }: ContextInputProps) {
  const { lang } = useLanguage();

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-primary mb-1.5">
        {t('contextLabel', lang)}
      </label>
      <textarea
        rows={3}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('contextPlaceholder', lang)}
        className="w-full border border-accent/50 rounded-xl p-3 text-sm resize-none bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-shadow"
        dir="auto"
      />
      <p className="text-end text-xs text-gray-400 mt-1">
        {value.length}/{maxLength}
      </p>
    </div>
  );
}
