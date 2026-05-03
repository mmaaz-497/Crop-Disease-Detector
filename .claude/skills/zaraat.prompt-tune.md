---
description: Iteratively engineer and test the GPT-4 Vision prompt in lib/openai.ts — runs the current prompt against a set of edge cases (non-leaf images, blurry photos, multiple crops), evaluates output quality against the Single-Diagnosis Contract, and proposes an improved prompt. Use this whenever diagnosis accuracy is poor or the contract is violated.
---

## User Input

```text
$ARGUMENTS
```

Optional: a description of the specific failure to focus on (e.g., "model is returning multiple diseases", "Urdu output has English mix", "non-leaf images not rejected").

## Outline

This skill enforces **Principle VI (Single-Diagnosis Contract)** from the Zaraat AI constitution.

### Step 1 — Read the current prompt

Read `lib/openai.ts`. Extract the current system prompt and user message template passed to `chat.completions.create`. Print the current prompt verbatim for review.

### Step 2 — Identify failure mode (from arguments or diagnosis)

If the user provided a failure description, focus the test suite on that failure.

Common failure modes to test:
- `multi-disease`: Model returns multiple diseases or "it could be X or Y"
- `confidence-leak`: Model includes probability/confidence scores
- `non-leaf`: Non-crop-leaf images are not rejected
- `lang-mix`: Urdu output contains English words
- `hallucination`: Model invents a disease for a blank/non-plant image
- `schema-break`: Response is not valid JSON matching DiagnosisResult

### Step 3 — Define test cases

Build a test matrix. For each case, describe the expected behaviour:

| Case | Input description | Expected outcome |
|---|---|---|
| TC-1 | Clear, single diseased wheat leaf | 200 + valid DiagnosisResult JSON |
| TC-2 | Non-plant image (e.g. a hand) | 400 + NOT_A_CROP_LEAF error |
| TC-3 | Blurry / very dark image | 400 + NOT_A_CROP_LEAF OR 422 + DIAGNOSIS_FAILED with retry message |
| TC-4 | Healthy leaf (no disease) | 422 + DIAGNOSIS_FAILED with message to re-check |
| TC-5 | Multiple crops in frame | Single disease for the most prominent plant |
| TC-6 | Request with language=ur | All response strings in Urdu only |
| TC-7 | Request with language=en | All response strings in English only |

### Step 4 — Evaluate current prompt against contract

The prompt MUST enforce all of these contract rules (check each):

- [ ] **Single disease only** — prompt says "return ONLY the single most likely disease"
- [ ] **No confidence scores** — prompt explicitly forbids including percentages or probabilities
- [ ] **Non-leaf rejection** — prompt instructs: if the image is not a crop leaf, return a specific JSON error signal
- [ ] **Structured JSON only** — prompt specifies the exact output schema with field names
- [ ] **Language instruction** — prompt includes the dynamic `{language}` variable and instructs the model to respond in that language for ALL text fields
- [ ] **Brand + generic medicines** — prompt requests both brand names (Pakistani brands: Engro, FFC, Syngenta) and generic chemical names
- [ ] **Spray schedule specificity** — prompt asks for exact spray frequency and timing (not vague "spray as needed")
- [ ] **Numbered treatment steps** — prompt explicitly asks for numbered steps, not bullets or paragraphs

### Step 5 — Generate improved prompt

Based on the evaluation gaps and the user's failure mode, produce an improved prompt. The prompt MUST:

1. Use a clear system role: "You are a certified Pakistani agricultural expert and plant pathologist."
2. Specify the exact JSON schema expected (TypeScript interface as inline comment)
3. Enforce single-disease rule explicitly in the system message
4. Include an explicit rejection instruction for non-leaf images using a sentinel JSON value
5. Pass language as a variable: `Respond in {language} for all text fields.`
6. Forbid confidence scores, probabilities, and multiple disease listings

Provide the new prompt in a fenced code block ready to copy into `lib/openai.ts`.

### Step 6 — Apply the improved prompt (with user confirmation)

Show the diff between old and new prompt. Ask: "Apply this improved prompt to lib/openai.ts? (yes/no)"

If yes, update `lib/openai.ts` with the new prompt.

### Step 7 — Retest

Run `/zaraat.diagnose-test` automatically after applying the new prompt. Compare results.

### Step 8 — Report

```
Zaraat AI Prompt Tune Report
============================
Failure mode targeted:     [mode]
Contract rules failing:    [list]
Contract rules passing:    [list]

Prompt changes:
  - [Change 1]
  - [Change 2]

Test results after update:
  TC-1 (happy path):         ✅ PASS / ❌ FAIL
  TC-2 (non-plant):          ✅ PASS / ❌ FAIL
  TC-3 (blurry):             ✅ PASS / ❌ FAIL
  TC-4 (healthy leaf):       ✅ PASS / ❌ FAIL
  TC-6 (Urdu output):        ✅ PASS / ❌ FAIL
  TC-7 (English output):     ✅ PASS / ❌ FAIL

Recommendation: [ship / iterate further / revert]
```

📋 Architectural decision detected: GPT-4 Vision prompt strategy significantly impacts Single-Diagnosis Contract compliance and bilingual output quality. Document? Run `/sp.adr gpt4-vision-prompt-strategy`
