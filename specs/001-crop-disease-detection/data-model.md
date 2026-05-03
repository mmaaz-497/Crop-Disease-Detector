# Data Model: Zaraat AI — Crop Disease Detection

**Branch**: `001-crop-disease-detection` | **Date**: 2026-05-02

---

## Entities

### ScanRecord

The primary stored entity — one record per completed diagnosis.

```typescript
interface ScanRecord {
  id: string;              // nanoid(8), e.g. "x3kP9qRm"
  date: string;            // ISO 8601, e.g. "2026-05-02T14:30:00.000Z"
  lang: 'ur' | 'en';       // language at time of scan
  disease: string;         // full disease name from AI
  severity: SeverityLevel; // "Mild" | "Moderate" | "Severe"
  treatmentSteps: string[]; // numbered strings, ≥ 1 item
  spraySchedule: string;   // frequency + duration
  medicines: MedicineSet;
  imageThumb?: string;     // base64 JPEG thumbnail ≤ 5 KB (optional)
}
```

**Constraints**:
- `id`: 8 ASCII chars, URL-safe
- `date`: Valid ISO 8601 timestamp
- `severity`: MUST be exactly one of `"Mild"`, `"Moderate"`, `"Severe"` — no other values accepted
- `treatmentSteps`: Array length ≥ 1; each string starts with a digit (numbered step)
- `medicines.brandNames`: Array length ≥ 1 (AI may return "generic only" as a fallback)
- `medicines.genericNames`: Array length ≥ 1 (always required)
- `imageThumb`: Base64-encoded JPEG, ≤ 5 KB when stored; omitted if storage is constrained

**Storage**: localStorage key `"zaraat_scans"`, serialised as JSON array.
**Capacity**: Maximum 10 records; oldest pruned on overflow (FIFO).

---

### DiagnosisResult

The shape returned by the API route and used as the in-memory result on the Result screen. A subset of `ScanRecord` (no `id`, `date`, `lang`, or `imageThumb`).

```typescript
interface DiagnosisResult {
  disease: string;
  severity: SeverityLevel;
  treatmentSteps: string[];
  spraySchedule: string;
  medicines: MedicineSet;
}
```

**Relationship**: When a `DiagnosisResult` is received from the API, it is enriched with `id`, `date`, `lang`, and optional `imageThumb` to form a `ScanRecord`, which is then stored.

---

### MedicineSet

```typescript
interface MedicineSet {
  brandNames: string[];    // e.g. ["Tilt 250 EC (Syngenta)"]
  genericNames: string[];  // e.g. ["Propiconazole 25% EC"]
}
```

**Constraints**:
- `brandNames`: ≥ 1 item; may contain "Generic treatment recommended" if no Pakistani brand available
- `genericNames`: ≥ 1 item; always present

---

### SeverityLevel

```typescript
type SeverityLevel = 'Mild' | 'Moderate' | 'Severe';
```

**UI mapping**:
| Value | Colour | Tailwind class |
|---|---|---|
| `Mild` | `#74C69D` (accent green) | `bg-accent text-white` |
| `Moderate` | `#F59E0B` (amber) | `bg-amber-500 text-white` |
| `Severe` | `#EF4444` (red) | `bg-red-500 text-white` |

---

### Language

```typescript
type Language = 'ur' | 'en';
```

**Default**: `'ur'`
**Stored at**: localStorage key `"zaraat_lang"`
**State**: React Context (`LanguageContext`), hydrated from localStorage on app init

---

### DiagnosisError (API error response)

```typescript
interface DiagnosisError {
  error: {
    code: ErrorCode;
    message: string;     // in the current language
    messageEn: string;   // always English (for debugging / fallback)
  };
}

type ErrorCode =
  | 'INVALID_IMAGE'    // 400 — bad file type or size
  | 'NOT_A_CROP_LEAF'  // 400 — non-plant image
  | 'DIAGNOSIS_FAILED' // 422 — can't identify disease
  | 'UPSTREAM_ERROR'   // 500 — OpenAI unavailable
  | 'TIMEOUT'          // 408 — 30s exceeded
  | 'RATE_LIMITED';    // 429 — too many requests from this IP
```

---

## State Transitions

### Upload Flow State Machine

```
IDLE
  ↓ (user selects image, passes client validation)
IMAGE_SELECTED
  ↓ (user taps Analyze)
LOADING
  ↓ (API returns 200)        ↓ (API returns error)
RESULT_READY            ERROR_STATE
  ↓ (user taps Scan Again)    ↓ (user taps Retry)
IDLE                    IDLE
```

**State held in**: `app/page.tsx` via `useState`

---

## localStorage Layout

```
zaraat-ai/
├── zaraat_scans     → JSON: ScanRecord[]   (max 10, FIFO)
└── zaraat_lang      → "ur" | "en"
```

**Total max storage**: ~25 KB (10 scans × ~2 KB each) — well within 5 MB localStorage limit.

---

## Type File Location

All types are defined in `types/diagnosis.ts` and imported wherever needed.

```typescript
// types/diagnosis.ts
export type Language = 'ur' | 'en';
export type SeverityLevel = 'Mild' | 'Moderate' | 'Severe';
export type ErrorCode = 'INVALID_IMAGE' | 'NOT_A_CROP_LEAF' | 'DIAGNOSIS_FAILED' | 'UPSTREAM_ERROR' | 'TIMEOUT' | 'RATE_LIMITED';

export interface MedicineSet {
  brandNames: string[];
  genericNames: string[];
}

export interface DiagnosisResult {
  disease: string;
  severity: SeverityLevel;
  treatmentSteps: string[];
  spraySchedule: string;
  medicines: MedicineSet;
}

export interface ScanRecord extends DiagnosisResult {
  id: string;
  date: string;
  lang: Language;
  imageThumb?: string;
}

export interface DiagnosisError {
  error: {
    code: ErrorCode;
    message: string;
    messageEn: string;
  };
}
```
