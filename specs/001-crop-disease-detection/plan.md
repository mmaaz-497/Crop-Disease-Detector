# Implementation Plan: Zaraat AI — Crop Disease Detection

**Branch**: `001-crop-disease-detection` | **Date**: 2026-05-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-crop-disease-detection/spec.md`

---

## Summary

Zaraat AI is a mobile-first Next.js 14 web app that lets Pakistani farmers photograph a diseased crop leaf, receive an AI-powered diagnosis (disease name + severity + treatment + medicines) in Urdu or English, and export the result as a PDF. The entire stack runs in one Next.js App Router repo: server-side API routes call OpenAI GPT-4o for vision analysis; the client handles localStorage persistence and client-side PDF generation with jsPDF. No database, no authentication, no external services beyond OpenAI and Vercel.

---

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 18.17+
**Primary Dependencies**: Next.js 14 (App Router), Tailwind CSS, GSAP 3.x, openai SDK v4, jsPDF 2.x, nanoid
**Storage**: localStorage only (key: `zaraat_scans`, `zaraat_lang`) — no database
**Testing**: No automated test suite (out of scope per constitution); manual validation via quickstart.md
**Target Platform**: Web — mobile-first (375 px Android/iOS), Vercel serverless
**Performance Goals**: End-to-end analysis ≤ 15s on 4G; FCP ≤ 1.5s; PDF generation ≤ 3s
**Constraints**: OPENAI_API_KEY server-side only; no NEXT_PUBLIC_ prefix; 10 MB image limit; 30s API timeout; Vercel Hobby plan (10s function default, request maxDuration=30)
**Scale/Scope**: Hackathon — single developer, ~5 screens, 1 API route, ~15 components, ~4 library files

---

## Constitution Check

*GATE: Must pass before Phase 0 research. All gates pass — no violations.*

| Principle | Gate | Status |
|---|---|---|
| I. Simplicity-First UX | ≤ 2 primary CTAs per screen; plain-language labels; error messages tell user what to DO | ✅ PASS — Upload + Analyze = 2 CTAs; all labels via i18n.ts |
| II. Mobile-First | 375 px base layout; all touch targets ≥ 44px; no hover-only interactions | ✅ PASS — Tailwind base classes target 375px; buttons `min-h-[52px]` |
| III. Server-Side AI Gate | All OpenAI calls in `app/api/analyze/route.ts` only; `OPENAI_API_KEY` never in client bundle | ✅ PASS — `lib/openai.ts` has `import 'server-only'`; no NEXT_PUBLIC_ prefix |
| IV. Privacy by Design | No auth; no DB; no analytics; images not stored server-side | ✅ PASS — localStorage only; image processed and discarded per request |
| V. Bilingual Accessibility | All strings via `lib/i18n.ts`; RTL for Urdu; language persisted in localStorage | ✅ PASS — LanguageContext + i18n.ts; `document.dir` set on toggle |
| VI. Single-Diagnosis Contract | Prompt returns one disease; no confidence scores; non-leaf rejected | ✅ PASS — Prompt engineering enforces single result + sentinel error JSON |
| VII. Local-First Persistence | localStorage only; FIFO 10-scan cap; PDF for history export | ✅ PASS — `lib/storage.ts` manages FIFO; jsPDF for export |
| VIII. Smallest Viable Change | No state management library; no BFF; no abstractions beyond what spec requires | ✅ PASS — React Context + useState; no Redux/Zustand/React Query |

**No complexity violations to log.**

---

## Project Structure

### Documentation (this feature)

```text
specs/001-crop-disease-detection/
├── plan.md              # This file
├── research.md          # Technology decisions (Phase 0)
├── data-model.md        # Entity definitions (Phase 1)
├── quickstart.md        # Setup & validation guide (Phase 1)
├── contracts/
│   └── analyze.contract.json  # OpenAPI 3.0 contract for POST /api/analyze
└── tasks.md             # Phase 2 output (/sp.tasks — NOT created here)
```

### Source Code (repository root)

```text
zaraat-ai/
├── app/
│   ├── layout.tsx                  # Root layout: LanguageProvider, fonts, metadata
│   ├── page.tsx                    # Home/Dashboard: upload card + recent scans
│   ├── result/
│   │   └── page.tsx                # Result screen: disease card + actions
│   ├── faq/
│   │   └── page.tsx                # FAQ screen: 5 Q&A pairs
│   └── api/
│       └── analyze/
│           └── route.ts            # POST handler: validation → OpenAI → response
│
├── components/
│   ├── Header.tsx                  # Logo + LanguageToggle — appears on all screens
│   ├── LanguageToggle.tsx          # اردو | EN pill toggle, reads/writes LanguageContext
│   ├── UploadCard.tsx              # Camera/gallery input + thumbnail preview
│   ├── ContextInput.tsx            # Optional 500-char text area with counter
│   ├── AnalyzeButton.tsx           # Submit CTA — disabled until image selected
│   ├── LoadingScreen.tsx           # Full-screen overlay: leaf animation + progress bar
│   ├── ErrorToast.tsx              # Non-blocking toast for client errors
│   ├── ResultCard.tsx              # Disease name card (GSAP entrance)
│   ├── SeverityBadge.tsx           # Colour-coded Mild/Moderate/Severe badge
│   ├── TreatmentSteps.tsx          # Numbered step list (GSAP stagger)
│   ├── SpraySchedule.tsx           # Schedule text section
│   ├── MedicinesList.tsx           # Brand + generic medicine lists
│   ├── CopyTextButton.tsx          # Clipboard copy with "Copied!" toast
│   ├── PDFExportButton.tsx         # Triggers lib/pdf.ts and auto-downloads
│   ├── RecentScansList.tsx         # Up to 10 stored scans, PDF re-export
│   └── FAQItem.tsx                 # Single Q&A pair with GSAP scroll reveal
│
├── lib/
│   ├── openai.ts                   # server-only: buildPrompt + analyzeLeaf
│   ├── pdf.ts                      # client-only: generateDiagnosisPDF (jsPDF)
│   ├── storage.ts                  # client-only: saveScan / getScans / deleteScan
│   └── i18n.ts                     # Language = 'ur'|'en'; strings map; t(key, lang)
│
├── hooks/
│   ├── useLanguage.ts              # Reads LanguageContext; returns { lang, setLang }
│   └── useUpload.ts                # Manages file selection, validation, preview state
│
├── context/
│   └── LanguageContext.tsx         # React Context + Provider; localStorage sync
│
├── types/
│   └── diagnosis.ts                # ScanRecord, DiagnosisResult, SeverityLevel, etc.
│
├── public/
│   └── fonts/
│       └── NotoNaskhArabic.b64.txt # Base64-encoded font subset for jsPDF Urdu PDF
│
├── .env.example                    # OPENAI_API_KEY=sk-... (documented, committed)
├── .env.local                      # Real key (gitignored)
├── tailwind.config.ts              # Design tokens: primary, accent, base colours; urdu font
├── next.config.ts                  # CSP headers; maxDuration not set here (set per-route)
└── tsconfig.json                   # strict: true
```

**Structure Decision**: Single Next.js app (Option 2 from template). No separate backend. API routes serve as the server layer. All source under project root — no `src/` directory (Next.js App Router convention).

---

## Component Breakdown

### `Header.tsx`
```typescript
interface HeaderProps { showBack?: boolean; backLabel?: string; }
```
- State: none (reads lang from context via `useLanguage`)
- Uses: `LanguageToggle`
- GSAP: none (static header)

### `LanguageToggle.tsx`
```typescript
interface LanguageToggleProps {} // reads and writes LanguageContext
```
- State: none (reads/writes `LanguageContext`)
- Uses: none
- GSAP: `gsap.to(indicator, { x: lang==='ur' ? 0 : 32, duration: 0.25, ease: 'power2.inOut' })` on toggle

### `UploadCard.tsx`
```typescript
interface UploadCardProps {
  lang: Language;
  previewUrl: string | null;
  onFileSelect: (file: File) => void;
}
```
- State: drag-over boolean (local)
- Uses: two hidden `<input>` elements (camera + gallery)
- GSAP: mount fade-up; drag-over border pulse

### `ContextInput.tsx`
```typescript
interface ContextInputProps {
  lang: Language;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number; // default 500
}
```
- State: none (controlled by parent)
- GSAP: none

### `AnalyzeButton.tsx`
```typescript
interface AnalyzeButtonProps {
  lang: Language;
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}
```
- State: none
- GSAP: hover scale 1.05 (`onMouseEnter`/`onMouseLeave`)

### `LoadingScreen.tsx`
```typescript
interface LoadingScreenProps { lang: Language; }
```
- State: none (shown/hidden by parent state)
- GSAP: leaf rotation loop; progress bar 0→95% over 8s; screen fade-in

### `ErrorToast.tsx`
```typescript
interface ErrorToastProps {
  lang: Language;
  code: ErrorCode | null;   // null = hidden
  onRetry: () => void;
  onDismiss: () => void;
}
```
- State: none (controlled by parent)
- GSAP: slide-down entrance, fade-out on dismiss

### `ResultCard.tsx`
```typescript
interface ResultCardProps {
  lang: Language;
  result: DiagnosisResult;
}
```
- State: none
- Uses: `SeverityBadge`, `TreatmentSteps`, `SpraySchedule`, `MedicinesList`
- GSAP: disease name entrance (back.out); triggers child stagger animations

### `SeverityBadge.tsx`
```typescript
interface SeverityBadgeProps { severity: SeverityLevel; lang: Language; }
```
- State: none
- GSAP: scale pop on mount (back.out(2), delay 0.3s)

### `TreatmentSteps.tsx`
```typescript
interface TreatmentStepsProps { steps: string[]; lang: Language; }
```
- State: none
- GSAP: stagger fade-left (x -20→0, stagger 0.1s per item)

### `SpraySchedule.tsx`
```typescript
interface SprayScheduleProps { schedule: string; lang: Language; }
```
- State: none
- GSAP: fade-up on mount (part of ResultCard stagger sequence)

### `MedicinesList.tsx`
```typescript
interface MedicinesListProps { medicines: MedicineSet; lang: Language; }
```
- State: none
- GSAP: fade-up on mount (part of ResultCard stagger sequence)

### `CopyTextButton.tsx`
```typescript
interface CopyTextButtonProps { result: DiagnosisResult; lang: Language; }
```
- State: `copied: boolean` (shows "Copied!" toast for 2s)
- GSAP: hover scale

### `PDFExportButton.tsx`
```typescript
interface PDFExportButtonProps {
  result: DiagnosisResult;
  scanDate: string;
  lang: Language;
}
```
- State: `generating: boolean`
- Calls: `lib/pdf.ts → generateDiagnosisPDF`
- GSAP: hover scale

### `RecentScansList.tsx`
```typescript
interface RecentScansListProps { lang: Language; }
```
- State: `scans: ScanRecord[]` (loaded from `lib/storage.ts` on mount)
- GSAP: stagger fade-up (stagger 0.07s per row)

### `FAQItem.tsx`
```typescript
interface FAQItemProps { q: string; a: string | string[]; index: number; }
```
- State: none
- GSAP: scroll-triggered fade-up via IntersectionObserver

---

## Data Flow

### 1. Image Upload → Analysis → Result

```
[UploadCard] onFileSelect(file)
    ↓ validated by useUpload hook (type, size)
    ↓ error toast if invalid → STOP
