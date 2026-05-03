'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface FAQItemProps {
  q: string;
  a: string | string[];
  index: number;
}

export default function FAQItem({ q, a, index }: FAQItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(itemRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.4,
        ease: 'power2.out',
        delay: index * 0.1,
        scrollTrigger: {
          trigger: itemRef.current,
          start: 'top 88%',
          once: true,
        },
      });
    }, itemRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll()
        .filter((st) => st.trigger === itemRef.current)
        .forEach((st) => st.kill());
    };
  }, [index]);

  return (
    <div
      ref={itemRef}
      className="bg-white rounded-2xl p-5 shadow-sm border border-accent/20 space-y-2"
    >
      <h3 className="font-bold text-primary text-base">{q}</h3>
      {Array.isArray(a) ? (
        <ul className="space-y-1">
          {a.map((item, i) => (
            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
              <span className="text-accent mt-0.5 flex-shrink-0">•</span>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
      )}
    </div>
  );
}
