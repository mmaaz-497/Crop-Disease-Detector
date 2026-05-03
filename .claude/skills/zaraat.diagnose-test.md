---
description: End-to-end test of the /api/diagnose route — sends a real or synthetic payload, validates the response JSON matches the DiagnosisResult contract from types/diagnosis.ts, checks error paths (invalid image, non-leaf, oversized), and prints a pass/fail report. Run this after any change to app/api/diagnose/route.ts or lib/openai.ts.
---

## User Input

```text
$ARGUMENTS
```

Optional argument: path to a local test image file (JPEG/PNG). If omitted, a synthetic base64 test payload is used.

## Outline

### Step 1 — Read the contract

Read `types/diagnosis.ts` to extract the exact `DiagnosisResult` interface. If it does not exist yet, create it:

```typescript
export type SeverityLevel = 'Mild' | 'Moderate' | 'Severe';

export interface Medicines {
  brandNames: string[];   // e.g. ["Tilt 250 EC (Syngenta)"]
  genericNames: string[]; // e.g. ["Propiconazole 25% EC"]
}

export interface DiagnosisResult {
  disease: string;
  severity: SeverityLevel;
  treatmentSteps: string[];   // numbered, ≥ 1 item
  spraySchedule: string;
  medicines: Medicines;
}

export interface DiagnosisError {
  error: {
    code: 'INVALID_IMAGE' | 'NOT_A_CROP_LEAF' | 'DIAGNOSIS_FAILED' | 'UPSTREAM_ERROR';
    message: string;
  };
}
```

### Step 2 — Read the API route

Read `app/api/diagnose/route.ts`. Identify:
- Whether it uses `OPENAI_API_KEY` (not `NEXT_PUBLIC_OPENAI_API_KEY`) ✅ or ❌
- Whether it validates MIME type and file size ✅ or ❌
- Whether it parses the model response into `DiagnosisResult` schema ✅ or ❌
- Whether it returns one of the defined error codes on failure ✅ or ❌

Report any gaps found.

### Step 3 — Start the dev server (if not running)

Check if port 3000 is listening:

```bash
# Windows
netstat -an | findstr :3000
# Unix
lsof -i :3000 2>/dev/null | head -1
```

If not running, start in background:

```bash
npm run dev &
sleep 5   # allow Next.js to compile
```

### Step 4 — Run test suite

Execute each test case and record PASS/FAIL:

#### Test A — Happy path (valid crop image)

```bash
curl -s -X POST http://localhost:3000/api/diagnose \
  -F "image=@<TEST_IMAGE_OR_SYNTHETIC>" \
  -F "context=3 din se yeh ho raha hai" \
  -F "language=ur"
```

**Expected**: HTTP 200, JSON with all 5 fields (`disease`, `severity`, `treatmentSteps`, `spraySchedule`, `medicines`), `medicines.brandNames.length >= 1`, `medicines.genericNames.length >= 1`, `treatmentSteps.length >= 1`.

Validate response against `DiagnosisResult` interface — report any missing or wrong-typed fields.

#### Test B — Missing image field

```bash
curl -s -X POST http://localhost:3000/api/diagnose \
  -F "context=test"
```

**Expected**: HTTP 400, `{ "error": { "code": "INVALID_IMAGE", "message": "..." } }`

#### Test C — Oversized file (if test image > 10 MB exists, else skip)

**Expected**: HTTP 400, `INVALID_IMAGE`

#### Test D — Language toggle (English)

Same as Test A but with `-F "language=en"`. Verify response strings appear to be English (basic check: no Urdu characters in `disease` field).

#### Test E — API key security check

Scan all `.ts` and `.tsx` files in the project for `NEXT_PUBLIC_OPENAI`:

```bash
grep -r "NEXT_PUBLIC_OPENAI" . --include="*.ts" --include="*.tsx" --exclude-dir=node_modules
```

**Expected**: zero matches.

### Step 5 — Report

```
/api/diagnose Test Report — Zaraat AI
=====================================
Test A (happy path):         ✅ PASS / ❌ FAIL — [details]
Test B (missing image):      ✅ PASS / ❌ FAIL — [details]
Test C (oversized):          ✅ PASS / ⏭ SKIP — [details]
Test D (English language):   ✅ PASS / ❌ FAIL — [details]
Test E (API key security):   ✅ PASS / ❌ FAIL — [details]

Contract compliance:
  - DiagnosisResult shape:   ✅ valid / ❌ [missing fields]
  - Error response shape:    ✅ valid / ❌ [issues]

Issues requiring action:
  1. [Issue 1 if any]
  2. [Issue 2 if any]

Next: run /zaraat.security-check for full API key audit.
```

If any test fails, print the raw response and suggest the exact fix in `app/api/diagnose/route.ts`.