[app/page.tsx] setState: { previewUrl, selectedFile }
    ↓ user taps AnalyzeButton
[app/page.tsx] setLoading(true) → shows LoadingScreen
    ↓
[app/page.tsx] POST /api/analyze (FormData: image + context + language)
    ↓
[app/api/analyze/route.ts]
    1. checkRateLimit(ip)                    → 429 if exceeded
    2. formData.get('image')                 → File
    3. validateMimeType(magicBytes)          → 400 INVALID_IMAGE if fail
    4. validateFileSize(≤10MB)               → 400 INVALID_IMAGE if fail
    5. imageFile.arrayBuffer() → Buffer → base64
    6. buildSystemPrompt(language)
    7. openai.chat.completions.create(...)   → Promise.race with 28s timeout
    8. JSON.parse(response.content)
    9. checkSentinelErrors(parsed)           → 400 NOT_A_CROP_LEAF or 422 DIAGNOSIS_FAILED
   10. validateDiagnosisResult(parsed)       → 500 UPSTREAM_ERROR if schema invalid
   11. return NextResponse.json(parsed, 200)
    ↓
[app/page.tsx] receives DiagnosisResult JSON
    ↓ on error: setError(code), setLoading(false) → ErrorToast shown
    ↓ on success:
    1. enrichScan(result) → ScanRecord (add id, date, lang, thumb)
    2. storage.saveScan(scan)                → localStorage write
    3. setResult(scan)
    4. router.push('/result?id=' + scan.id)  OR pass via React state/sessionStorage
    ↓
