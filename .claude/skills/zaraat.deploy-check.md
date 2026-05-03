---
description: Pre-deployment readiness checklist for Zaraat AI on Vercel — validates all 8 Success Criteria from the constitution, runs a production build, checks mobile viewport, verifies no secrets in git history, confirms CSP headers, and produces a GO / NO-GO verdict before pushing.
---

## User Input

```text
$ARGUMENTS
```

No arguments required. Pass `--strict` to fail on MEDIUM issues (default: fail only on CRITICAL and HIGH).

## Outline

This skill validates against all 8 Success Criteria (SC-001 through SC-008) defined in the Zaraat AI constitution.

### Gate 1 — Git secrets scan (SC-005)

#### 1a — Current files

```bash
grep -rn "NEXT_PUBLIC_OPENAI\|sk-[a-zA-Z0-9]\|OPENAI_API_KEY\s*=" . \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git
```

**Expected**: zero matches (`.env.local` is excluded by `.next` not being in scope, but check `.env.local` is not tracked).

#### 1b — Git history scan

```bash
git log --all --full-history --source -- "*.env*" | head -20
git grep "NEXT_PUBLIC_OPENAI" $(git rev-list --all) 2>/dev/null | head -5
```

**Expected**: no OPENAI keys in git history.

**Severity**: CRITICAL. If found, abort deployment and advise key rotation.

### Gate 2 — Production build (SC-001, SC-007)

```bash
npm run build 2>&1
```

**Expected**: exits with code 0, no TypeScript errors, no missing module errors.

Capture and display any warnings or errors. A warning about image domains is acceptable; TypeScript errors are BLOCKING.

### Gate 3 — ENV variable documentation (SC-005)

Verify both files exist:
- `.env.example` — tracked in git, documents `OPENAI_API_KEY`
- `.env.local` — NOT tracked in git (check with `git ls-files .env.local`)

Verify `.gitignore` contains `.env.local` or `.env*.local`.

### Gate 4 — Mobile viewport check (SC-006)

Read `app/layout.tsx`. Verify:
- `<meta name="viewport" content="width=device-width, initial-scale=1" />` is present
- No hardcoded pixel widths in the root layout that would break 375 px viewport

Read `tailwind.config.ts`. Verify:
- Mobile-first breakpoints (no `max-width` media queries as primary breakpoints)

Read all component files. Check for any `min-w-[44px]` or `min-h-[44px]` on interactive elements.

**Sample check**: Count components with interactive elements (buttons, inputs) — all MUST have touch-target classes.

### Gate 5 — Security headers (SC-005)

Read `next.config.ts`. Verify a `headers()` async function is exported containing `Content-Security-Policy`.

Verify CSP includes:
- `connect-src` allows `https://api.openai.com`
- `default-src 'self'`
- No `connect-src *` (wildcard)

### Gate 6 — i18n completeness (SC-003)

Run a quick scan for strings NOT going through `t()` in `components/` and `app/` (abbreviated version of `/zaraat.i18n-audit`):

```bash
grep -rn "placeholder=\"[A-Za-z؀-ۿ]" components/ app/ 2>/dev/null | grep -v "t(" | wc -l
```

Report the count. If > 0, list the files (non-blocking for deploy but flagged as MEDIUM).

### Gate 7 — GSAP animations present (SC-008)

```bash
grep -rn "gsap\." components/ app/ --include="*.tsx" | grep -v "node_modules" | wc -l
```

**Expected**: ≥ 3 matches (button hover, card entrance, result reveal — as per constitution).

If < 3, flag as MEDIUM.

### Gate 8 — Vercel configuration

Check for `vercel.json` in the root. If present, verify:
- No `env` block with API keys hardcoded
- `framework` set to `nextjs` or absent (auto-detected)

If `vercel.json` absent, that is fine (Vercel auto-detects Next.js).

Remind user to set `OPENAI_API_KEY` in Vercel Dashboard → Project Settings → Environment Variables.

### Final Verdict

```
Zaraat AI Pre-Deploy Checklist — YYYY-MM-DD
==========================================
Gate 1  Git secrets scan:           ✅ CLEAR / 🔴 CRITICAL
Gate 2  Production build:           ✅ PASS  / 🔴 CRITICAL (errors listed below)
Gate 3  ENV documentation:          ✅ PASS  / 🟠 HIGH
Gate 4  Mobile viewport:            ✅ PASS  / 🟠 HIGH
Gate 5  Security headers (CSP):     ✅ PASS  / 🟡 MEDIUM
Gate 6  i18n completeness:          ✅ PASS  / 🟡 MEDIUM (N violations)
Gate 7  GSAP animations:            ✅ PASS  / 🟡 MEDIUM
Gate 8  Vercel config:              ✅ PASS  / ℹ INFO

VERDICT: 🟢 GO — Ready to deploy
      OR 🔴 NO-GO — N critical/high issues must be resolved

Deployment command (after resolving issues):
  git push origin master
  # Then: set OPENAI_API_KEY in Vercel Dashboard

Reminder: Never commit .env.local. Rotate OPENAI_API_KEY if it was ever exposed.
```
