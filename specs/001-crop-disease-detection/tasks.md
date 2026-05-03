# Tasks: Zaraat AI — Crop Disease Detection

**Branch**: `001-crop-disease-detection` | **Date**: 2026-05-02
**Input**: `specs/001-crop-disease-detection/plan.md`, `spec.md`, `data-model.md`, `contracts/analyze.contract.json`, `research.md`

**Format**: `- [ ] TASK-NNN [P?] [USx?]: Title`
- **[P]** = parallelizable (different file, no pending dependency)
- **[USx]** = maps to User Story x from spec.md (US1 Photo Diagnosis P1, US2 Result Actions P1, US3 Language Toggle P2, US4 FAQ P3)

---

## Phase 1 — Setup

**Goal**: Running Next.js 14 scaffold with design tokens, TypeScript types, i18n, Language Context, Header, and all shared infrastructure. No feature logic yet.

**Checkpoint**: `npm run dev` serves a green-themed page at localhost:3000 with Header, LanguageToggle that switches between اردو and EN.

---

- [ ] TASK-001: Initialize Next.js 14 project with TypeScript, Tailwind, and App Router
  - **File**: `package.json` (project root)
  - **Details**: Run `npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"`. Select: App Router = Yes, src directory = No, default import alias = @/*. After init, delete the default `app/page.tsx` body content (replace with empty `export default function Home() { return <main /> }`). Clear `app/globals.css` to only the three Tailwind directives: `@tailwind base; @tailwind components; @tailwind utilities`.
  - **Depends on**: none

- [ ] TASK-002: Install all required npm dependencies
  - **File**: `package.json`
  - **Details**: Run `npm install gsap@^3.12 jspdf@^2.5 nanoid@^5 openai@^4`. Then run `npm install -D @types/node`. Verify `package.json` lists all five. Run `npm run build` to confirm no peer-dependency errors before proceeding.
  - **Depends on**: TASK-001

- [ ] TASK-003 [P]: Configure Tailwind design tokens
  - **File**: `tailwind.config.ts`
  - **Details**: Inside `theme.extend`, add: `colors: { primary: '#1B4332', accent: '#74C69D', base: { DEFAULT: '#F0FFF4' } }`. Add `fontFamily: { urdu: ['Noto Naskh Arabic', 'serif'] }`. Add top-level `safelist: ['bg-accent', 'bg-amber-500', 'bg-red-500', 'text-white']` to prevent Tailwind from purging dynamically-applied severity classes. Keep all existing Next.js defaults.
  - **Depends on**: TASK-001

- [ ] TASK-004 [P]: Create TypeScript type definitions
  - **File**: `types/diagnosis.ts`
  - **Details**: Create the file with exactly these exports (matches data-model.md):
    ```ts
    export type Language = 'ur' | 'en';
    export type SeverityLevel = 'Mild' | 'Moderate' | 'Severe';
    export type ErrorCode = 'INVALID_IMAGE' | 'NOT_A_CROP_LEAF' | 'DIAGNOSIS_FAILED' | 'UPSTREAM_ERROR' | 'TIMEOUT' | 'RATE_LIMITED';
    export interface MedicineSet { brandNames: string[]; genericNames: string[]; }
    export interface DiagnosisResult { disease: string; severity: SeverityLevel; treatmentSteps: string[]; spraySchedule: string; medicines: MedicineSet; }
    export interface ScanRecord extends DiagnosisResult { id: string; date: string; lang: Language; imageThumb?: string; }
    export interface DiagnosisError { error: { code: ErrorCode; message: string; messageEn: string; }; }
    ```
  - **Depends on**: TASK-001

- [ ] TASK-005 [P]: Create i18n translation module with all UI strings
  - **File**: `lib/i18n.ts`
  - **Details**: Export `const strings` as a Record with every string the app needs in both Urdu and English. Required keys and their values:
    - `appName`: `{ ur: 'زرعت اے آئی', en: 'Zaraat AI' }`
    - `tagline`: `{ ur: 'فصل کی بیماری فوری پہچانیں', en: 'Instantly detect crop diseases' }`
    - `uploadTitle`: `{ ur: 'فصل کی تصویر اپ لوڈ کریں', en: 'Upload Crop Photo' }`
    - `cameraBtn`: `{ ur: 'کیمرہ', en: 'Camera' }`
    - `galleryBtn`: `{ ur: 'گیلری', en: 'Gallery' }`
    - `contextLabel`: `{ ur: 'اضافی معلومات (اختیاری)', en: 'Additional Info (Optional)' }`
    - `contextPlaceholder`: `{ ur: 'مثلاً: 3 دن سے یہ ہو رہا ہے...', en: 'e.g. This started 3 days ago...' }`
    - `analyzeBtn`: `{ ur: 'تجزیہ کریں', en: 'Analyze' }`
    - `analyzingBtn`: `{ ur: 'تجزیہ ہو رہا ہے...', en: 'Analyzing...' }`
    - `loadingMsg`: `{ ur: 'AI تصویر کا تجزیہ کر رہا ہے', en: 'AI is analyzing your image' }`
    - `loadingHint`: `{ ur: 'براہ کرم 15 سیکنڈ تک انتظار کریں', en: 'Please wait up to 15 seconds' }`
    - `diseaseLabel`: `{ ur: 'بیماری', en: 'Disease' }`
    - `severityLabel`: `{ ur: 'شدت', en: 'Severity' }`
    - `severityMild`: `{ ur: 'ہلکی', en: 'Mild' }`
    - `severityModerate`: `{ ur: 'درمیانی', en: 'Moderate' }`
    - `severitySevere`: `{ ur: 'شدید', en: 'Severe' }`
    - `treatmentTitle`: `{ ur: 'علاج کے اقدامات', en: 'Treatment Steps' }`
    - `sprayTitle`: `{ ur: 'اسپرے کا شیڈول', en: 'Spray Schedule' }`
    - `medicinesTitle`: `{ ur: 'دوائیں', en: 'Medicines' }`
    - `brandLabel`: `{ ur: 'برانڈ نام', en: 'Brand Names' }`
    - `genericLabel`: `{ ur: 'جنرک نام', en: 'Generic Names' }`
    - `copyBtn`: `{ ur: 'نقل کریں', en: 'Copy Text' }`
    - `copiedMsg`: `{ ur: 'نقل ہو گیا!', en: 'Copied!' }`
    - `pdfBtn`: `{ ur: 'PDF ڈاؤنلوڈ', en: 'Download PDF' }`
    - `pdfGenerating`: `{ ur: 'PDF بن رہی ہے...', en: 'Generating PDF...' }`
    - `scanAgain`: `{ ur: 'دوبارہ اسکین کریں', en: 'Scan Again' }`
    - `recentTitle`: `{ ur: 'حالیہ اسکین', en: 'Recent Scans' }`
    - `noRecentScans`: `{ ur: 'ابھی تک کوئی اسکین نہیں', en: 'No scans yet' }`
    - `faqLink`: `{ ur: 'اکثر پوچھے جانے والے سوالات', en: 'FAQ' }`
    - `backHome`: `{ ur: 'واپس', en: 'Back' }`
    - `errInvalidImage`: `{ ur: 'فائل کا سائز بہت بڑا ہے یا فارمیٹ غلط ہے۔', en: 'File too large or invalid format. Use JPEG/PNG/WebP under 10 MB.' }`
    - `errNotACropLeaf`: `{ ur: 'براہ کرم فصل کے پتے کی تصویر اپ لوڈ کریں۔', en: 'Please upload a photo of a crop leaf.' }`
    - `errDiagnosisFailed`: `{ ur: 'تصویر واضح نہیں۔ روشنی میں دوبارہ تصویر لیں۔', en: 'Image unclear. Retake in better lighting.' }`
    - `errUpstream`: `{ ur: 'سروس عارضی طور پر دستیاب نہیں۔ دوبارہ کوشش کریں۔', en: 'Service temporarily unavailable. Please retry.' }`
    - `errTimeout`: `{ ur: 'سرور نے جواب نہیں دیا۔ دوبارہ کوشش کریں۔', en: 'Server did not respond. Please try again.' }`
    - `errRateLimited`: `{ ur: 'بہت زیادہ درخواستیں۔ ایک منٹ بعد دوبارہ کوشش کریں۔', en: 'Too many requests. Try again in one minute.' }`
    - `retryBtn`: `{ ur: 'دوبارہ کوشش', en: 'Retry' }`
    - `faqTitle`: `{ ur: 'اکثر پوچھے جانے والے سوالات', en: 'Frequently Asked Questions' }`
    - `faqQ1` through `faqA5` (5 Q&A pairs — see TASK-060 for exact content)
    
    Export: `export function t(key: keyof typeof strings, lang: Language): string { return strings[key]?.[lang] ?? strings[key]?.['en'] ?? key; }`
  - **Depends on**: TASK-004

- [ ] TASK-006 [P]: Create global CSS styles
  - **File**: `app/globals.css`
  - **Details**: Keep the three `@tailwind` directives. Add after: `@import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap');`. Add: `html { background-color: #F0FFF4; scroll-behavior: smooth; }`. Add: `body { font-family: 'Noto Naskh Arabic', sans-serif; }`. Add: `[dir="rtl"] { text-align: right; }`. Add: `[dir="ltr"] { text-align: left; }`.
  - **Depends on**: TASK-003

- [ ] TASK-007: Create LanguageContext and LanguageProvider
  - **File**: `context/LanguageContext.tsx`
  - **Details**: `'use client'` at top. Import `createContext, useContext, useState, useEffect` from react. Import `Language` from types/diagnosis.ts. Define context type: `interface LangCtx { lang: Language; setLang: (l: Language) => void }`. Create: `export const LanguageContext = createContext<LangCtx | null>(null)`. Create `LanguageProvider` component: uses `useState<Language>('ur')`. Two `useEffect`s: (1) on mount — read `localStorage.getItem('zaraat_lang')`, if `'en'` call `setLangInternal('en')`; (2) when `lang` changes — `localStorage.setItem('zaraat_lang', lang)` and `document.dir = lang === 'ur' ? 'rtl' : 'ltr'`. Expose `setLang` that calls both `setLangInternal` and the side effects. Wraps `{children}` in `<LanguageContext.Provider value={{ lang, setLang }}>`.
  - **Depends on**: TASK-004

- [ ] TASK-008 [P]: Create useLanguage hook
  - **File**: `hooks/useLanguage.ts`
  - **Details**: `'use client'`. Import `useContext` from react and `LanguageContext` from context/LanguageContext.tsx. Export: `export function useLanguage() { const ctx = useContext(LanguageContext); if (!ctx) throw new Error('useLanguage must be used within LanguageProvider'); return ctx; }`. No other logic.
  - **Depends on**: TASK-007

- [ ] TASK-009: Create root layout
  - **File**: `app/layout.tsx`
  - **Details**: This is a Server Component (no 'use client'). Import `LanguageProvider` from context/LanguageContext.tsx, import `'./globals.css'`. Export `metadata`: `{ title: 'Zaraat AI | زرعت اے آئی', description: 'AI-powered crop disease detection for Pakistani farmers' }`. Export default function `RootLayout({ children }: { children: React.ReactNode })` that returns `<html lang="ur" dir="rtl" suppressHydrationWarning><body><LanguageProvider>{children}</LanguageProvider></body></html>`. The `suppressHydrationWarning` is needed because LanguageContext updates `dir` client-side.
  - **Depends on**: TASK-006, TASK-007

- [ ] TASK-010 [P]: Create Header component
  - **File**: `components/Header.tsx`
  - **Details**: `'use client'`. Props interface: `interface HeaderProps { showBack?: boolean; backHref?: string }`. Import `useLanguage` and `t` from i18n. Import `Link` from next/link. Import `LanguageToggle`. Render `<header className="bg-primary text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">`. Left side: if `showBack` is true, render `<Link href={backHref ?? '/'}>← {t('backHome', lang)}</Link>`; else render logo — leaf emoji 🌿 + "Zaraat AI" text. Right side: `<LanguageToggle />`. Full width.
  - **Depends on**: TASK-005, TASK-008

- [ ] TASK-011 [P]: Create LanguageToggle component
  - **File**: `components/LanguageToggle.tsx`
  - **Details**: `'use client'`. No props. Import `useLanguage` from hooks/useLanguage.ts. Import `gsap` from 'gsap'. Import `useRef, useEffect` from react. Render a pill-shaped button: `<button className="bg-white/20 rounded-full px-3 py-1 text-sm flex items-center gap-2">`. Inside: `<span ref={indicatorRef} className="w-2 h-2 rounded-full bg-accent" />` and text `"اردو | EN"`. On click: call `setLang(lang === 'ur' ? 'en' : 'ur')`. In `useEffect` watching `lang`: `gsap.to(indicatorRef.current, { x: lang === 'ur' ? 0 : 24, duration: 0.25, ease: 'power2.inOut' })`.
  - **Depends on**: TASK-008

- [ ] TASK-012 [P]: Create .env.example and update .gitignore
  - **File**: `.env.example`
  - **Details**: Write exactly:
    ```
    # Required — OpenAI API key with GPT-4o vision access
    # Get from: https://platform.openai.com/api-keys
    OPENAI_API_KEY=sk-...your-key-here...

    # IMPORTANT: Never prefix OPENAI_API_KEY with NEXT_PUBLIC_
    # That would expose your key in the browser bundle.
    ```
    Also open `.gitignore` and verify `.env.local` is listed. If not, add it. Create `.env.local` with your real key for local dev (never commit this file).
  - **Depends on**: TASK-001

---

## Phase 2 — Upload Flow

**Goal**: Image upload with camera/gallery, thumbnail preview, optional context text, and submit button. No API call yet — just client-side state and validation.

**User Story**: US1 — Photo Diagnosis (P1)

**Checkpoint**: User can select a photo (camera or gallery), see thumbnail preview, type context text, and click Analyze. Analyze button is disabled until a photo is selected. Invalid files (wrong type or >10 MB) show an inline error.

---

- [ ] TASK-013 [US1]: Create useUpload hook
  - **File**: `hooks/useUpload.ts`
  - **Details**: `'use client'`. Exports: `selectedFile: File | null`, `previewUrl: string | null`, `imageThumb: string | null`, `validationError: string | null`, `handleFileSelect: (file: File) => void`, `clearFile: () => void`. In `handleFileSelect`: (1) check `['image/jpeg','image/png','image/webp'].includes(file.type)` — if false, set validationError to the INVALID_IMAGE error key and return; (2) check `file.size <= 10 * 1024 * 1024` — if false, same; (3) revoke any existing previewUrl with `URL.revokeObjectURL`; (4) set `selectedFile`, set `previewUrl = URL.createObjectURL(file)`, set `validationError = null`; (5) generate thumbnail: create `<canvas width=64 height=64>`, draw image, call `canvas.toDataURL('image/jpeg', 0.7)`, set `imageThumb`. In `clearFile`: revoke URL, reset all state. `useEffect` cleanup: revoke URL on unmount.
  - **Depends on**: TASK-004, TASK-005

- [ ] TASK-014 [US1]: Create UploadCard component
  - **File**: `components/UploadCard.tsx`
  - **Details**: `'use client'`. Props: `{ previewUrl: string | null; onFileSelect: (file: File) => void }`. Import `useLanguage`, `t`, `gsap`, `useRef`, `useEffect`, `useState`, `Image` from next/image. State: `isDragOver: boolean`. Two hidden inputs via refs: `cameraInputRef` (`type="file" accept="image/*" capture="environment"`) and `galleryInputRef` (`type="file" accept="image/jpeg,image/png,image/webp"`). Both call `onFileSelect(e.target.files[0])` on `onChange`. If `previewUrl`: show `<Image src={previewUrl} alt="preview" width={200} height={200} className="rounded-lg object-cover" />`. Else: show upload icon + `t('uploadTitle', lang)` + two buttons (Camera, Gallery). Card outer `div` ref for GSAP. `useEffect`: `const ctx = gsap.context(() => { gsap.from(cardRef.current, { opacity: 0, y: 20, duration: 0.4, ease: 'power2.out' }); }, cardRef); return () => ctx.revert()`. Drag-over: `gsap.to(cardRef.current, { scale: 1.02, duration: 0.15 })` on `isDragOver` true, reverse on false.
  - **Depends on**: TASK-005, TASK-008, TASK-013

- [ ] TASK-015 [US1]: Create ContextInput component
  - **File**: `components/ContextInput.tsx`
  - **Details**: `'use client'`. Props: `{ value: string; onChange: (v: string) => void; maxLength?: number }` (default `maxLength = 500`). Import `useLanguage`, `t`. Render: `<label className="block text-sm text-primary mb-1">{t('contextLabel', lang)}</label>` then `<textarea rows={3} maxLength={maxLength} value={value} onChange={e => onChange(e.target.value)} placeholder={t('contextPlaceholder', lang)} className="w-full border border-accent rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent" />` then `<p className="text-end text-xs text-gray-400 mt-1">{value.length}/{maxLength}</p>`.
  - **Depends on**: TASK-005, TASK-008

- [ ] TASK-016 [US1]: Create AnalyzeButton component
  - **File**: `components/AnalyzeButton.tsx`
  - **Details**: `'use client'`. Props: `{ disabled: boolean; loading: boolean; onClick: () => void }`. Import `useLanguage`, `t`, `gsap`, `useRef`. Button: `<button ref={btnRef} onClick={onClick} disabled={disabled || loading} className={`w-full min-h-[52px] rounded-xl font-bold text-lg text-white transition-colors ${disabled || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary'}`}>`. Content: if `loading`, render spinner SVG + `t('analyzingBtn', lang)`; else `t('analyzeBtn', lang)`. GSAP hover (skip if disabled): `onMouseEnter={() => !disabled && gsap.to(btnRef.current, { scale: 1.05, duration: 0.15, ease: 'power2.out' })}` and `onMouseLeave={() => gsap.to(btnRef.current, { scale: 1, duration: 0.15 })}`.
  - **Depends on**: TASK-005, TASK-008

- [ ] TASK-017 [US1]: Create ErrorToast component
  - **File**: `components/ErrorToast.tsx`
  - **Details**: `'use client'`. Props: `{ code: ErrorCode | null; onRetry: () => void; onDismiss: () => void }`. Import `useLanguage`, `t`, `ErrorCode`, `gsap`, `useRef`, `useEffect`. Error-to-i18n-key map: `INVALID_IMAGE → 'errInvalidImage'`, `NOT_A_CROP_LEAF → 'errNotACropLeaf'`, `DIAGNOSIS_FAILED → 'errDiagnosisFailed'`, `UPSTREAM_ERROR → 'errUpstream'`, `TIMEOUT → 'errTimeout'`, `RATE_LIMITED → 'errRateLimited'`. When `code` changes from null to a value: slide down `gsap.from(toastRef.current, { y: -60, opacity: 0, duration: 0.3, ease: 'power2.out' })`. When `onDismiss` called: `gsap.to(toastRef.current, { opacity: 0, y: -20, duration: 0.2, onComplete: onDismiss })`. Render: fixed top banner (only when `code` is not null), red background, error message text, "Retry" button calling `onRetry`, "×" button calling the animated dismiss.
  - **Depends on**: TASK-004, TASK-005, TASK-008

- [ ] TASK-018 [US1]: Create LoadingScreen component
  - **File**: `components/LoadingScreen.tsx`
  - **Details**: `'use client'`. Props: `{ visible: boolean }`. Import `gsap`, `useRef`, `useEffect`, `useLanguage`, `t`. Render: `<div ref={screenRef} className={`fixed inset-0 bg-base/95 z-50 flex flex-col items-center justify-center gap-6 ${!visible ? 'pointer-events-none' : ''}`} style={{ opacity: visible ? 1 : 0 }}>`. Inside: leaf SVG `ref={leafRef}`, progress bar container + inner bar `ref={barRef}`, `t('loadingMsg', lang)` heading, `t('loadingHint', lang)` subtext. In `useEffect` when `visible` becomes true: `const ctx = gsap.context(() => { gsap.to(screenRef.current, { opacity: 1, duration: 0.3 }); gsap.to(leafRef.current, { rotation: 360, duration: 2, repeat: -1, ease: 'none', transformOrigin: 'center center' }); gsap.to(barRef.current, { width: '95%', duration: 8, ease: 'power1.inOut' }); }, screenRef); return () => ctx.revert()`. When `visible` becomes false: reset bar to 0%, fade out.
  - **Depends on**: TASK-005, TASK-008

- [ ] TASK-019 [US1]: Create Home page — upload flow
  - **File**: `app/page.tsx`
  - **Details**: `'use client'`. Import `Header`, `UploadCard`, `ContextInput`, `AnalyzeButton`, `ErrorToast`, `LoadingScreen`, `useUpload`, `useLanguage`, `t`, `ErrorCode`, `DiagnosisResult`, `useRouter` from next/navigation. State: `contextText: string`, `loading: boolean`, `error: ErrorCode | null`. Use `useUpload()` for `{ selectedFile, previewUrl, handleFileSelect }`. Use `useLanguage()` for `{ lang }`. `handleAnalyze` async function: set `loading = true`, set `error = null`. Build FormData: `append('image', selectedFile)`, `append('context', contextText.trim())`, `append('language', lang)`. `fetch('/api/analyze', { method: 'POST', body: formData })`. On non-200: parse `DiagnosisError`, set `error = parsed.error.code`, set `loading = false`, return. On 200: parse `DiagnosisResult`, write `sessionStorage.setItem('zaraat_current_result', JSON.stringify(result))`, `router.push('/result')`. On throw: set `error = 'UPSTREAM_ERROR'`, set `loading = false`. Render: `<Header />`, `<main>` with `<UploadCard>`, `<ContextInput>`, `<AnalyzeButton>`, `<ErrorToast>`, `<LoadingScreen visible={loading} />`.
  - **Depends on**: TASK-009, TASK-010, TASK-013, TASK-014, TASK-015, TASK-016, TASK-017, TASK-018

---

## Phase 3 — API & AI

**Goal**: POST `/api/analyze` route that receives image + context + language, calls GPT-4o vision with the exact system prompt, returns structured `DiagnosisResult` JSON or error JSON.

**User Story**: US1 — Photo Diagnosis (P1)

**Checkpoint**: `curl -X POST http://localhost:3000/api/analyze -F "image=@leaf.jpg" -F "language=en" | jq .` returns valid DiagnosisResult JSON. Non-leaf returns `{"error":{"code":"NOT_A_CROP_LEAF",...}}`. Missing image returns `{"error":{"code":"INVALID_IMAGE",...}}`.

---

- [ ] TASK-020 [US1]: Create OpenAI client singleton and system prompt builder
  - **File**: `lib/openai.ts`
  - **Details**: First line MUST be `import 'server-only';`. Then: `import OpenAI from 'openai'; import type { Language } from '@/types/diagnosis';`. Create singleton: `const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });`. Export `buildSystemPrompt(lang: Language): string` that returns the exact prompt from spec.md:
    - For `lang === 'ur'`: System prompt in Urdu instructing GPT-4 to analyse the crop leaf image and return ONLY a JSON object with these fields: `{ "disease": "<Urdu name> (<Latin name>)", "severity": "Mild|Moderate|Severe", "treatmentSteps": ["1. ...", "2. ..."], "spraySchedule": "<Urdu text>", "medicines": { "brandNames": ["..."], "genericNames": ["..."] } }`. Sentinel errors: if not a crop leaf return `{"error":"NOT_A_CROP_LEAF"}`, if cannot diagnose return `{"error":"DIAGNOSIS_FAILED"}`. Medicines must be available in Pakistan. No markdown in response.
    - For `lang === 'en'`: Same prompt but all labels in English, disease name format: `"<English name> (<Latin name>)"`.
  - **Depends on**: TASK-004

- [ ] TASK-021 [US1]: Create analyzeLeaf function
  - **File**: `lib/openai.ts` (append to TASK-020 file)
  - **Details**: Export `async function analyzeLeaf(imageBuffer: Buffer, mimeType: string, context: string, language: Language): Promise<string>`. Steps: (1) `const base64 = imageBuffer.toString('base64')`, (2) `const dataUrl = \`data:${mimeType};base64,${base64}\``, (3) call `openai.chat.completions.create({ model: 'gpt-4o', response_format: { type: 'json_object' }, messages: [{ role: 'system', content: buildSystemPrompt(language) }, { role: 'user', content: [{ type: 'image_url', image_url: { url: dataUrl, detail: 'high' } }, { type: 'text', text: context ? \`Context: ${context}\` : 'Analyse this crop leaf image.' }] }], max_tokens: 1000 })`, (4) return `response.choices[0].message.content ?? ''`.
  - **Depends on**: TASK-020

- [ ] TASK-022 [US1]: Create API route helper functions
  - **File**: `app/api/analyze/route.ts`
  - **Details**: At module level (before the POST handler) define: (1) `const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'] as const`. (2) `const MAX_SIZE = 10 * 1024 * 1024`. (3) `const rateLimitMap = new Map<string, { count: number; resetAt: number }>()`. (4) `function checkRateLimit(ip: string): boolean` — get entry, if expired or missing, reset to `{ count: 1, resetAt: Date.now() + 60_000 }`, return true; if `count >= 10` return false; else increment count and return true. (5) `function validateMagicBytes(buf: Buffer, mime: string): boolean` — JPEG: `buf[0]===0xFF && buf[1]===0xD8 && buf[2]===0xFF`; PNG: `buf[0]===0x89 && buf[1]===0x50 && buf[2]===0x4E && buf[3]===0x47`; WebP: `buf[0]===0x52 && buf[1]===0x49 && buf[2]===0x46 && buf[3]===0x46`; return false otherwise. (6) `function isDiagnosisResult(obj: unknown): obj is DiagnosisResult` — check all required fields: `typeof (obj as any)?.disease === 'string'`, `['Mild','Moderate','Severe'].includes((obj as any)?.severity)`, `Array.isArray((obj as any)?.treatmentSteps)`, `(obj as any)?.treatmentSteps.length >= 1`, `typeof (obj as any)?.spraySchedule === 'string'`, `Array.isArray((obj as any)?.medicines?.brandNames)`, `Array.isArray((obj as any)?.medicines?.genericNames)`. (7) `function errorResponse(code: ErrorCode, status: number, lang: Language): NextResponse` — import `t` from lib/i18n.ts (which must be safe on server), return `NextResponse.json({ error: { code, message: t(errKey(code), lang), messageEn: t(errKey(code), 'en') } }, { status })` where `errKey` maps ErrorCode to i18n key.
  - **Depends on**: TASK-004, TASK-005

- [ ] TASK-023 [US1]: Create POST /api/analyze route handler
  - **File**: `app/api/analyze/route.ts` (complete the file started in TASK-022)
  - **Details**: Add `export const maxDuration = 30;` at top of file (Vercel Pro; Hobby caps at 10s — this is a no-op comment on Hobby but documents the intent). Export `async function POST(request: Request): Promise<NextResponse>` with full logic:
    1. Extract IP: `const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'`
    2. Rate limit: `if (!checkRateLimit(ip)) return errorResponse('RATE_LIMITED', 429, 'ur')`
    3. Parse formData: `const formData = await request.formData()`
    4. Extract fields: `imageFile = formData.get('image') as File | null`, `context = (formData.get('context') as string | null) ?? ''`, `language = ((formData.get('language') as Language) ?? 'ur') satisfies Language`
    5. Validate presence: `if (!imageFile) return errorResponse('INVALID_IMAGE', 400, language)`
    6. Validate MIME: `if (!ALLOWED_MIMES.includes(imageFile.type as any)) return errorResponse('INVALID_IMAGE', 400, language)`
    7. Read buffer: `const buffer = Buffer.from(await imageFile.arrayBuffer())`
    8. Validate magic bytes: `if (!validateMagicBytes(buffer, imageFile.type)) return errorResponse('INVALID_IMAGE', 400, language)`
    9. Validate size: `if (buffer.length > MAX_SIZE) return errorResponse('INVALID_IMAGE', 400, language)`
    10. Call AI with timeout: `let rawJson: string; try { rawJson = await Promise.race([analyzeLeaf(buffer, imageFile.type, context.slice(0, 500), language), new Promise<never>((_, rej) => setTimeout(() => rej(new Error('TIMEOUT')), 28_000))]); } catch (err) { const code = (err as Error).message === 'TIMEOUT' ? 'TIMEOUT' : 'UPSTREAM_ERROR'; return errorResponse(code, code === 'TIMEOUT' ? 408 : 500, language); }`
    11. Parse: `let parsed: unknown; try { parsed = JSON.parse(rawJson); } catch { return errorResponse('UPSTREAM_ERROR', 500, language); }`
    12. Sentinel errors: `if ((parsed as any)?.error === 'NOT_A_CROP_LEAF') return errorResponse('NOT_A_CROP_LEAF', 400, language); if ((parsed as any)?.error === 'DIAGNOSIS_FAILED') return errorResponse('DIAGNOSIS_FAILED', 422, language);`
    13. Schema guard: `if (!isDiagnosisResult(parsed)) return errorResponse('UPSTREAM_ERROR', 500, language);`
    14. Return: `return NextResponse.json(parsed, { status: 200 })`
  - **Depends on**: TASK-021, TASK-022

---

## Phase 4 — Result Page

**Goal**: Full result screen showing all diagnosis fields. Storage to localStorage. Recent scans list on Home page.

**User Story**: US2 — Result Actions (P1)

**Checkpoint**: After a successful analysis, user sees Result page with disease name, severity badge, numbered treatment steps, spray schedule, and medicines. Copy text and PDF buttons are visible. "Scan Again" navigates back to Home. Recent scans appear on Home page.

---

- [ ] TASK-024 [US2]: Create localStorage storage utility
  - **File**: `lib/storage.ts`
  - **Details**: All functions wrapped in `try/catch` (localStorage may be disabled in private browsing). Import `ScanRecord` from types/diagnosis.ts. `const SCANS_KEY = 'zaraat_scans'`. `export function getScans(): ScanRecord[]` — parse `localStorage.getItem(SCANS_KEY)` or return `[]`. `export function saveScan(scan: ScanRecord): void` — get existing array, `unshift` new scan, `slice(0, 10)` for FIFO 10-cap, `localStorage.setItem(SCANS_KEY, JSON.stringify(pruned))`. `export function getScanById(id: string): ScanRecord | null` — `getScans().find(s => s.id === id) ?? null`. `export function deleteScan(id: string): void` — filter out matching id, save back.
  - **Depends on**: TASK-004

- [ ] TASK-025 [US2]: Create SeverityBadge component
  - **File**: `components/SeverityBadge.tsx`
  - **Details**: `'use client'`. Props: `{ severity: SeverityLevel }`. Import `useLanguage`, `t`, `gsap`, `useRef`, `useEffect`, `SeverityLevel`. Color map: `Mild → 'bg-accent text-white'`, `Moderate → 'bg-amber-500 text-white'`, `Severe → 'bg-red-500 text-white'`. Urdu label map: `Mild → t('severityMild', lang)`, `Moderate → t('severityModerate', lang)`, `Severe → t('severitySevere', lang)`. Render: `<span ref={badgeRef} className={\`inline-block px-3 py-1 rounded-full text-sm font-bold ${colorClass}\`}>{label} — {severity}</span>`. GSAP: `useEffect(() => { const ctx = gsap.context(() => { gsap.from(badgeRef.current, { scale: 0, duration: 0.4, ease: 'back.out(2)', delay: 0.3 }); }, badgeRef); return () => ctx.revert(); }, [])`.
  - **Depends on**: TASK-004, TASK-005, TASK-008

- [ ] TASK-026 [US2]: Create TreatmentSteps component
  - **File**: `components/TreatmentSteps.tsx`
  - **Details**: `'use client'`. Props: `{ steps: string[] }`. Import `useLanguage`, `t`, `gsap`, `useRef`, `useEffect`. Render section heading `t('treatmentTitle', lang)`, then `<ol ref={olRef}>` with each step as `<li key={i} className="flex gap-3 mb-3">` containing a numbered circle `<span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0">{i+1}</span>` and the step text. GSAP: `useEffect(() => { const stepEls = olRef.current?.querySelectorAll('li'); const ctx = gsap.context(() => { gsap.from(stepEls, { opacity: 0, x: lang === 'ur' ? 20 : -20, stagger: 0.1, duration: 0.4, ease: 'power2.out', delay: 0.5 }); }, olRef); return () => ctx.revert(); }, [])`.
  - **Depends on**: TASK-005, TASK-008

- [ ] TASK-027 [US2]: Create SpraySchedule component
  - **File**: `components/SpraySchedule.tsx`
  - **Details**: `'use client'`. Props: `{ schedule: string }`. Import `useLanguage`, `t`, `gsap`, `useRef`, `useEffect`. Render `<div ref={divRef}>` with heading `t('sprayTitle', lang)` and `<p className="italic text-gray-700">{schedule}</p>`. GSAP: `gsap.from(divRef.current, { opacity: 0, y: 15, duration: 0.4, ease: 'power2.out', delay: 0.7 })` in gsap.context with ctx.revert cleanup.
  - **Depends on**: TASK-005, TASK-008

- [ ] TASK-028 [US2]: Create MedicinesList component
  - **File**: `components/MedicinesList.tsx`
  - **Details**: `'use client'`. Props: `{ medicines: MedicineSet }`. Import `useLanguage`, `t`, `gsap`, `useRef`, `useEffect`, `MedicineSet`. Render `<div ref={divRef}>` with heading `t('medicinesTitle', lang)`. Two subsections: (1) `t('brandLabel', lang)` — `<ul>` with each brand name as `<li>` with 💊 bullet; (2) `t('genericLabel', lang)` — `<ul>` with each generic name as `<li>` with 🧪 bullet. GSAP: `gsap.from(divRef.current, { opacity: 0, y: 15, duration: 0.4, ease: 'power2.out', delay: 0.8 })` with ctx.revert cleanup.
  - **Depends on**: TASK-004, TASK-005, TASK-008

- [ ] TASK-029 [US2]: Create ResultCard component
  - **File**: `components/ResultCard.tsx`
  - **Details**: `'use client'`. Props: `{ result: DiagnosisResult }`. Import `useLanguage`, `t`, `gsap`, `useRef`, `useEffect`, `DiagnosisResult`, `SeverityBadge`, `TreatmentSteps`, `SpraySchedule`, `MedicinesList`. Render container `<div ref={containerRef} className="space-y-6">`. Disease name: `<h2 ref={titleRef} className="text-2xl font-bold text-primary">{result.disease}</h2>`. Below: `<SeverityBadge>`, `<TreatmentSteps>`, `<SpraySchedule>`, `<MedicinesList>`. GSAP: `useEffect(() => { const ctx = gsap.context(() => { gsap.from(titleRef.current, { opacity: 0, scale: 0.85, duration: 0.5, ease: 'back.out(1.7)' }); }, containerRef); return () => ctx.revert(); }, [])`.
  - **Depends on**: TASK-025, TASK-026, TASK-027, TASK-028

- [ ] TASK-030 [US2]: Create CopyTextButton component
  - **File**: `components/CopyTextButton.tsx`
  - **Details**: `'use client'`. Props: `{ result: DiagnosisResult }`. Import `useLanguage`, `t`, `gsap`, `useRef`, `useState`, `DiagnosisResult`. State: `copied: boolean`. `buildCopyText(result, lang)`: returns plain-text string — disease name, severity (localized), each treatment step on its own line, spray schedule, brand medicines joined by comma, generic medicines joined by comma. On click: `navigator.clipboard.writeText(buildCopyText(result, lang)).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })`. Button text: `copied ? t('copiedMsg', lang) : t('copyBtn', lang)`. GSAP hover: `onMouseEnter/Leave` → scale 1.05/1 with 0.15s duration.
  - **Depends on**: TASK-004, TASK-005, TASK-008

- [ ] TASK-031 [US2]: Create PDFExportButton component
  - **File**: `components/PDFExportButton.tsx`
  - **Details**: `'use client'`. Props: `{ result: DiagnosisResult; scanDate: string }`. Import `useLanguage`, `t`, `gsap`, `useRef`, `useState`, `DiagnosisResult`. State: `generating: boolean`. On click: `setGenerating(true)`, then `const { generateDiagnosisPDF } = await import('@/lib/pdf')` (dynamic import to keep jsPDF out of initial bundle), call `await generateDiagnosisPDF(result, scanDate, lang)`, `setGenerating(false)`. Button text: `generating ? t('pdfGenerating', lang) : t('pdfBtn', lang)`. Show spinner when generating. GSAP hover scale 1.05 (skip when generating).
  - **Depends on**: TASK-004, TASK-005, TASK-008

- [ ] TASK-032 [US2]: Create Result page
  - **File**: `app/result/page.tsx`
  - **Details**: `'use client'`. Import `Header`, `ResultCard`, `CopyTextButton`, `PDFExportButton`, `Link` from next/link, `useLanguage`, `t`, `DiagnosisResult`, `useEffect`, `useState`, `useRouter`. State: `result: DiagnosisResult | null`. On mount: `const raw = sessionStorage.getItem('zaraat_current_result'); if (!raw) { router.replace('/'); return; } setResult(JSON.parse(raw))`. Render: `<Header showBack backHref="/" />`, `<main className="p-4 max-w-lg mx-auto space-y-6">`, `<ResultCard result={result} />`, action row with `<CopyTextButton>` and `<PDFExportButton>`, and a `<Link href="/">` "Scan Again" link with chevron.
  - **Depends on**: TASK-009, TASK-010, TASK-029, TASK-030, TASK-031

- [ ] TASK-033 [US2]: Update Home page to enrich and save scan after analysis
  - **File**: `app/page.tsx`
  - **Details**: In the `handleAnalyze` success path (after parsing DiagnosisResult): import `nanoid` from 'nanoid', import `saveScan` from lib/storage.ts, import `ScanRecord` from types/diagnosis.ts. Build `ScanRecord`: `{ ...result, id: nanoid(8), date: new Date().toISOString(), lang, imageThumb: imageThumb ?? undefined }` where `imageThumb` comes from `useUpload()`. Call `saveScan(scanRecord)`. Then write to sessionStorage and navigate.
  - **Depends on**: TASK-019, TASK-024

- [ ] TASK-034 [US2]: Create RecentScansList component
  - **File**: `components/RecentScansList.tsx`
  - **Details**: `'use client'`. No props. Import `useLanguage`, `t`, `gsap`, `useRef`, `useEffect`, `useState`, `ScanRecord`, `getScans`, `SeverityBadge`. State: `scans: ScanRecord[]`. On mount: `setScans(getScans())`. Render: section heading `t('recentTitle', lang)`. If empty: `<p>{t('noRecentScans', lang)}</p>`. Else `<ul ref={listRef}>` with each scan as `<li>`: thumbnail (if imageThumb), disease name truncated to 1 line, formatted date (`new Date(scan.date).toLocaleDateString()`), `<SeverityBadge severity={scan.severity} />`, PDF download button (calls `generateDiagnosisPDF(scan, scan.date, scan.lang)` via dynamic import). GSAP stagger: `gsap.from(listRef.current?.querySelectorAll('li'), { opacity: 0, y: 10, stagger: 0.07, duration: 0.3 })` after scans load.
  - **Depends on**: TASK-024, TASK-025

- [ ] TASK-035 [US2]: Add RecentScansList to Home page
  - **File**: `app/page.tsx`
  - **Details**: Import `RecentScansList` from components/RecentScansList.tsx. Add below the submit button section: `<section className="mt-8"><RecentScansList /></section>`. Also add a `<footer>` below that with a `<Link href="/faq">` — `t('faqLink', lang)` — for the FAQ link.
  - **Depends on**: TASK-034, TASK-019

---

## Phase 5 — PDF Export

**Goal**: jsPDF-powered client-side PDF with all 8 content blocks. Urdu text uses embedded Noto Naskh Arabic font. Downloads as `Zaraat AI-YYYY-MM-DD.pdf`.

**User Story**: US2 — Result Actions (P1)

**Checkpoint**: Download PDF from Result page. Open file — verify all 8 blocks present (header, metadata, disease, severity, steps, spray, medicines, footer). Urdu text renders correctly. English PDF renders LTR. Filename matches pattern.

---

- [ ] TASK-036 [P] [US2]: Prepare Noto Naskh Arabic font as Base64
  - **File**: `public/fonts/NotoNaskhArabic.b64.txt`
  - **Details**: Create a one-time script `scripts/font-to-base64.mjs`:
    ```js
    import { readFileSync, writeFileSync } from 'fs';
    const ttf = readFileSync('./NotoNaskhArabic-Regular.ttf');
    writeFileSync('./public/fonts/NotoNaskhArabic.b64.txt', ttf.toString('base64'));
    ```
    Download `NotoNaskhArabic-Regular.ttf` from Google Fonts (or npm package `@fontsource/noto-naskh-arabic`). Run the script once: `node scripts/font-to-base64.mjs`. Commit the resulting `.b64.txt` file (it is a build artifact, not a secret). The file should be ~200 KB.
  - **Depends on**: TASK-001

- [ ] TASK-037 [US2]: Create PDF generation library — core and header blocks
  - **File**: `lib/pdf.ts`
  - **Details**: Client-only — no `import 'server-only'`. `import jsPDF from 'jspdf'`. Import `DiagnosisResult`, `Language`, `SeverityLevel`. Define `const PAGE_W = 210, PAGE_H = 297, MARGIN = 20`. Export `async function generateDiagnosisPDF(result: DiagnosisResult, scanDate: string, lang: Language): Promise<void>`. Step 1: `const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })`. Step 2: if `lang === 'ur'`, fetch `/fonts/NotoNaskhArabic.b64.txt`, call `doc.addFont(b64text, 'NotoNaskhArabic', 'normal')`, set `doc.setFont('NotoNaskhArabic')`. Else set `doc.setFont('helvetica')`. Helper `rtlX(text: string, y: number)`: `const tw = doc.getTextWidth(text); const x = PAGE_W - MARGIN - tw; doc.text(text, x, y)`. Helper `ltrX(text: string, y: number, x = MARGIN)`: `doc.text(text, x, y)`. Define `renderText(text, y)` that calls `rtlX` if lang=ur else `ltrX`. Block 1 — Header: `doc.setFontSize(22); doc.setTextColor(27, 67, 50); renderText('Zaraat AI | زرعت اے آئی', 25)`. Draw rule: `doc.setDrawColor(116, 198, 157); doc.setLineWidth(0.5); doc.line(MARGIN, 30, PAGE_W - MARGIN, 30)`. Block 2 — Metadata: `doc.setFontSize(10); doc.setTextColor(100); renderText(\`Date: ${scanDate.slice(0,10)}\`, 38)`.
  - **Depends on**: TASK-004, TASK-036

- [ ] TASK-038 [US2]: Implement PDF result content blocks (disease through footer)
  - **File**: `lib/pdf.ts` (extend TASK-037 function)
  - **Details**: Continue from y=45. Block 3 — Disease name: `doc.setFontSize(16); doc.setTextColor(27, 67, 50); doc.setFont(font, 'bold'); renderText(result.disease, y); y += 10`. Block 4 — Severity: severity color map `Mild → [116,198,157]`, `Moderate → [245,158,11]`, `Severe → [239,68,68]`. Draw colored rect: `doc.setFillColor(...color); doc.roundedRect(MARGIN, y, 50, 8, 2, 2, 'F'); doc.setTextColor(255); doc.setFontSize(10); doc.text(result.severity, MARGIN + 3, y + 5.5); y += 14`. Block 5 — Treatment steps: `doc.setFontSize(12); doc.setTextColor(27,67,50); doc.setFont(font,'bold'); renderText(lang==='ur'?'علاج کے اقدامات':'Treatment Steps', y); y+=7; doc.setFont(font,'normal'); doc.setFontSize(10); doc.setTextColor(60)`. For each step: `const lines = doc.splitTextToSize(step, PAGE_W - 2*MARGIN - 10); renderText(lines.join('\n'), y); y += lines.length * 5 + 3`. Block 6 — Spray schedule: `doc.setFontSize(11); doc.setTextColor(27,67,50); doc.setFont(font,'bold'); renderText(lang==='ur'?'اسپرے کا شیڈول':'Spray Schedule', y); y+=6; doc.setFont(font,'normal'); doc.setTextColor(60); const sLines = doc.splitTextToSize(result.spraySchedule, PAGE_W-2*MARGIN); renderText(sLines.join('\n'), y); y+=sLines.length*5+5`. Block 7 — Medicines: brand subsection then generic subsection, each item on its own line with `•` prefix. Block 8 — Footer: `doc.setFontSize(8); doc.setTextColor(150); doc.text('Generated by Zaraat AI — zaraat-ai.vercel.app', MARGIN, PAGE_H - 10)`. Finally: `doc.save(\`Zaraat AI-${scanDate.slice(0,10)}.pdf\`)`.
  - **Depends on**: TASK-037

---

## Phase 6 — Language System

**Goal**: All UI text bilingual. Language toggle persists in localStorage. RTL layout for Urdu. API calls include `language` parameter so responses come in the selected language.

**User Story**: US3 — Language Toggle (P2)

**Checkpoint**: Default language is Urdu with RTL layout. Toggle to English switches all text and layout to LTR. Preference survives page reload. API returns English disease names and treatment steps when `language=en`.

---

- [ ] TASK-039 [US3]: Audit and add missing i18n strings
  - **File**: `lib/i18n.ts`
  - **Details**: Review every component created so far. For any string still hardcoded (not using `t(key, lang)`), add it to the `strings` object. Pay special attention to: (1) PDF content strings embedded in lib/pdf.ts — add keys for all PDF section headings in both languages, (2) aria-labels on buttons, (3) `<title>` attributes on SVG icons. Also add the 5 FAQ Q&A pairs (see TASK-060 for content). Run `grep -r "'" components/ lib/ app/ --include="*.tsx" --include="*.ts"` and inspect each literal string.
  - **Depends on**: TASK-005, TASK-035

- [ ] TASK-040 [US3]: Replace remaining hardcoded strings with t() calls
  - **File**: All files in `components/`, `app/`, `lib/pdf.ts`
  - **Details**: For each file: import `t` from '@/lib/i18n' and `Language` from '@/types/diagnosis'. Replace every hardcoded Urdu/English string with `t('keyName', lang)`. In lib/pdf.ts, pass `lang` parameter down and use `t(key, lang)` for all section headings. Components that don't yet use `useLanguage()` but render text should be updated to do so.
  - **Depends on**: TASK-039

- [ ] TASK-041 [US3]: Apply Tailwind logical properties for RTL compatibility
  - **File**: All component files
  - **Details**: Scan all Tailwind classes in components/ and app/ files. Replace directional utilities with logical equivalents: `ml-{x}` → `ms-{x}`, `mr-{x}` → `me-{x}`, `pl-{x}` → `ps-{x}`, `pr-{x}` → `pe-{x}`, `text-left` → `text-start`, `text-right` → `text-end`, `left-{x}` → `start-{x}` (in positioned elements), `right-{x}` → `end-{x}`. Test at 375px in Chrome DevTools with `dir="rtl"`. Verify: no text overflows container, no button misalignment, character counter appears on the correct side.
  - **Depends on**: TASK-040

- [ ] TASK-042 [US3]: Verify language persistence and document.dir update
  - **File**: `context/LanguageContext.tsx`
  - **Details**: Add a second `useEffect` specifically for `document.dir` sync: `useEffect(() => { if (typeof document !== 'undefined') document.dir = lang === 'ur' ? 'rtl' : 'ltr'; }, [lang])`. Ensure the mount effect reads from localStorage with a fallback: `const saved = typeof window !== 'undefined' ? localStorage.getItem('zaraat_lang') : null; return (saved === 'ur' || saved === 'en') ? saved : 'ur'` as the useState initializer. Test: (1) toggle to English, reload — expect English; (2) toggle to Urdu, reload — expect Urdu; (3) private browsing — expect Urdu default without error.
  - **Depends on**: TASK-007

- [ ] TASK-043 [US3]: Wire language parameter into API call
  - **File**: `app/page.tsx`
  - **Details**: In `handleAnalyze()`, ensure `formData.append('language', lang)` uses the current `lang` value from `useLanguage()`. The language is already appended in TASK-019, but verify it is dynamic (not hardcoded `'ur'`). Also add a console warning in development if `lang` is neither `'ur'` nor `'en'`.
  - **Depends on**: TASK-019, TASK-042

---

## Phase 7 — GSAP Animations

**Goal**: All 14 animations from the spec fire with proper cleanup. No memory leaks.

**Checkpoint**: Navigate forward and back several times. Open React DevTools → confirm no stale GSAP listeners. All animations play on first mount and re-mount correctly.

---

- [ ] TASK-044 [P]: Add GSAP mount and drag-over animations to UploadCard
  - **File**: `components/UploadCard.tsx`
  - **Details**: Already scaffolded in TASK-014. Verify the `gsap.context` + `ctx.revert()` pattern is implemented. Add drag event handlers: `onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}` and `onDragLeave={() => setIsDragOver(false)}` and `onDrop={e => { e.preventDefault(); setIsDragOver(false); const file = e.dataTransfer.files[0]; if (file) onFileSelect(file); }}`. When `isDragOver` changes: `useEffect(() => { gsap.to(cardRef.current, { scale: isDragOver ? 1.02 : 1, borderColor: isDragOver ? '#74C69D' : '#d1d5db', duration: 0.15 }); }, [isDragOver])`.
  - **Depends on**: TASK-014

- [ ] TASK-045 [P]: Add GSAP hover animation to AnalyzeButton
  - **File**: `components/AnalyzeButton.tsx`
  - **Details**: Already scaffolded in TASK-016. Verify `onMouseEnter/Leave` GSAP hover animation. Also add touch equivalent: `onTouchStart={() => !disabled && gsap.to(btnRef.current, { scale: 1.03, duration: 0.1 })}` and `onTouchEnd={() => gsap.to(btnRef.current, { scale: 1, duration: 0.1 })}`.
  - **Depends on**: TASK-016

- [ ] TASK-046 [P]: Add GSAP stagger animation to RecentScansList
  - **File**: `components/RecentScansList.tsx`
  - **Details**: Already scaffolded in TASK-034. Verify the stagger animation runs after `setScans(getScans())` completes. Use `useEffect(() => { if (scans.length > 0) { const items = listRef.current?.querySelectorAll('li'); const ctx = gsap.context(() => { gsap.from(items, { opacity: 0, y: 10, stagger: 0.07, duration: 0.3, ease: 'power2.out' }); }, listRef); return () => ctx.revert(); } }, [scans])`.
  - **Depends on**: TASK-034

- [ ] TASK-047 [P]: Add GSAP animations to LoadingScreen
  - **File**: `components/LoadingScreen.tsx`
  - **Details**: Already scaffolded in TASK-018. Ensure full implementation: (1) screen fade-in on `visible=true`, (2) leaf SVG infinite rotation using `repeat: -1`, (3) progress bar tween to 95% over 8s. Add a `useEffect` watching `visible`: when false, kill all tweens on this context and reset bar width to 0. Ensure the leaf SVG has `transformOrigin: 'center center'` via GSAP `svgOrigin` or inline `style={{ transformBox: 'fill-box', transformOrigin: 'center' }}`.
  - **Depends on**: TASK-018

- [ ] TASK-048 [P]: Add GSAP entrance animation to ResultCard disease name
  - **File**: `components/ResultCard.tsx`
  - **Details**: Already scaffolded in TASK-029. Verify `gsap.from(titleRef.current, { opacity: 0, scale: 0.85, duration: 0.5, ease: 'back.out(1.7)' })` fires on mount. Ensure the effect runs after the result data is available (result prop is defined). Use `[result]` as the dependency array so it fires when result first renders.
  - **Depends on**: TASK-029

- [ ] TASK-049 [P]: Add GSAP pop animation to SeverityBadge
  - **File**: `components/SeverityBadge.tsx`
  - **Details**: Already scaffolded in TASK-025. Verify `gsap.from(badgeRef.current, { scale: 0, duration: 0.4, ease: 'back.out(2)', delay: 0.3 })` with `ctx.revert()` cleanup. The badge should "pop" into view 300ms after the disease name appears.
  - **Depends on**: TASK-025

- [ ] TASK-050 [P]: Add GSAP stagger animation to TreatmentSteps
  - **File**: `components/TreatmentSteps.tsx`
  - **Details**: Already scaffolded in TASK-026. Verify the `x` direction is language-aware: `x: lang === 'ur' ? 20 : -20`. Steps should slide in from the reading-start side. Confirm `delay: 0.5` keeps it sequenced after SeverityBadge.
  - **Depends on**: TASK-026

- [ ] TASK-051 [P]: Add GSAP fade-up to SpraySchedule and MedicinesList
  - **File**: `components/SpraySchedule.tsx`, `components/MedicinesList.tsx`
  - **Details**: Already scaffolded in TASK-027 and TASK-028. Verify both components have `gsap.context` + `ctx.revert()`. SpraySchedule delay: 0.7s. MedicinesList delay: 0.8s. These keep the stagger sequence visually flowing without gap.
  - **Depends on**: TASK-027, TASK-028

- [ ] TASK-052 [P]: Add GSAP hover scale to CopyTextButton and PDFExportButton
  - **File**: `components/CopyTextButton.tsx`, `components/PDFExportButton.tsx`
  - **Details**: Already scaffolded in TASK-030 and TASK-031. Verify both have `onMouseEnter/Leave` GSAP hover (scale 1.05, 0.15s). PDFExportButton should skip hover when `generating` is true. Add `onTouchStart/End` equivalents for mobile.
  - **Depends on**: TASK-030, TASK-031

- [ ] TASK-053 [P]: Add GSAP scroll-triggered animation to FAQItem
  - **File**: `components/FAQItem.tsx`
  - **Details**: `'use client'`. Import `gsap` from 'gsap' and `ScrollTrigger` from 'gsap/ScrollTrigger'. In useEffect: `gsap.registerPlugin(ScrollTrigger)` (inside useEffect only, never at module level). Create context: `const ctx = gsap.context(() => { gsap.from(itemRef.current, { opacity: 0, y: 20, duration: 0.4, ease: 'power2.out', scrollTrigger: { trigger: itemRef.current, start: 'top 85%', once: true } }); }, itemRef)`. Cleanup: `return () => { ctx.revert(); ScrollTrigger.getAll().filter(t => t.trigger === itemRef.current).forEach(t => t.kill()); }`.
  - **Depends on**: TASK-005

- [ ] TASK-054: Audit all GSAP contexts for proper cleanup
  - **File**: All animated components
  - **Details**: Open each animated component. Verify: (1) every `gsap.from/to/timeline` call is inside a `gsap.context(fn, ref)`, (2) every `useEffect` with GSAP returns `() => ctx.revert()`, (3) no bare `gsap.from()` at module level or outside useEffect. Test memory: in browser, navigate Home → Result → Home → Result five times. Open React DevTools Profiler. Confirm no growing GSAP instance count. Fix any leaks found.
  - **Depends on**: TASK-044, TASK-045, TASK-046, TASK-047, TASK-048, TASK-049, TASK-050, TASK-051, TASK-052, TASK-053

---

## Phase 8 — FAQ & Polish

**Goal**: FAQ page with 5 Q&A pairs, 404 page, CSP headers, mobile responsiveness verified, production build clean.

**User Story**: US4 — FAQ (P3)

**Checkpoint**: FAQ page loads with all 5 questions in Urdu/English. 404 page shows for unknown routes. `npm run build` exits 0 with zero TypeScript errors. No horizontal scroll at 375px on any page.

---

- [ ] TASK-055 [P] [US4]: Create FAQItem component
  - **File**: `components/FAQItem.tsx`
  - **Details**: `'use client'`. Props: `{ q: string; a: string | string[]; index: number }`. Import `gsap`, `ScrollTrigger`, `useRef`, `useEffect`. Render `<div ref={itemRef} className="bg-white rounded-xl p-4 shadow-sm mb-4">`. Question: `<h3 className="font-bold text-primary mb-2">{q}</h3>`. Answer: if `Array.isArray(a)`, render `<ul>{a.map(item => <li key={item}>{item}</li>)}</ul>`; else `<p>{a}</p>`. GSAP scroll-triggered fade-up (see TASK-053 implementation). `index * 0.1` as delay so FAQ items stagger.
  - **Depends on**: TASK-053

- [ ] TASK-056 [US4]: Add FAQ Q&A content to i18n and create FAQ page
  - **File**: `lib/i18n.ts` (add FAQ content), `app/faq/page.tsx` (new file)
  - **Details**: Add these 5 FAQ pairs to lib/i18n.ts strings:
    - Q1: `{ ur: 'اچھی تصویر کیسے لیں؟', en: 'How to take a good photo?' }` — A1: `{ ur: ['پتہ دھوپ میں رکھیں', 'پس منظر سادہ رکھیں', 'پتے کو فریم بھریں'], en: ['Place leaf in sunlight', 'Use a plain background', 'Fill the frame with the leaf'] }`
    - Q2: `{ ur: 'کون سی فصلیں سپورٹ ہیں؟', en: 'Which crops are supported?' }` — A2: `{ ur: 'گندم، چاول، گنا، کپاس، مکئی، آلو اور زیادہ تر پاکستانی فصلیں۔', en: 'Wheat, rice, sugarcane, cotton, maize, potato and most Pakistani crops.' }`
    - Q3: `{ ur: 'نتائج کتنے درست ہیں؟', en: 'How accurate are the results?' }` — A3: `{ ur: 'AI تجزیہ بطور رہنما استعمال کریں۔ ہمیشہ مقامی زرعی ماہر سے تصدیق کریں۔', en: 'Use AI analysis as guidance. Always verify with a local agricultural expert.' }`
    - Q4: `{ ur: 'اسپرے شیڈول کیسے استعمال کریں؟', en: 'How to use the spray schedule?' }` — A4 multi-line
    - Q5: `{ ur: 'نتائج کیسے محفوظ کریں؟', en: 'How to save results?' }` — A5: PDF download explanation
    
    Create `app/faq/page.tsx`: `'use client'`. Import `Header`, `FAQItem`, `useLanguage`, `t`. Render `<Header showBack backHref="/" />`, `<main className="p-4 max-w-lg mx-auto">`, heading `t('faqTitle', lang)`, and 5 `<FAQItem>` components with Q&A from i18n.
  - **Depends on**: TASK-039, TASK-055

- [ ] TASK-057 [P]: Create 404 not-found page
  - **File**: `app/not-found.tsx`
  - **Details**: `'use client'`. Import `Link`, `useLanguage`, `t`. Render centered full-page layout: large "404" text in primary color, `t('notFoundMsg', lang)` (add key to i18n: `{ ur: 'صفحہ نہیں ملا', en: 'Page not found' }`), and a `<Link href="/">` button styled like AnalyzeButton to go back home.
  - **Depends on**: TASK-009

- [ ] TASK-058 [P]: Add CSP and security headers to next.config.ts
  - **File**: `next.config.ts`
  - **Details**: Export default config with `headers()` async function returning array with one entry matching `source: '/(.*)'` and `headers`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.openai.com`. Also set `reactStrictMode: true`.
  - **Depends on**: TASK-001

- [ ] TASK-059: Add lint:env and type-check scripts to package.json
  - **File**: `package.json`
  - **Details**: In the `scripts` section add: `"lint:env": "grep -r 'NEXT_PUBLIC_OPENAI' . --include='*.ts' --include='*.tsx' --exclude-dir=node_modules --exclude-dir=.next || echo 'OK: No NEXT_PUBLIC_OPENAI found'"` and `"type-check": "tsc --noEmit"`. These are used in the quickstart.md security validation step and pre-deploy check.
  - **Depends on**: TASK-001

- [ ] TASK-060: Mobile responsiveness audit and fix
  - **File**: All component and page files (fix as needed)
  - **Details**: Open Chrome DevTools → Device Toolbar → set to 375×812px (iPhone SE size). Navigate to each screen: Home, Result, FAQ. Check each item: (1) No horizontal scroll (add `overflow-x: hidden` to body if needed), (2) UploadCard fills full width with `w-full`, (3) Camera and Gallery buttons both fit on one row or stack gracefully, (4) All buttons have `min-h-[52px]` for 44px+ touch target (accounting for border), (5) Result card fields don't overflow, (6) Text is ≥ 16px (prevents iOS auto-zoom on focus), (7) FAQItem text wraps correctly in RTL. Fix any failing items.
  - **Depends on**: TASK-056, TASK-035, TASK-032

- [ ] TASK-061: Security validation
  - **File**: N/A (validation step)
  - **Details**: Run: (1) `npm run lint:env` — expect "OK: No NEXT_PUBLIC_OPENAI found"; (2) `git ls-files .env.local` — expect no output (file must not be tracked); (3) Open `lib/openai.ts` and verify line 1 is exactly `import 'server-only';`; (4) Run `grep -r "OPENAI_API_KEY" . --include="*.ts" --include="*.tsx" --exclude-dir=node_modules` — verify it only appears in lib/openai.ts and .env.example, never in any component or client code.
  - **Depends on**: TASK-023, TASK-059

- [ ] TASK-062: Production build verification
  - **File**: N/A (validation step)
  - **Details**: Run `npm run type-check` — expect exit 0, zero errors. Run `npm run build` — expect exit 0. If any TypeScript errors appear, fix them before continuing. Common issues to check: (1) `useLanguage()` called outside LanguageProvider (must be inside), (2) Missing `'use client'` on components using hooks, (3) `import 'server-only'` in a client component (lib/openai.ts must never be imported client-side — use dynamic import or only import in route.ts).
  - **Depends on**: TASK-058, TASK-061

---

## Phase 9 — Deployment

**Goal**: Production app live on Vercel. All success criteria (SC-001 through SC-008) pass on the production URL.

**Checkpoint**: App live at Vercel URL. Real Android device: camera opens, diagnosis completes, PDF downloads, language toggle works across reload.

---

- [ ] TASK-063: Create README.md
  - **File**: `README.md`
  - **Details**: Sections: **Zaraat AI** (one-line description), **Prerequisites** (Node 18.17+, npm 9+, OpenAI API key with GPT-4o access), **Quick Start** (`git clone`, `npm install`, `cp .env.example .env.local` + edit, `npm run dev`, open http://localhost:3000), **Environment Variables** (table: `OPENAI_API_KEY` | Required | OpenAI API key, server-side only), **Tech Stack** (Next.js 14, TypeScript, Tailwind, GSAP, jsPDF, OpenAI GPT-4o), **Validation** (`npm run lint:env`, `npm run build`), **Deployment** (Vercel: push to GitHub, import project, add env var in Dashboard → Deploy).
  - **Depends on**: TASK-012

- [ ] TASK-064: Finalize next.config.ts for production
  - **File**: `next.config.ts`
  - **Details**: Verify `reactStrictMode: true` is set. Remove any `console.log` calls in config. Confirm no `output: 'standalone'` (Vercel manages this). Confirm `images.domains` is empty (no remote images). Add a comment at top: `// maxDuration is set per-route in app/api/analyze/route.ts, not here`.
  - **Depends on**: TASK-058

- [ ] TASK-065: Deploy to Vercel
  - **File**: N/A (deployment step)
  - **Details**: (1) Ensure all changes are committed: `git add -A && git commit -m "feat: complete Zaraat AI crop disease detection"`. (2) Push to GitHub: `git push origin master`. (3) Go to vercel.com → New Project → Import from GitHub → select repo. (4) Framework Preset: Next.js (auto-detected). (5) Environment Variables: add `OPENAI_API_KEY` with real value, scoped to Production + Preview. (6) Click Deploy. (7) Monitor build log for errors — build should complete in under 2 minutes.
  - **Depends on**: TASK-062, TASK-063, TASK-064

- [ ] TASK-066: Test production URL on real Android device
  - **File**: N/A (validation step)
  - **Details**: Open production Vercel URL on Android (Chrome). Test: (1) Page loads in Urdu RTL — verify layout is not broken; (2) Tap "Camera" — rear camera opens (requires HTTPS, which Vercel provides); (3) Take photo of a plant leaf and submit — analysis completes within 15 seconds; (4) Result page shows all fields correctly; (5) Tap "Download PDF" — PDF downloads to device; (6) Open PDF — verify Urdu text renders; (7) Toggle to English — all text switches; (8) Close browser and reopen — English preference is remembered.
  - **Depends on**: TASK-065

- [ ] TASK-067: Run quickstart.md validation suite against production
  - **File**: N/A (validation step)
  - **Details**: Execute all test steps from `specs/001-crop-disease-detection/quickstart.md` against the live Vercel URL. Replace `http://localhost:3000` with the production URL. Key curl tests: (1) Happy path with real crop photo → expect 200 + valid JSON; (2) Non-leaf image → expect `NOT_A_CROP_LEAF`; (3) Missing image field → expect `INVALID_IMAGE`; (4) Send 11 rapid requests → expect `RATE_LIMITED` on 11th. Verify PDF filename pattern. Verify no NEXT_PUBLIC_OPENAI in browser DevTools → Sources.
  - **Depends on**: TASK-066

- [ ] TASK-068: Final acceptance test against all success criteria
  - **File**: N/A (validation step)
  - **Details**: Manually verify each success criterion from spec.md. Mark PASS or FAIL:
    - SC-001: Analysis completes in ≤ 15 seconds on 4G — time it
    - SC-002: Default language is Urdu with RTL layout — verify on fresh visit
    - SC-003: Language toggle switches all text to English — verify all strings change
    - SC-004: PDF downloads in ≤ 3 seconds and contains all 8 content blocks — time it
    - SC-005: Scan results persist in localStorage after page close — verify
    - SC-006: 11th scan causes oldest scan to be pruned — verify max 10 in localStorage
    - SC-007: Non-crop-leaf image shows clear error message — verify message text
    - SC-008: After rate limit, user sees localized error with retry option — verify
    
    All 8 must be PASS before marking this task complete.
  - **Depends on**: TASK-067

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)      → no dependencies — start immediately
Phase 2 (Upload)     → requires: TASK-001 through TASK-012
Phase 3 (API & AI)   → requires: TASK-004, TASK-005, TASK-007 (types, i18n, context)
Phase 4 (Result)     → requires: Phase 2 and Phase 3 complete
Phase 5 (PDF)        → requires: TASK-004 (types), TASK-036 (font)
Phase 6 (Language)   → requires: Phase 2 and Phase 4 (must have all strings identified)
Phase 7 (GSAP)       → requires: all components created (Phase 2, 4, 8 partial)
Phase 8 (FAQ/Polish) → requires: all above complete
Phase 9 (Deployment) → requires: TASK-062 (clean build)
```

### Parallel Opportunities Within Phase 1

```
Can run in parallel after TASK-001:
  TASK-003 (tailwind.config.ts)
  TASK-004 (types/diagnosis.ts)
  TASK-012 (.env.example)

Can run in parallel after TASK-004 + TASK-005:
  TASK-007 (LanguageContext)
  TASK-010 (Header)  ← after TASK-008
  TASK-011 (LanguageToggle)  ← after TASK-008
  TASK-013 (useUpload hook)
```

### Parallel Opportunities Within Phase 4

```
After TASK-004, TASK-005, TASK-008 are done, these can run in parallel:
  TASK-025 (SeverityBadge)
  TASK-026 (TreatmentSteps)
  TASK-027 (SpraySchedule)
  TASK-028 (MedicinesList)
  TASK-030 (CopyTextButton)
  TASK-031 (PDFExportButton)
```

### Parallel Opportunities Within Phase 7

```
All GSAP tasks (TASK-044 through TASK-053) can run in parallel — different files:
  TASK-044 (UploadCard)
  TASK-045 (AnalyzeButton)
  TASK-046 (RecentScansList)
  TASK-047 (LoadingScreen)
  TASK-048 (ResultCard)
  TASK-049 (SeverityBadge)
  TASK-050 (TreatmentSteps)
  TASK-051 (SpraySchedule + MedicinesList)
  TASK-052 (CopyTextButton + PDFExportButton)
  TASK-053 (FAQItem)
```

---

## User Story Mapping

| User Story | Tasks | Phase | Priority |
|---|---|---|---|
| US1 — Photo Diagnosis | TASK-013 through TASK-023 | Phases 2 & 3 | P1 |
| US2 — Result Actions | TASK-024 through TASK-038 | Phases 4 & 5 | P1 |
| US3 — Language Toggle | TASK-039 through TASK-043 | Phase 6 | P2 |
| US4 — FAQ | TASK-055 through TASK-056 | Phase 8 | P3 |

### MVP Scope (US1 + US2 only)

To ship a working MVP, complete in order:
1. Phase 1 (TASK-001 to TASK-012) — full setup
2. Phase 2 (TASK-013 to TASK-019) — upload flow  
3. Phase 3 (TASK-020 to TASK-023) — API + AI
4. Phase 4 (TASK-024 to TASK-035) — result page + storage
5. Phase 5 (TASK-036 to TASK-038) — PDF export

MVP delivers: upload photo → diagnosis → view results → copy/PDF/recent scans. Language defaults to Urdu. No language toggle, no FAQ, no GSAP (add in Phase 6-8).

---

## Implementation Notes

- Each task targets **one file** or **one clearly-scoped function** — do not bundle multiple files into one task
- Tasks marked `[P]` can be implemented in parallel with other `[P]` tasks in the same phase
- Validation tasks (curl tests, build checks) are blocking — do not proceed past them if they fail
- `lib/openai.ts` must start with `import 'server-only'` — this is enforced by the build
- All `useEffect` hooks with GSAP must return `() => ctx.revert()` — no exceptions
- localStorage operations must be wrapped in `try/catch` — never assume storage is available
- The `nanoid` import is `import { nanoid } from 'nanoid'` (named export, not default)
- `jsPDF` import is `import jsPDF from 'jspdf'` (default export)