[app/result/page.tsx]
    1. Reads result from sessionStorage or router state
    2. Renders ResultCard with GSAP animations
```

### 2. Language Toggle → API Call Propagation

```
[LanguageToggle] onClick
    ↓
[LanguageContext] setLang(newLang)
    ↓ writes 'zaraat_lang' to localStorage
    ↓ all components reading useLanguage() re-render with new strings
    ↓ document.dir updated: 'rtl' (ur) | 'ltr' (en)

Next analysis request:
[app/page.tsx] reads lang from useLanguage()
    ↓ FormData.append('language', lang)
    ↓ API route uses language to build prompt and error messages
```

### 3. PDF Generation

```
[PDFExportButton] onClick
    ↓
[lib/pdf.ts] generateDiagnosisPDF(result, scanDate, lang)
    1. new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' })
    2. if lang==='ur': doc.addFont(NotoNaskhArabic, ...)
    3. Render header (Zaraat AI, tagline, rule)
    4. Render metadata (date, scan ID)
    5. Render disease name (bold, 16pt)
    6. Render severity badge (coloured rect + text)
    7. Render treatment steps (numbered list)
    8. Render spray schedule (italic)
    9. Render medicines (brand + generic subsections)
   10. Render footer
   11. doc.save(`Zaraat AI-${scanDate}.pdf`)
    ↓ Browser triggers file download
