---
description: Full security audit for Zaraat AI — checks for exposed API keys, client-side OpenAI imports, dangerouslySetInnerHTML with AI output, missing CSP headers, unvalidated file uploads, and any NEXT_PUBLIC_ leaks. Prints a pass/fail report with line-level findings and exact fixes.
---

## User Input

```text
$ARGUMENTS
```

No arguments required. Pass `--fix` to automatically apply safe, non-destructive fixes.

## Outline

This skill enforces **Principle III (Server-Side AI Gate)** and **Principle IV (Privacy by Design)** from the Zaraat AI constitution.

### Check 1 — NEXT_PUBLIC_OPENAI leak

Scan all `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.env*` files (exclude `node_modules`, `.next`, `.git`):

```bash
grep -rn "NEXT_PUBLIC_OPENAI" . \
  --include="*.ts" --include="*.tsx" \
  --include="*.js" --include="*.jsx" \
  --include="*.json" --include=".env*" \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git
```

**Expected**: zero matches.
**Severity if found**: CRITICAL — immediately exposes the API key in the browser bundle.
**Fix**: Replace `NEXT_PUBLIC_OPENAI_API_KEY` with `OPENAI_API_KEY` and move usage to a server-only file.

### Check 2 — Client-side OpenAI SDK import

Scan all files NOT in `app/api/`:

```bash
grep -rn "from 'openai'" . \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir="app/api"
grep -rn "require('openai')" . \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir="app/api"
```

**Expected**: zero matches outside `app/api/` and `lib/openai.ts`.
**Severity if found**: CRITICAL — bundles OpenAI SDK client-side.

### Check 3 — Hardcoded API key patterns

```bash
grep -rn "sk-[a-zA-Z0-9]" . \
  --include="*.ts" --include="*.tsx" --include="*.js" \
  --exclude-dir=node_modules --exclude-dir=.next
```

**Expected**: zero matches.
**Severity if found**: CRITICAL — hardcoded secret in source code.

### Check 4 — dangerouslySetInnerHTML with AI output

Scan for `dangerouslySetInnerHTML`:

```bash
grep -rn "dangerouslySetInnerHTML" . \
  --include="*.tsx" --include="*.ts" \
  --exclude-dir=node_modules --exclude-dir=.next
```

For each match, read the surrounding 10 lines. Flag as HIGH RISK if the value comes from:
- An API response
- `localStorage`
- Any variable containing `disease`, `result`, `diagnosis`, `response`

**Expected**: zero such patterns.
**Fix**: Replace with safe React text rendering: `<p>{aiText}</p>` — React escapes HTML automatically.

### Check 5 — .env.local in git tracking

```bash
git ls-files .env.local .env
```

**Expected**: zero output (neither file should be tracked).
**Severity if found**: CRITICAL — secrets committed to history.
**Fix** (with --fix): `git rm --cached .env.local .env` and confirm `.gitignore` covers `*.env.local`, `.env`.

### Check 6 — Content Security Policy header

Read `next.config.ts` (or `next.config.js`). Check for a `headers()` export containing a `Content-Security-Policy` entry.

**Expected**: CSP header present with at minimum:
```
default-src 'self';
script-src 'self' 'unsafe-inline';   ← required for Next.js
connect-src 'self' https://api.openai.com;
img-src 'self' data: blob:;
```

**Severity if missing**: MEDIUM.
**Fix (with --fix)**: Add the headers block to `next.config.ts`.

### Check 7 — File upload validation in API route

Read `app/api/diagnose/route.ts`. Verify:

- [ ] MIME type checked against allowed list (`image/jpeg`, `image/png`, `image/webp`)
- [ ] File size checked ≤ 10 MB (10 × 1024 × 1024 bytes)
- [ ] Both checks happen BEFORE calling the OpenAI API

**Severity if missing**: HIGH — unvalidated uploads can abuse the API quota or trigger unexpected model behaviour.

### Check 8 — Server-only enforcement on lib/openai.ts

Read `lib/openai.ts`. Verify it contains `import 'server-only'` at the top (Next.js 14 server-only package) OR is only imported from files within `app/api/`.

**Severity if missing**: MEDIUM.
**Fix (with --fix)**: Add `import 'server-only';` as the first line of `lib/openai.ts`.

### Final Report

```
Zaraat AI Security Audit — YYYY-MM-DD
======================================
Check 1  NEXT_PUBLIC_OPENAI leak:         ✅ PASS / 🔴 CRITICAL [file:line]
Check 2  Client-side OpenAI import:       ✅ PASS / 🔴 CRITICAL [file:line]
Check 3  Hardcoded API key:               ✅ PASS / 🔴 CRITICAL [file:line]
Check 4  dangerouslySetInnerHTML + AI:    ✅ PASS / 🟠 HIGH     [file:line]
Check 5  .env.local in git:               ✅ PASS / 🔴 CRITICAL
Check 6  CSP header present:              ✅ PASS / 🟡 MEDIUM
Check 7  Upload validation in API route:  ✅ PASS / 🟠 HIGH
Check 8  server-only on lib/openai.ts:    ✅ PASS / 🟡 MEDIUM

Overall: ✅ SECURE / ❌ N issues found (N critical)

Critical issues MUST be fixed before any deployment.
Run with --fix to apply safe automatic fixes.
```

If critical issues are found, block and print exact remediation steps before proceeding.
