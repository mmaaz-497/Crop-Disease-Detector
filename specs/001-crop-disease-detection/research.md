# Research: Zaraat AI — Crop Disease Detection

**Branch**: `001-crop-disease-detection` | **Date**: 2026-05-02
**Phase**: 0 — Technology decisions and integration patterns

---

## Decision 1: Next.js 14 API Route + FormData Parsing

**Decision**: Use Next.js 14 App Router API routes (`app/api/analyze/route.ts`) with native `Request.formData()` — no external multipart library needed.

**Rationale**: Next.js 14's App Router `route.ts` handlers receive a Web API `Request` object. `await request.formData()` natively parses `multipart/form-data` including file uploads. No `formidable`, `busboy`, or `multer` required. This keeps the dependency count minimal (Principle VIII).

**Alternatives considered**:
- `formidable` (Node.js): Works but requires additional setup and adds ~50 KB to the server bundle.
- `busboy`: Lower-level, more complexity than necessary.

**Pattern**:
```typescript
// app/api/analyze/route.ts
export async function POST(request: Request) {
  const formData = await request.formData();
  const imageFile = formData.get('image') as File | null;
  const context = formData.get('context') as string | null;
  const language = (formData.get('language') as string) ?? 'ur';
  // ...
}
```

**Image access**: `File.arrayBuffer()` → `Buffer` → base64 for OpenAI.

---

## Decision 2: OpenAI SDK v4 — GPT-4 Vision Integration

**Decision**: Use `openai` npm package v4.x with the `gpt-4o` model (vision-capable successor to `gpt-4-vision-preview`). Send image as base64 data URL inside `image_url.url`.

**Rationale**: `gpt-4o` is the current recommended vision model — faster and cheaper than the deprecated `gpt-4-vision-preview`. The SDK's `chat.completions.create` call with `response_format: { type: 'json_object' }` forces pure JSON output, eliminating markdown fence parsing.

**Alternatives considered**:
- `gpt-4-vision-preview`: Deprecated, slower, higher cost.
- Passing image as URL: Requires hosting images — violates Principle IV (Privacy by Design).
- Azure OpenAI: No additional benefit for hackathon scope.

**Pattern**:
```typescript
// lib/openai.ts (server-only)
import 'server-only';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeLeaf(
  imageBuffer: Buffer,
  mimeType: string,
  context: string,
  language: 'ur' | 'en'
): Promise<string> {
  const base64 = imageBuffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: buildSystemPrompt(language) },
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } },
          { type: 'text', text: context ? `Context: ${context}` : 'Analyse this crop leaf.' }
        ]
      }
    ],
    max_tokens: 1000,
  });

  return response.choices[0].message.content ?? '';
}
```