```

### 4. localStorage Read/Write Points

| Event | Operation | Key |
|---|---|---|
| App init (`LanguageContext`) | Read | `zaraat_lang` |
| Language toggle | Write | `zaraat_lang` |
| Result screen loads | Write (saveScan) | `zaraat_scans` |
| Home screen mounts (`RecentScansList`) | Read (getScans) | `zaraat_scans` |
| PDF re-export from history | Read (getScan by id) | `zaraat_scans` |
| 11th scan arrives | Delete oldest (FIFO prune) | `zaraat_scans` |

---

## API Route — Detailed Logic

### `app/api/analyze/route.ts`

```typescript
export const maxDuration = 30; // seconds — Vercel Pro only; Hobby caps at 10s

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

// Module-level rate limit map (per serverless instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: Request): Promise<NextResponse> {
  // 1. Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return errorResponse('RATE_LIMITED', 429, language);
  }

  // 2. Parse FormData
  const formData = await request.formData();
  const imageFile = formData.get('image') as File | null;
  const context = (formData.get('context') as string | null) ?? '';
  const language: Language = (formData.get('language') as Language) ?? 'ur';

  // 3. Validate image presence
  if (!imageFile) return errorResponse('INVALID_IMAGE', 400, language);

  // 4. Validate MIME type (client-declared + magic bytes)
  if (!ALLOWED_MIMES.includes(imageFile.type)) return errorResponse('INVALID_IMAGE', 400, language);
  const buffer = Buffer.from(await imageFile.arrayBuffer());
  if (!validateMagicBytes(buffer, imageFile.type)) return errorResponse('INVALID_IMAGE', 400, language);

  // 5. Validate file size
  if (buffer.length > MAX_SIZE) return errorResponse('INVALID_IMAGE', 400, language);

  // 6. Call OpenAI with timeout
  let rawJson: string;
  try {
    rawJson = await Promise.race([
      analyzeLeaf(buffer, imageFile.type, context.slice(0, 500), language),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 28_000)
      ),
    ]);
  } catch (err) {
    const code = (err as Error).message === 'TIMEOUT' ? 'TIMEOUT' : 'UPSTREAM_ERROR';
    const status = code === 'TIMEOUT' ? 408 : 500;
    return errorResponse(code, status, language);
  }

  // 7. Parse and validate response
  let parsed: unknown;
  try { parsed = JSON.parse(rawJson); } catch {
    return errorResponse('UPSTREAM_ERROR', 500, language);
  }

  // 8. Check sentinel errors from AI
  if ((parsed as any)?.error === 'NOT_A_CROP_LEAF') return errorResponse('NOT_A_CROP_LEAF', 400, language);
  if ((parsed as any)?.error === 'DIAGNOSIS_FAILED') return errorResponse('DIAGNOSIS_FAILED', 422, language);

  // 9. Validate DiagnosisResult schema
  if (!isDiagnosisResult(parsed)) return errorResponse('UPSTREAM_ERROR', 500, language);

  return NextResponse.json(parsed, { status: 200 });
}
```

**Helper functions** (all in `route.ts` or imported from `lib/openai.ts`):
- `checkRateLimit(ip)`: In-memory Map, 10 req/min/IP
- `validateMagicBytes(buf, mime)`: Checks first 4 bytes against JPEG/PNG/WebP signatures
- `analyzeLeaf(...)`: In `lib/openai.ts` (server-only)
- `isDiagnosisResult(obj)`: Type guard checking all required fields
- `errorResponse(code, status, lang)`: Returns `NextResponse.json({ error: { code, message, messageEn } }, { status })`

---

## Third-Party Integration Details

### OpenAI SDK Setup

```typescript
// lib/openai.ts
import 'server-only';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// Singleton — reused across requests in the same serverless instance
```

Model: `gpt-4o` | `response_format: { type: 'json_object' }` | `max_tokens: 1000`

### jsPDF Setup

```typescript
// lib/pdf.ts — 'use client' components only import this
import jsPDF from 'jspdf';
// Font registration done once per PDF generation call
```

Urdu font: Load `public/fonts/NotoNaskhArabic.b64.txt` at build time → embed in PDF.
Fallback: If font fails, use Helvetica with Latin transliteration note.

### GSAP Setup

```typescript
// In each animated component — no global registration
import gsap from 'gsap';
// ScrollTrigger registered inside component that needs it:
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger); // inside useEffect only
```

**Critical**: Never import from `'gsap/all'` — tree-shaking requires named imports.

---

## Environment Variables

```bash
# .env.example

