---
description: Add or fix GSAP micro-animations on any Zaraat AI component — button hover, card entrance, result reveal, upload drag-over, severity badge pop. Pass a component name or description. Validates SC-008 (animations present) and ensures animations use gsap.context cleanup to prevent memory leaks.
---

## User Input

```text
$ARGUMENTS
```

Arguments: `<ComponentName> <animation-type>`

Examples:
- `UploadCard entrance` — fade-up entrance when card mounts
- `ResultCard reveal` — staggered reveal of result sections
- `AnalyzeButton hover` — scale on hover, reverse on leave
- `SeverityBadge pop` — scale bounce when badge renders
- `LanguageToggle slide` — sliding switch transition

If no arguments given, scan ALL components for missing animations and add them.

## Outline

This skill fulfils **Success Criterion SC-008** from the Zaraat AI constitution: "Button hover, card entrance, and result reveal animations fire without jank."

### Step 1 — Parse arguments

Extract:
- `TARGET`: component name (PascalCase) or "all"
- `ANIMATION_TYPE`: entrance | reveal | hover | pop | slide | drag | (auto-detect if missing)

If `TARGET` is empty, set to "all" (scan mode).

### Step 2 — Animation type reference

Use this canonical library for all Zaraat AI animations:

```typescript
// ENTRANCE — card/container mounts
gsap.from(ref.current, {
  opacity: 0, y: 20, duration: 0.4, ease: 'power2.out'
});

// REVEAL — diagnosis result sections stagger
gsap.from(items, {
  opacity: 0, y: 30, duration: 0.5, stagger: 0.1, ease: 'back.out(1.4)'
});

// HOVER — button scale (attach to onMouseEnter / onMouseLeave)
// Enter:
gsap.to(ref.current, { scale: 1.05, duration: 0.15, ease: 'power1.out' });
// Leave:
gsap.to(ref.current, { scale: 1, duration: 0.15, ease: 'power1.out' });

// POP — badge bounces in
gsap.from(ref.current, {
  scale: 0.7, opacity: 0, duration: 0.35, ease: 'back.out(2)'
});

// SLIDE — toggle switch
gsap.to(indicator, { x: isUrdu ? 0 : 32, duration: 0.25, ease: 'power2.inOut' });

// DRAG-OVER — upload area border pulse
gsap.to(ref.current, {
  borderColor: '#74C69D', scale: 1.02, duration: 0.2, ease: 'power2.out'
});
// Drag leave — reverse
gsap.to(ref.current, {
  borderColor: '#1B4332', scale: 1, duration: 0.2
});
```

### Step 3 — Scan mode (TARGET = "all")

Read every file in `components/`. For each component:
- Check if `gsap` is imported
- Check if `useRef` is used for GSAP
- Check if `useEffect` with `gsap.context` is present
- Identify which animation type is expected based on the component name

Build a gap table:

```
Component               Expected Animation  Has gsap  Has cleanup  Status
UploadCard.tsx          drag + entrance     ❌        ❌           MISSING
ResultCard.tsx          reveal              ✅        ✅           ✅ OK
AnalyzeButton.tsx       hover               ❌        ❌           MISSING
SeverityBadge.tsx       pop                 ❌        ❌           MISSING
LanguageToggle.tsx      slide               ✅        ✅           ✅ OK
PDFExportButton.tsx     hover               ❌        ❌           MISSING
```

### Step 4 — Add animation to target component(s)

For each component that needs animation:

1. Read the current component file
2. Add `import gsap from 'gsap'` if not present
3. Add `useRef` for the animation target element(s)
4. Wrap the ref element with `ref={containerRef}`
5. Add `useEffect` with `gsap.context`:

```typescript
useEffect(() => {
  const ctx = gsap.context(() => {
    // animation here — use ref.current as the scope
    gsap.from(containerRef.current, { ... });
  }, containerRef);
  return () => ctx.revert(); // MUST have cleanup
}, []);
```

6. For hover animations, use `onMouseEnter` / `onMouseLeave` handlers (NOT `useEffect`):

```typescript
const handleMouseEnter = () => gsap.to(btnRef.current, { scale: 1.05, duration: 0.15 });
const handleMouseLeave = () => gsap.to(btnRef.current, { scale: 1, duration: 0.15 });
```

**Critical rules**:
- ALWAYS use `gsap.context(fn, scopeRef).revert()` for mount animations
- NEVER animate without cleanup — this causes memory leaks in React
- Do NOT use animation durations > 0.6s — "no jank" means animations feel instant
- Do NOT add `will-change: transform` via Tailwind — GSAP handles this
- Mobile performance: keep animations under 3 properties per tween

### Step 5 — Validate no jank

After applying animations, check:

- [ ] All `useEffect` animations have `ctx.revert()` in cleanup
- [ ] No animation duration exceeds 0.6s
- [ ] No simultaneous animations on > 5 elements without `stagger`
- [ ] Hover handlers are on `onMouseEnter`/`onMouseLeave`, not `useEffect`
- [ ] `gsap` is imported from `'gsap'` (not from a CDN)

### Step 6 — TypeScript check

```bash
npx tsc --noEmit 2>&1 | grep -E "error TS" | head -20
```

Fix any TypeScript errors introduced by the GSAP additions.

### Step 7 — SC-008 compliance check

Count total GSAP animation calls across the codebase:

```bash
grep -rn "gsap\." components/ app/ --include="*.tsx" | grep -v "node_modules" | grep -v "//.*gsap"
```

**SC-008 requires ≥ 3**: button hover, card entrance, result reveal.

### Step 8 — Report

```
Zaraat AI GSAP Animation Report
================================
Components scanned:   N
Animations added:     N
Animations already present: N

SC-008 compliance:
  Button hover:         ✅ present in [component]
  Card entrance:        ✅ present in [component]
  Result reveal:        ✅ present in [component]
  Total GSAP calls:     N

Memory leak check:     ✅ all ctx.revert() present / ❌ [N missing]
TypeScript:            ✅ PASS / ❌ [errors]

Files modified:
  - [list of changed files]
```
