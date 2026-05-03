'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import Header from '@/components/Header';
import FAQItem from '@/components/FAQItem';

export default function FAQPage() {
  const { lang } = useLanguage();

  const faqs = [
    {
      q: t('faqQ1', lang),
      a: [t('faqA1a', lang), t('faqA1b', lang), t('faqA1c', lang), t('faqA1d', lang)],
    },
    {
      q: t('faqQ2', lang),
      a: t('faqA2', lang),
    },
    {
      q: t('faqQ3', lang),
      a: t('faqA3', lang),
    },
    {
      q: t('faqQ4', lang),
      a: [t('faqA4a', lang), t('faqA4b', lang), t('faqA4c', lang), t('faqA4d', lang)],
    },
    {
      q: t('faqQ5', lang),
      a: t('faqA5', lang),
    },
  ];

  return (
    <div className="min-h-screen bg-base">
      <Header showBack backHref="/" />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4 pb-12">
        <h1 className="text-2xl font-bold text-primary">{t('faqTitle', lang)}</h1>

        {faqs.map((item, i) => (
          <FAQItem key={i} q={item.q} a={item.a} index={i} />
        ))}
      </main>
    </div>
  );
}
