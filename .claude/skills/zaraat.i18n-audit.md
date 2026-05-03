---
description: Scan every .tsx/.ts file for hardcoded Urdu or English strings that bypass lib/i18n.ts, list all violations, then interactively migrate them — adding correct keys to i18n.ts and replacing the literals with t() calls. Run this before any release or after adding new components.
---

## User Input

```text
$ARGUMENTS
```

Optional: `--fix` to automatically migrate violations without prompting, or `--report-only` to list violations only.

## Outline

### Step 1 — Read the i18n baseline

Read `lib/i18n.ts`. Extract every existing key from the `strings` object. These are the **known keys** — strings already internationalised.

If `lib/i18n.ts` does not exist yet, create the base structure (see `/zaraat.component` for the template) and continue with an empty known-key set.

### Step 2 — Scan for hardcoded strings

Scan all files matching `app/**/*.tsx`, `app/**/*.ts`, `components/**/*.tsx` (exclude `node_modules`, `__tests__`, `.next`).

For each file, detect:

**Pattern A — JSX text nodes with human-readable content:**
- Lines with JSX text content that looks like natural language (not class names, not variable names)
- Examples: `<p>Upload your photo</p>`, `<span>Fasal ki tasveer</span>`

**Pattern B — Hardcoded string props on HTML/JSX elements:**
- `placeholder="..."`, `aria-label="..."`, `title="..."`, `alt="..."` with literal strings
- `value="..."` on buttons/inputs with display text

**Pattern C — `toast()` or `alert()` calls with literal strings**

**Exclude** (not violations):
- Class names (`className="..."`)
- Route paths (`href="/result"`)
- Technical identifiers (`id="..."`, `name="..."`)
- Single characters or icons
- `// comments`
- Strings already using template literals referencing `t()`

### Step 3 — Build violation report

For each violation, record:
- File path + line number
- The hardcoded string
- Suggested i18n key (derive from the string content: snake_case, e.g. `upload_photo_prompt`)
- Suggested Urdu translation (use context from Zaraat AI's domain — farming, crops, disease treatment)

Format as a table:

```
File                          Line  String                        Suggested Key          Urdu Translation
components/UploadCard.tsx     23    "Upload your photo"           upload_photo_prompt    "اپنی فصل کی تصویر اپ لوڈ کریں"
components/UploadCard.tsx     45    "Take a photo"                take_photo_btn         "تصویر لیں"
app/page.tsx                  12    "Analyze"                     analyze_btn            "تجزیہ کریں"
```

Count totals:
- Total violations: N
- Files affected: N
- Already internationalised: N keys in i18n.ts

### Step 4 — Migrate (if --fix or user confirms)

If mode is `--report-only`, print the report and stop.

Otherwise:

1. Ask the user (or proceed automatically with `--fix`): "Found N hardcoded strings across M files. Migrate all? (yes/no)"

2. For each violation:
   a. Add the key to `lib/i18n.ts` with both `ur` and `en` values
   b. Replace the hardcoded string in the source file with `t('key', lang)` — ensure `lang` prop is available or imported from context

3. After all migrations, verify `lib/i18n.ts` is valid TypeScript:

```bash
npx tsc --noEmit lib/i18n.ts 2>&1 | head -20
```

### Step 5 — Post-migration scan

Re-run the scan from Step 2. The violation count MUST be zero. If any remain, list them and explain why they were not migrated.

### Step 6 — Report

```
Zaraat AI i18n Audit — $(date +%Y-%m-%d)
=========================================
Violations found:      N
Violations migrated:   N
Violations remaining:  N (with reason if > 0)
Keys added to i18n.ts: N (total keys now: N)
Files modified:        [list]

Languages covered: Urdu (ur) ✅  English (en) ✅

Next: run /zaraat.security-check or /zaraat.deploy-check
```
