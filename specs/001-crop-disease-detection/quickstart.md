# Quickstart: Zaraat AI — Crop Disease Detection

**Branch**: `001-crop-disease-detection` | **Date**: 2026-05-02

---

## Prerequisites

- Node.js 18.17+ (LTS)
- npm 9+
- OpenAI API key with GPT-4o access

---

## 1. Clone & Install

```bash
git clone <repo-url>
cd zaraat-ai
npm install
```

---

## 2. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
OPENAI_API_KEY=sk-...your-actual-key...
```

Verify the key is set:

```bash
node -e "require('dotenv').config({path:'.env.local'}); console.log('Key set:', !!process.env.OPENAI_API_KEY)"
```

---

## 3. Run Dev Server

```bash
npm run dev
```

Open `http://localhost:3000` in Chrome DevTools mobile emulation (375 px width).

---

## 4. Test the Upload Flow

1. Open `http://localhost:3000`
2. Default language should be Urdu — verify RTL layout
3. Tap the upload card → choose a crop leaf image from your files
4. Optionally type context text
5. Tap Analyze
6. Verify the loading animation plays
7. Verify the Result screen shows disease name, severity badge, treatment steps

---

## 5. Test the API Route Directly

```bash
# Happy path (replace leaf.jpg with a real crop leaf photo)
curl -X POST http://localhost:3000/api/analyze \
  -F "image=@leaf.jpg" \
  -F "language=en" \
  | jq .

# Non-leaf image
curl -X POST http://localhost:3000/api/analyze \
  -F "image=@random-photo.jpg" \
  | jq .error.code
# Expected: "NOT_A_CROP_LEAF"

# Missing image
curl -X POST http://localhost:3000/api/analyze \
  -F "context=test" \
  | jq .error.code
# Expected: "INVALID_IMAGE"
```

---

## 6. Test PDF Export

1. Complete a successful scan
2. On the Result screen, tap "Download PDF"
3. Verify PDF downloads with filename `Zaraat AI-YYYY-MM-DD.pdf`
4. Open PDF — verify all 8 content blocks are present

---

## 7. Test Language Toggle

1. Tap `اردو | EN` toggle in the header
2. Verify all text switches to English, layout switches to LTR
3. Reload the page — verify English preference is remembered
4. Tap toggle again — verify Urdu and RTL are restored

---

## 8. Test Recent Scans

1. Complete 2–3 scans
2. Return to Home — verify scans appear in the Recent Scans list
3. Tap a scan's PDF button — verify PDF downloads

---

## 9. Security Validation

```bash
# Verify no NEXT_PUBLIC_OPENAI references
grep -r "NEXT_PUBLIC_OPENAI" . --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=.next
# Expected: no output

# Verify .env.local is not tracked
git ls-files .env.local
# Expected: no output
```

---

## 10. Production Build Check

```bash
npm run build
# Expected: exits 0, no TypeScript errors
```

---

## Deployment to Vercel

```bash
# Push to main/master branch — Vercel auto-deploys
git push origin master

# Then in Vercel Dashboard:
# Project → Settings → Environment Variables → Add:
# OPENAI_API_KEY = sk-...your-key...
```

---

## Common Issues

| Issue | Solution |
|---|---|
| OpenAI 401 error | Check `OPENAI_API_KEY` in `.env.local` — no extra quotes |
| PDF download opens in tab instead of saving | Browser-specific; right-click → Save As as workaround |
| Camera not opening on mobile | Ensure page is served over HTTPS (required for `capture` attribute) |
| Urdu text renders as boxes | Device doesn't have Urdu font — install Noto Naskh Arabic system font |
| `localStorage is not defined` during SSR | Ensure `storage.ts` functions are only called inside `useEffect` or event handlers |
| GSAP animations not running | Ensure component has `'use client'` directive |
