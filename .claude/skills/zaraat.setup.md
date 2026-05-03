---
description: Bootstrap the complete Zaraat AI Next.js 14 project from scratch — installs all dependencies, scaffolds the exact folder structure from the constitution, creates .env.local template, configures Tailwind with the Zaraat AI design system, and verifies the dev server starts clean.
---

## User Input

```text
$ARGUMENTS
```

## Outline

You are setting up the Zaraat AI (Crop Disease Identifier) project. Follow the constitution at `.specify/memory/constitution.md` exactly.

### Step 1 — Verify working directory

Check that the current directory is the repo root (contains `CLAUDE.md`). If not, abort with a clear message.

### Step 2 — Scaffold Next.js 14 App Router project

If `package.json` does not yet exist, initialise the project:

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=no \
  --import-alias="@/*" \
  --no-git
```

If `package.json` already exists, skip this step and report "Existing project detected — skipping init."

### Step 3 — Install Zaraat AI dependencies

Run in one shot:

```bash
npm install gsap jspdf @types/jspdf
npm install --save-dev @types/node
```

Verify these exact packages are in `package.json` dependencies after install.

### Step 4 — Create the canonical folder structure

Create every directory and file listed below (skip if it already exists):

```
app/
  layout.tsx          ← root layout stub
  page.tsx            ← dashboard / upload screen stub
  result/
    page.tsx          ← result screen stub
  faq/
    page.tsx          ← FAQ screen stub
  api/
    diagnose/
      route.ts        ← POST handler stub (server-only, no client exposure)
components/
  UploadCard.tsx
  ResultCard.tsx
  SeverityBadge.tsx
  LanguageToggle.tsx
  PDFExportButton.tsx
lib/
  openai.ts           ← server-only OpenAI client (no NEXT_PUBLIC_ prefix)
  pdf.ts              ← jsPDF helpers
  storage.ts          ← localStorage read/write helpers
  i18n.ts             ← Urdu/English string maps
types/
  diagnosis.ts        ← DiagnosisResult, SeverityLevel types
public/
  fonts/              ← placeholder for Urdu font files
```

Each stub file MUST have:
- A `// TODO: implement` comment
- Correct TypeScript module structure (export default or named export)
- No client-side OpenAI imports in any file outside `app/api/`

### Step 5 — Configure Tailwind with Zaraat AI design tokens

Overwrite / merge `tailwind.config.ts` to include:

```typescript
theme: {
  extend: {
    colors: {
      primary: '#1B4332',
      accent:  '#74C69D',
      base:    '#F0FFF4',
    },
    fontFamily: {
      urdu: ['Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', 'serif'],
    },
  },
}
```

### Step 6 — Create .env.local template

Create `.env.example` (safe to commit) with:

```
# Zaraat AI environment variables
# Copy this file to .env.local and fill in real values — never commit .env.local

OPENAI_API_KEY=sk-...your-key-here...
```

Create `.env.local` if it does not exist, with the same content as a placeholder.

Verify `.gitignore` includes `.env.local` and `.env*.local`.

### Step 7 — Add NEXT_PUBLIC safety lint

Add this script to `package.json` scripts:

```json
"lint:env": "! grep -r 'NEXT_PUBLIC_OPENAI' . --include='*.ts' --include='*.tsx' --exclude-dir=node_modules && echo 'ENV audit passed'"
```

### Step 8 — Verify dev server starts

Run `npm run build` (or `npm run dev` for 5 seconds then kill) and confirm no TypeScript errors.

### Step 9 — Report

Print a summary table:

```
✅ Next.js 14 App Router initialised
✅ Dependencies installed (gsap, jspdf)
✅ Folder structure created (N files/dirs)
✅ Tailwind design tokens configured (#1B4332, #74C69D, #F0FFF4)
✅ .env.example created (OPENAI_API_KEY documented)
✅ .env.local present and in .gitignore
✅ ENV audit script added
✅ Build check: PASS / ⚠️ WARNINGS (list them)
```

**Next step**: Run `/zaraat.component UploadCard` or `/zaraat.diagnose-test` to continue.