# Required — OpenAI API key with GPT-4o access
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-...your-key-here...

# Optional — uncomment to change default language (default: ur)
# NEXT_PUBLIC_DEFAULT_LANG=ur
```

**Security rules**:
- `OPENAI_API_KEY`: Server-only. NEVER prefix with `NEXT_PUBLIC_`.
- `NEXT_PUBLIC_DEFAULT_LANG`: Safe for client (it's not a secret). Optional — default `ur` is hardcoded.
- All secrets MUST be set in Vercel Dashboard → Project → Environment Variables for production.

---

## Implementation Phases

### Phase 1: Project Setup + Basic Upload

**Goal**: Running Next.js 14 app with upload card, thumbnail preview, design tokens. No API yet.

Tasks:
1. Init Next.js 14 with TypeScript + Tailwind + App Router
2. Install `gsap`, `jspdf`, `nanoid`
3. Configure `tailwind.config.ts` with Zaraat AI tokens (#1B4332, #74C69D, #F0FFF4)
4. Create `types/diagnosis.ts` — all TypeScript interfaces
5. Create `lib/i18n.ts` — initial string map (Urdu + English for all UI labels)
6. Create `context/LanguageContext.tsx` + `hooks/useLanguage.ts`
7. Create `app/layout.tsx` — LanguageProvider wrapper, Urdu font meta
8. Create `components/Header.tsx` + `components/LanguageToggle.tsx`
9. Create `hooks/useUpload.ts` — file validation logic
10. Create `components/UploadCard.tsx` — camera + gallery inputs, thumbnail preview
11. Create `components/ContextInput.tsx` — 500-char textarea
12. Create `components/AnalyzeButton.tsx` — disabled state
13. Wire up `app/page.tsx` — Home layout with upload card
14. Create `.env.example`; add `.env.local` to `.gitignore`
15. Add `lint:env` script to `package.json`

**Checkpoint**: Home screen renders at 375px, upload card works, thumbnail preview shows, Analyze button disabled without image, language toggle switches text.

---

### Phase 2: API Route + GPT-4 Vision Integration

**Goal**: POST `/api/analyze` returns real disease diagnosis from GPT-4o.

Tasks:
1. Install `openai` SDK
2. Create `lib/openai.ts` — `buildSystemPrompt(lang)` + `analyzeLeaf(...)` (server-only)
3. Create `app/api/analyze/route.ts` — full implementation per logic plan above
4. Add `checkRateLimit`, `validateMagicBytes`, `isDiagnosisResult`, `errorResponse` helpers
5. Wire `app/page.tsx` to call API and store result in state
6. Create `components/LoadingScreen.tsx` — shown during API call
7. Create `components/ErrorToast.tsx` — shown on API errors
8. Test with `curl` per quickstart.md test cases

**Checkpoint**: `curl` test cases all pass (200 + valid JSON, 400 for non-leaf, 400 for invalid image).

---

### Phase 3: Result Screen + PDF Export

**Goal**: Full result display with all fields + copy text + PDF download + recent scans.

Tasks:
1. Create `lib/storage.ts` — `saveScan`, `getScans`, `deleteScan`, FIFO 10-scan management
2. Create `app/result/page.tsx` — reads result from sessionStorage/state
3. Create `components/ResultCard.tsx` — disease name section
4. Create `components/SeverityBadge.tsx` — Mild/Moderate/Severe with colours
5. Create `components/TreatmentSteps.tsx` — numbered list
6. Create `components/SpraySchedule.tsx`
7. Create `components/MedicinesList.tsx` — brand + generic subsections
8. Create `components/CopyTextButton.tsx` — clipboard copy + "Copied!" feedback
9. Add Noto Naskh Arabic font subset to `public/fonts/NotoNaskhArabic.b64.txt`
10. Create `lib/pdf.ts` — full PDF generation with all 8 content blocks
11. Create `components/PDFExportButton.tsx`
12. Create `components/RecentScansList.tsx` — reads from storage, PDF re-export
13. Add RecentScansList to `app/page.tsx`

**Checkpoint**: Full end-to-end flow works — photo → diagnosis → result screen → PDF download → scan appears in recent list → re-export PDF from list.

---

### Phase 4: Language Toggle + Urdu RTL Support

**Goal**: All strings Urdu by default; English toggle works; RTL layout correct.

Tasks:
1. Expand `lib/i18n.ts` with all strings used in Phases 1–3 (audit every hardcoded string)
2. Replace any remaining hardcoded strings in components with `t(key, lang)`
3. Add `document.dir = lang === 'ur' ? 'rtl' : 'ltr'` in `LanguageContext.tsx`
4. Audit all Tailwind classes — replace directional classes (`ml-`, `mr-`, `pl-`, `pr-`) with logical properties (`ms-`, `me-`, `ps-`, `pe-`)
5. Test language persistence across page reload
6. Test RTL layout at 375px — no clipped text, no misaligned elements
7. Test English API responses when `language=en`

**Checkpoint**: Every visible string shows in Urdu (default); toggle to English switches all strings; layout flips LTR; preference survives reload.

---

### Phase 5: GSAP Animations

**Goal**: All 14 animation triggers from the spec fire correctly with proper cleanup.

Tasks (apply to each component per the GSAP animation table in spec):
1. `UploadCard.tsx` — mount fade-up + drag-over border pulse
2. `AnalyzeButton.tsx` — hover scale
3. `RecentScansList.tsx` — stagger fade-up
4. `LoadingScreen.tsx` — leaf rotation loop + progress bar fill
5. `ResultCard.tsx` — disease name entrance
6. `SeverityBadge.tsx` — pop on mount
7. `TreatmentSteps.tsx` — stagger fade-left
8. `SpraySchedule.tsx` + `MedicinesList.tsx` — fade-up stagger
9. `CopyTextButton.tsx` + `PDFExportButton.tsx` — hover scale
10. `FAQItem.tsx` — IntersectionObserver scroll-triggered fade-up

All animations use `gsap.context(fn, ref).revert()` cleanup.

**Checkpoint**: All animations fire on first load and on re-mount; no memory leaks observed in React DevTools (no stale listeners after navigation).

---

### Phase 6: FAQ Screen + Polish

**Goal**: FAQ screen complete; overall polish pass.

Tasks:
1. Create `components/FAQItem.tsx` — Q&A pair with scroll animation
2. Create `app/faq/page.tsx` — 5 required Q&A pairs in both languages
3. Add FAQ link to `app/page.tsx` footer
4. Add `next.config.ts` CSP headers
5. Test full mobile viewport at 375px — no horizontal scroll
6. Verify all touch targets ≥ 44px (run Chrome DevTools accessibility check)
7. Run `npm run lint:env` — verify zero NEXT_PUBLIC_OPENAI matches
8. Run `npm run build` — verify clean TypeScript build, zero errors

**Checkpoint**: All 5 FAQ answers visible in Urdu and English; CSP headers present; lint:env passes; build clean.

---

### Phase 7: Vercel Deployment

**Goal**: Production app live on Vercel with OpenAI key configured.

Tasks:
1. Push branch to remote (or merge to main)
2. Connect repo to Vercel
3. Set `OPENAI_API_KEY` in Vercel Dashboard → Environment Variables
4. Trigger deployment → verify build succeeds
5. Test production URL on real Android device:
   - Camera capture works over HTTPS
   - Full analysis flow end-to-end
   - PDF downloads correctly
   - Language toggle works
6. Run quickstart.md validation steps against production URL

**Checkpoint**: App live, all SC-001 through SC-008 pass on production URL.

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Vercel Hobby plan 10s function timeout cuts off GPT-4o calls | High | High | Show "up to 15 seconds" messaging; animated progress bar; `maxDuration=30` comment (upgrade path for Pro); prompt is optimised to request minimal `max_tokens: 1000` |
| GPT-4o returns malformed JSON despite `json_object` mode | Low | Medium | `isDiagnosisResult` type guard; fallback to `UPSTREAM_ERROR`; retry once with user prompt "try again" |
| Urdu font not rendering in jsPDF on some devices | Medium | Medium | Embed Base64 font subset in PDF; test on Android + iOS; fallback to Helvetica with "(Urdu text)" note |
| Mobile camera `capture` attribute not working on some Android browsers | Medium | Low | Galaxy browser / Firefox fallback → gallery picker still works; show tip "use Chrome for camera" |
| OpenAI rate limits on free/trial key | Medium | High | In-app rate limiter (10 req/min); user messaging: "Request limit reached, please wait" |
| `localStorage` disabled (private browsing) | Low | Low | All writes in try/catch; result display never depends on storage write success |

---

## Complexity Tracking

> No constitution violations — no entries required.

All decisions align with Principle VIII (Smallest Viable Change). The chosen approaches (React Context over Redux, localStorage over database, jsPDF over react-pdf, module-level rate limiter over Redis) are the simplest that meet acceptance criteria.