**Timeout**: Wrap the call in `Promise.race` against a 28-second timeout (leaving 2s for response serialisation within Vercel's 30s function limit).

---

## Decision 3: jsPDF — Client-Side PDF Generation

**Decision**: Use `jspdf` v2.x for PDF generation. For Urdu content, embed a Base64-encoded subset of the "Noto Naskh Arabic" font using `jsPDF.addFont`. RTL text direction is achieved using the `jspdf-autotable` plugin's RTL column order capability for tabular data, and manual `x` coordinate inversion for plain text.

**Rationale**: jsPDF runs entirely in the browser with no server round-trip (Principle VII). It supports custom font embedding via `addFont`. Full RTL auto-reflow is not natively supported in jsPDF, but for a structured report layout (left-aligned vs right-aligned fields), manual RTL can be achieved by measuring text width and subtracting from page width.

**Alternatives considered**:
- `react-pdf` / `@react-pdf/renderer`: SSR-compatible but adds ~600 KB and requires a different rendering model. Overkill for this scope.
- `html2canvas` + jsPDF: Captures DOM as canvas then embeds as image. Produces large files (~1 MB) and can't be searched. Rejected.
- Server-side PDF (Puppeteer): Requires server infrastructure — violates Principle VII.

**Urdu font strategy**:
1. Download Noto Naskh Arabic Regular subset (~120 KB).
2. Convert to Base64 using `scripts/font-to-base64.mjs` (one-time build step).
3. Store as `public/fonts/NotoNaskhArabic.b64.txt`.
4. In `lib/pdf.ts`, read and register: `doc.addFont(base64, 'NotoNaskhArabic', 'normal')`.
5. Set font before Urdu sections: `doc.setFont('NotoNaskhArabic')`.

**RTL workaround pattern**:
```typescript
// For RTL text: compute right-aligned x
const pageWidth = doc.internal.pageSize.getWidth();
const margin = 20;
const textWidth = doc.getTextWidth(urduText);
const x = pageWidth - margin - textWidth;
doc.text(urduText, x, y);
```

---

## Decision 4: GSAP with Next.js 14 (Client-Only)

**Decision**: Import GSAP only in `'use client'` components. Use `useEffect` with `gsap.context()` for all mount animations. Never import GSAP at the module level in server components or `lib/` files.

**Rationale**: GSAP manipulates the DOM — it cannot run during SSR. All animated components MUST be marked `'use client'`. Using `gsap.context(fn, scopeRef)` scopes animations to the component's subtree and `.revert()` in the cleanup function prevents memory leaks on unmount.

**Key pattern**:
```typescript
'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function UploadCard() {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current, { opacity: 0, y: 20, duration: 0.4, ease: 'power2.out' });
    }, ref);
    return () => ctx.revert();
  }, []);
  
  return <div ref={ref}>...</div>;
}
```

**ScrollTrigger for FAQ**: Import `ScrollTrigger` plugin and register it once inside the component that uses it. Do NOT register globally (avoids SSR issues).

---

## Decision 5: Rate Limiting Strategy

**Decision**: Simple in-memory IP-based rate limiter using a `Map<string, { count: number; resetAt: number }>` singleton in the API route module. Limit: 10 requests per IP per 60-second window.

**Rationale**: Redis or edge-rate-limit libraries are out of scope (Principle VIII). A module-level Map on Vercel serverless functions provides adequate hackathon-level protection. On Vercel, functions may spin up new instances, so the Map is per-instance — acceptable given low expected volume.

**Alternatives considered**:
- `@upstash/ratelimit` + Redis: Persistent across instances but requires external service setup.
- Vercel Edge Middleware rate limiting: More robust but adds routing complexity.
- No rate limiting: Unacceptable — single bad request could drain API budget.

**Pattern**:
```typescript
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}
```

IP extraction: `request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'`

---

## Decision 6: Image Validation

**Decision**: Two-layer validation — client-side (instant UX) + server-side (security gate).

**Client-side** (in `useUpload` hook):
- Check `file.type` against `['image/jpeg', 'image/png', 'image/webp']`
- Check `file.size <= 10 * 1024 * 1024`
- Show error toast immediately if either fails; do NOT call the API

**Server-side** (in API route, before calling OpenAI):
- Re-validate MIME type via magic bytes (first 4 bytes): JPEG = `FF D8 FF`, PNG = `89 50 4E 47`, WebP = `52 49 46 46`
- Re-validate file size
- Return `400 INVALID_IMAGE` if either fails

**Max dimension handling**: OpenAI `gpt-4o` with `detail: 'high'` handles images up to 2048×2048 internally. No client-side resizing needed. Images are passed as-is (up to 10 MB).

---

## Decision 7: Mobile Camera Access

**Decision**: Use two separate hidden `<input>` elements — one for camera capture, one for gallery.

**Camera**: `<input type="file" accept="image/*" capture="environment" />`
- `capture="environment"` opens rear camera on Android/iOS
- On desktop: falls back to file picker

**Gallery**: `<input type="file" accept="image/jpeg,image/png,image/webp" />`
- Standard file picker, no `capture` attribute

**Pattern in UploadCard**:
```tsx
const cameraRef = useRef<HTMLInputElement>(null);
const galleryRef = useRef<HTMLInputElement>(null);

<button onClick={() => cameraRef.current?.click()}>Take Photo</button>
<input ref={cameraRef} type="file" accept="image/*" capture="environment"
  className="hidden" onChange={handleFileChange} />
  
<button onClick={() => galleryRef.current?.click()}>Choose from Gallery</button>
<input ref={galleryRef} type="file" accept="image/jpeg,image/png,image/webp"
  className="hidden" onChange={handleFileChange} />
```

---

## Decision 8: Scan ID Generation

**Decision**: Use `nanoid(8)` from the `nanoid` package for 8-character URL-safe scan IDs.

**Rationale**: 8-char nanoid has ~37 bits of entropy — sufficient for 10 locally-stored scans with negligible collision probability. No UUID overhead.

**Alternative**: `crypto.randomUUID()` — available in modern browsers but produces 36-char strings. Nanoid is shorter and equally secure for this use case.

---

## Decision 9: Context Provider for Language

**Decision**: Create a `LanguageContext` React context in `app/layout.tsx` using `'use client'`. Wrap the entire app in `<LanguageProvider>`. All components read `const { lang, setLang } = useLanguage()`.

**Rationale**: Prop-drilling `lang` through all components (UploadCard → Home → Header) creates coupling. A context is the idiomatic React approach and avoids a state management library (Principle VIII).

**localStorage sync**: On initial render, read `Zaraat AI_lang` from localStorage and set as initial context value. On `setLang`, write to localStorage immediately.

---

## Decision 10: Vercel Deployment Configuration

**Decision**: Zero-config Vercel deployment — no `vercel.json` required. Set `OPENAI_API_KEY` in Vercel Dashboard Environment Variables. Add `next.config.ts` CSP headers for security.

**Vercel function timeout**: Default 10s on Hobby plan, extendable to 60s on Pro. Set `export const maxDuration = 30` in the API route to request 30s (works on Pro, capped at 10s on Hobby).

**Mitigation for Hobby plan**: Display a "Please wait up to 30 seconds" message and implement the 8-second animated progress bar to manage user expectations.

---

## All Unknowns Resolved

| Unknown | Resolution |
|---|---|
| Next.js API route multipart parsing | Native `request.formData()` — no library |
| OpenAI model for vision | `gpt-4o` with `response_format: json_object` |
| Urdu PDF generation | jsPDF + embedded Noto Naskh Arabic font subset |
| GSAP + Next.js SSR | `'use client'` + `useEffect` + `gsap.context` |
| Rate limiting | In-memory Map per API route module |
| Image max dimensions | OpenAI handles internally; no client resize needed |
| Mobile camera input | Two separate `<input>` elements with/without `capture` |
| Scan ID generation | `nanoid(8)` |
| Language state management | React Context + localStorage sync |
| Vercel timeout | `maxDuration = 30`, UX progress bar manages expectation |
