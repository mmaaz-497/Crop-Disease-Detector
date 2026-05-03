---
description: Generate a production-ready Zaraat AI UI component — TypeScript + Tailwind CSS (using Zaraat AI design tokens) + GSAP micro-animation, bilingual (Urdu/English via lib/i18n.ts), mobile-first, WCAG 2.1 AA compliant. Pass the component name and optional description as arguments.
---

## User Input

```text
$ARGUMENTS
```

The first argument is the **component name** (PascalCase). Any additional text is a description of what the component does.

Example: `UploadCard Displays the drag-and-drop / camera capture area on the dashboard`

## Outline

You are generating a Zaraat AI UI component. Every component MUST comply with all 8 constitution principles — especially:
- **Principle I** (Simplicity-First UX): minimal CTAs, plain-language labels
- **Principle II** (Mobile-First): 375 px base, touch targets ≥ 44 px
- **Principle V** (Bilingual): all strings from `lib/i18n.ts`, never hardcoded

### Step 1 — Parse arguments

Extract:
- `COMPONENT_NAME`: first word (PascalCase)
- `COMPONENT_DESCRIPTION`: remainder of the input (or "no description provided")

If no component name given, output: `Usage: /zaraat.component <ComponentName> [description]` and stop.

### Step 2 — Read i18n map

Read `lib/i18n.ts`. If it does not yet exist, create it with the base structure:

```typescript
export type Language = 'ur' | 'en';

export const strings: Record<string, Record<Language, string>> = {
  // Add entries as needed
};

export function t(key: string, lang: Language): string {
  return strings[key]?.[lang] ?? key;
}
```

Identify any existing keys that are relevant to the new component. Add new keys for any strings the component will need.

### Step 3 — Determine GSAP animation type

Based on the component name/description, choose the most appropriate micro-animation:

| Component type | Animation |
|---|---|
| Card / container | `gsap.from(ref, { opacity:0, y:20, duration:0.4, ease:'power2.out' })` on mount |
| Button | `gsap.to(ref, { scale:1.05, duration:0.15 })` on hover; reverse on leave |
| Result / diagnosis reveal | `gsap.from(ref, { opacity:0, y:30, duration:0.6, ease:'back.out(1.4)' })` |
| Badge / tag | `gsap.from(ref, { scale:0.8, opacity:0, duration:0.3 })` |
| Upload area | `gsap.from(ref, { borderColor:'#74C69D', duration:0.3 })` on drag-enter |

### Step 4 — Generate the component file

Write `components/<COMPONENT_NAME>.tsx` with:

1. `'use client'` directive (all components are client components unless they are pure display with no interaction)
2. TypeScript props interface
3. `useRef` for GSAP targets
4. `useEffect` for mount animation (with `gsap.context` for cleanup)
5. All strings via `t(key, lang)` — accept `lang: Language` prop
6. Tailwind classes using ONLY Zaraat AI tokens:
   - bg: `bg-primary` (#1B4332), `bg-accent` (#74C69D), `bg-base` (#F0FFF4)
   - text: `text-primary`, `text-white`
   - Interactive: `hover:` classes where applicable
7. Touch targets: buttons/clickable elements MUST have `min-h-[44px] min-w-[44px]`
8. `aria-label` on all icon-only buttons
9. Mobile-first responsive: start with base styles, add `md:` breakpoints where needed

Template structure:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { t, Language } from '@/lib/i18n';

interface <COMPONENT_NAME>Props {
  lang: Language;
  // ... additional props
}

export default function <COMPONENT_NAME>({ lang, ...props }: <COMPONENT_NAME>Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // GSAP animation here
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="...">
      {/* component JSX */}
    </div>
  );
}
```

### Step 5 — Update i18n.ts

Add any new string keys identified in Step 2 to `lib/i18n.ts` with both `ur` and `en` values. Use sensible Urdu translations.

### Step 6 — Validate

Check the generated file for:

- [ ] No hardcoded English/Urdu strings (all via `t()`)
- [ ] No `NEXT_PUBLIC_OPENAI` or OpenAI imports
- [ ] GSAP animation present with `ctx.revert()` cleanup
- [ ] All interactive elements ≥ 44 px touch target
- [ ] `lang` prop accepted and forwarded correctly
- [ ] TypeScript compiles (run `npx tsc --noEmit` and fix any errors)

### Step 7 — Report

```
✅ Created: components/<COMPONENT_NAME>.tsx
✅ i18n keys added: [list keys]
✅ GSAP animation: [animation type]
✅ Mobile-first: base layout targets 375px
✅ TypeScript: PASS
```
