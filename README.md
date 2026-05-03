# Zaraat AI — زرعت اے آئی

AI-powered crop disease detection for Pakistani farmers. Upload a photo of a diseased crop leaf and receive an instant diagnosis with treatment steps, spray schedule, and medicine recommendations — in Urdu or English.

## Prerequisites

- Node.js 18.17+ (LTS)
- npm 9+
- OpenAI API key with **GPT-4o** access

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd zaraat-ai
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local and add your real OpenAI key:
# OPENAI_API_KEY=sk-...your-key...

# 3. Run development server
npm run dev
# Open http://localhost:3000 in Chrome DevTools at 375px width
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | ✅ Yes | OpenAI API key — **server-side only**, never prefix with `NEXT_PUBLIC_` |

## Urdu PDF Font (optional)

For Urdu text in PDF exports, generate the font file once:

```bash
# 1. Download NotoNaskhArabic-Regular.ttf from:
#    https://fonts.google.com/noto/specimen/Noto+Naskh+Arabic
# 2. Place it in the project root
# 3. Run:
node scripts/font-to-base64.mjs
# 4. Commit the generated public/fonts/NotoNaskhArabic.b64.txt
```

Without this step, PDFs fall back to Helvetica (Latin text only).

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS |
| Animations | GSAP 3 |
| AI Vision | OpenAI GPT-4o |
| PDF Export | jsPDF 2 |
| Storage | localStorage (no database) |
| Deployment | Vercel |

## Validation

```bash
# Check no API key exposed client-side
npm run lint:env

# TypeScript check
npm run type-check

# Production build
npm run build
```

## Deployment (Vercel)

1. Push to GitHub
2. Import project at vercel.com
3. Add `OPENAI_API_KEY` in Vercel Dashboard → Project → Settings → Environment Variables
4. Deploy — that's it

## Spec & Architecture

See `specs/001-crop-disease-detection/` for full specification, implementation plan, data model, and API contract.
