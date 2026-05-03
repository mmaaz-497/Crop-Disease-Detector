<!--
SYNC IMPACT REPORT
==================
Version change: [TEMPLATE] → 1.0.0
Modified principles: (all new — initial ratification)
Added sections:
  - Project Vision & Goals
  - Core Principles (I–VIII)
  - Tech Stack Decisions & Rationale
  - Architecture Overview
  - Folder Structure
  - API Design (Routes)
  - Data Flow
  - Non-Functional Requirements (NFRs)
  - Out of Scope
  - Success Criteria
  - Governance
Removed sections: (none — first fill)
Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check gates align
  ✅ .specify/templates/spec-template.md — scope/constraints align
  ✅ .specify/templates/tasks-template.md — task categories align
Deferred TODOs: none
-->

# Zaraat AI Constitution
<!-- AI-powered crop disease detection for Pakistani farmers -->

## Project Vision & Goals

**Vision**: Give every Pakistani farmer instant, actionable guidance on crop diseases —
in their own language, on the phone in their pocket, without needing an account or
internet-connected expert.

**Goals**:

- Reduce crop loss by surfacing the correct disease name, severity, and treatment steps
  within seconds of uploading a photo.
- Eliminate friction: no login, no complex UI, one tap to get results.
- Support both Urdu and English so farmers across all literacy levels are served.
- Keep the system trustworthy by never fabricating diagnoses — one disease, one result,
  no probability theatrics.

## Core Principles

### I. Simplicity-First UX (NON-NEGOTIABLE)

The UI MUST be operable by a low-tech-literacy farmer on a mid-range Android phone.
Every screen MUST reduce cognitive load to the minimum required action:

- No more than two primary CTAs visible at any time.
- Labels MUST be plain language (Urdu default, English toggle).
- Error messages MUST describe what the user should do, not what the system failed at.
- GSAP micro-animations are permitted only as visual feedback aids — never decorative delays.

**Rationale**: The target user base has limited smartphone experience. Complexity
directly translates to missed diagnoses and abandoned sessions.

### II. Mobile-First Responsive Design (NON-NEGOTIABLE)

All layout decisions MUST be made for a 375 px viewport first; desktop is a secondary
concern.

- Touch targets MUST be ≥ 44 px × 44 px.
- Camera-capture upload MUST be the default input path; gallery upload is secondary.
- No hover-only interactions; all interactive states MUST be accessible via tap.

**Rationale**: Pakistani farmers primarily use smartphones, not desktops.

### III. Server-Side AI Gate (NON-NEGOTIABLE)

All OpenAI GPT-4 Vision API calls MUST be made exclusively from Next.js API routes
(`/api/*`). The `OPENAI_API_KEY` MUST never be referenced in any client-side module,
environment exposure, or bundled output.

- API routes MUST validate and sanitize incoming image payloads before forwarding.
- Response parsing MUST happen server-side; only structured JSON reaches the client.
- If the API route errors, the client receives a safe, user-friendly error payload —
  never a raw OpenAI error or stack trace.

**Rationale**: Exposing the API key client-side would immediately compromise the key
and incur unbounded costs. Server-side isolation is the only acceptable posture.

### IV. Privacy by Design (NON-NEGOTIABLE)

Zaraat AI MUST operate without any user identity or persistent server-side data.

- No authentication, no user accounts, no session tokens stored server-side.
- No third-party analytics, telemetry, or tracking scripts.
- No database — `localStorage` is the sole persistence layer for in-session state.
- Uploaded images MUST NOT be stored or logged server-side beyond the API call lifetime.

**Rationale**: Users are anonymous farmers. Collecting data they did not consent to
is ethically unacceptable and creates unnecessary compliance obligations.

### V. Bilingual Accessibility (SHOULD)

Every user-facing string MUST have both an Urdu and an English variant.

- Language preference MUST be stored in `localStorage` and respected across page loads.
- Urdu text MUST render in a readable Nastaliq or Naskh font; fallback to system Urdu.
- RTL layout adjustments MUST apply when Urdu is active.
- AI diagnosis prompts MUST request output in the selected language.

**Rationale**: Urdu is the lingua franca of Pakistani agriculture. English-only locks
out the majority of the target audience.

### VI. Single-Diagnosis Contract (NON-NEGOTIABLE)

Each photo submission MUST yield exactly one disease result — the top diagnosis only.
The system MUST NOT:

- Display multiple diseases, confidence percentages, or probability rankings.
- Show "no disease found" as a success state without actionable next steps.
- Hallucinate diseases when the image is not a crop leaf.

The AI prompt MUST be engineered to enforce this contract. If the image is unusable,
the response MUST instruct the user to retake the photo.

**Rationale**: Multiple results confuse low-literacy users. A single, decisive answer
with clear treatment steps is the product's core value proposition.

### VII. Local-First Persistence

Session data and scan history MUST be stored using `localStorage` only. No server-side
database is permitted.

- Each completed scan MUST be serialisable as a plain JSON object and storable locally.
- The only export mechanism for history is PDF download (jsPDF or react-pdf).
- `localStorage` quota errors MUST be handled gracefully — oldest scans pruned first.

**Rationale**: Eliminating a database removes operational overhead, hosting costs,
and data-retention obligations for a hackathon-scope product.

### VIII. Smallest Viable Change

Every implementation decision MUST default to the simplest option that satisfies
the acceptance criteria.

- No premature abstractions; three similar lines beat a speculative helper.
- No features added speculatively; implement only what is in this constitution or an
  approved spec.
- Refactoring MUST be a separate, justified commit — never bundled with feature work.

**Rationale**: YAGNI keeps the codebase small and the hackathon scope achievable.

## Tech Stack Decisions & Rationale

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR + API routes in one repo; Vercel deploy is trivial |
| Styling | Tailwind CSS | Utility-first keeps component files small; no CSS drift |
| Animations | GSAP | Fine-grained control over entrance/exit timings; small bundle with tree-shaking |
| AI | OpenAI GPT-4 Vision API | Best-in-class zero-shot image understanding; no custom model training needed |
| PDF | jsPDF (primary) / react-pdf (fallback) | jsPDF is client-side and needs no server round-trip for history export |
| Persistence | localStorage | No server, no DB, no ops cost |
| Deployment | Vercel | Zero-config Next.js hosting; free tier sufficient for hackathon load |
| Language | TypeScript | Type safety prevents category errors in AI response parsing |

## Architecture Overview

```
Browser (Client)
│
├── pages / app router (Next.js)
│   ├── / (Dashboard / Upload page)
│   ├── /result (Disease result page)
│   └── /faq (FAQ & how-to-use)
│
└── API Routes (server-side, Node.js)
    └── /api/diagnose
        ├── Accepts: multipart/form-data (image + optional text)
        ├── Calls: OpenAI GPT-4 Vision API (server-side only)
        └── Returns: structured JSON diagnosis

External
└── OpenAI GPT-4 Vision API (HTTPS, server-to-server only)
```

**Key architectural decisions**:

- **No BFF layer** — Next.js API routes ARE the backend; no separate Express/FastAPI.
- **No state management library** — React `useState`/`useContext` + `localStorage` is
  sufficient for this scope.
- **No CDN for images** — uploaded images are base64-encoded and sent directly to the
  API route; they are never stored.

## Folder Structure

```
zaraat-ai/                         ← repository root
├── app/                          ← Next.js 14 App Router
│   ├── layout.tsx                ← root layout, font, language provider
│   ├── page.tsx                  ← dashboard / upload screen
│   ├── result/
│   │   └── page.tsx              ← disease result screen
│   ├── faq/
│   │   └── page.tsx              ← FAQ & how-to-use
│   └── api/
│       └── diagnose/
│           └── route.ts          ← POST handler → GPT-4 Vision call
│
├── components/                   ← shared UI components
│   ├── UploadCard.tsx
│   ├── ResultCard.tsx
│   ├── SeverityBadge.tsx
│   ├── LanguageToggle.tsx
│   └── PDFExportButton.tsx
│
├── lib/
│   ├── openai.ts                 ← server-only OpenAI client wrapper
│   ├── pdf.ts                    ← jsPDF helpers
│   ├── storage.ts                ← localStorage read/write helpers
│   └── i18n.ts                   ← Urdu/English string maps
│
├── types/
│   └── diagnosis.ts              ← DiagnosisResult, SeverityLevel, etc.
│
├── public/
│   └── fonts/                    ← Urdu font files
│
├── specs/                        ← SpecKit feature specs
├── history/                      ← PHRs & ADRs
├── .specify/                     ← SpecKit templates & scripts
├── .env.local                    ← OPENAI_API_KEY (never committed)
├── .env.example                  ← documented env vars (safe to commit)
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

## API Design (Routes)

### POST `/api/diagnose`

**Purpose**: Accept a crop photo (+ optional text context) and return a structured
disease diagnosis.

**Request** (`multipart/form-data`):

| Field | Type | Required | Description |
|---|---|---|---|
| `image` | File (JPEG/PNG/WebP, ≤ 10 MB) | Yes | Crop leaf photo |
| `context` | string (≤ 500 chars) | No | Farmer's description (e.g. "3 din se ho raha hai") |
| `language` | `"en"` \| `"ur"` | No (default `"ur"`) | Response language |

**Success Response** (`200 OK`, `application/json`):

```json
{
  "disease": "Wheat Rust (Puccinia striiformis)",
  "severity": "Moderate",
  "treatmentSteps": [
    "1. Remove and burn all visibly infected leaves immediately.",
    "2. Apply fungicide within 48 hours of detection.",
    "3. Re-inspect crop every 3 days for 2 weeks."
  ],
  "spraySchedule": "Spray once every 7 days for 3 weeks.",
  "medicines": {
    "brandNames": ["Tilt 250 EC (Syngenta)", "Score 250 EC (Syngenta)"],
    "genericNames": ["Propiconazole 25% EC", "Difenoconazole 25% EC"]
  }
}
```

**Error Responses**:

| Status | Code | When |
|---|---|---|
| `400` | `INVALID_IMAGE` | No image field, wrong MIME type, or > 10 MB |
| `400` | `NOT_A_CROP_LEAF` | GPT-4 Vision determines image is not a crop leaf |
| `422` | `DIAGNOSIS_FAILED` | GPT-4 could not identify a disease confidently |
| `500` | `UPSTREAM_ERROR` | OpenAI API returned a non-200 response |

All error responses follow:

```json
{ "error": { "code": "INVALID_IMAGE", "message": "Fasal ki tasveer upload karein." } }
```

## Data Flow

```
1. User selects/captures photo on device
       ↓
2. Browser: FileReader → base64 preview shown instantly (GSAP entrance)
       ↓
3. User taps "Analyze" → FormData posted to /api/diagnose
       ↓
4. API Route (server):
   a. Validates MIME type & file size
   b. Constructs GPT-4 Vision prompt with image + context + language
   c. Calls OpenAI chat.completions.create (server-to-server)
   d. Parses JSON from model response
   e. Validates against DiagnosisResult schema
   f. Returns structured JSON to client
       ↓
5. Client receives JSON → stores scan in localStorage
       ↓
6. Router navigates to /result → ResultCard renders with GSAP reveal
       ↓
7. User may: copy text | download PDF | go back to dashboard
       ↓
8. PDF export: lib/pdf.ts serialises stored scan → jsPDF → download
```

## Non-Functional Requirements (NFRs)

### Performance

- API route end-to-end (including GPT-4 Vision call): p95 ≤ 8 s on a standard 4G
  connection (OpenAI latency dominates; client-side work MUST stay under 200 ms).
- First Contentful Paint (FCP): ≤ 1.5 s on mobile (Lighthouse score ≥ 85).
- PDF generation: ≤ 3 s for a single scan export.

### Reliability

- If the OpenAI API is unavailable, the UI MUST show a clear retry message — never
  a blank screen or unhandled exception.
- localStorage failures MUST be caught; the scan result MUST still be displayed even
  if saving fails.

### Security

- `OPENAI_API_KEY` MUST be server-side only (`OPENAI_API_KEY`, not
  `NEXT_PUBLIC_OPENAI_API_KEY`).
- Image payloads MUST be validated (MIME type + size) before reaching OpenAI.
- No `dangerouslySetInnerHTML` with untrusted AI output — all text rendered through
  React's safe text nodes.
- Content-Security-Policy header MUST be set via `next.config.ts` headers.

### Accessibility

- WCAG 2.1 AA compliance for all interactive elements.
- All images MUST have meaningful alt text.
- Color contrast ratio MUST be ≥ 4.5:1 for body text (#1B4332 on #F0FFF4 = ✅).

### Internationalisation

- `localStorage` key `zaraat_lang` stores `"ur"` | `"en"`.
- Default language: `"ur"`.
- All user-facing strings sourced from `lib/i18n.ts` — no hardcoded English strings
  in component JSX.

## Out of Scope

The following items are explicitly excluded from Zaraat AI v1 and MUST NOT be
implemented without a constitution amendment:

- User authentication or accounts of any kind.
- Server-side database or cloud storage for images or scans.
- Analytics, event tracking, or crash reporting (Sentry, GA, Mixpanel, etc.).
- Expert chat, WhatsApp integration, or contact forms.
- Multiple disease results or confidence/probability scores displayed to users.
- Dark mode or theming beyond the defined light palette.
- Native iOS/Android app (web only).
- Paid feature tiers or monetisation.
- Offline mode / Service Worker / PWA manifest beyond basic meta tags.
- Automated testing suite (out of scope for hackathon timeline).

## Success Criteria

| # | Criterion | Measure |
|---|---|---|
| SC-001 | Disease identified from valid crop photo | Upload → result displayed in ≤ 10 s on 4G |
| SC-002 | Result actionable | Treatment steps, spray schedule, and ≥ 2 medicine names always present |
| SC-003 | Language toggle works | Switching Urdu ↔ English re-renders all strings; preference persists on reload |
| SC-004 | PDF export functional | Downloaded PDF contains disease name, severity, steps, schedule, and medicines |
| SC-005 | API key never exposed | `NEXT_PUBLIC_` prefix is absent from all OpenAI-related env vars; verified by build lint |
| SC-006 | Mobile usability | All touch targets ≥ 44 px; no horizontal scroll on 375 px viewport |
| SC-007 | Non-crop image handled gracefully | Uploading a non-leaf image returns the `NOT_A_CROP_LEAF` error with a helpful message |
| SC-008 | GSAP animations present | Button hover, card entrance, and result reveal animations fire without jank |

## Governance

This constitution is the authoritative source for all Zaraat AI architectural and
product decisions. It supersedes any conflicting guidance in README files, inline
comments, or verbal agreements.

**Amendment procedure**:

1. Propose the change by opening a PR that modifies this file.
2. State the version bump type (MAJOR / MINOR / PATCH) and rationale in the PR
   description.
3. Update `LAST_AMENDED_DATE` and `CONSTITUTION_VERSION` in the footer.
4. Run the consistency propagation checklist (templates, README) before merging.
5. Merge requires acknowledgement from the project lead.

**Versioning policy** (semantic):

- **MAJOR**: Removal or redefinition of a NON-NEGOTIABLE principle; breaking API
  contract changes.
- **MINOR**: New principle, new section, or material expansion of existing guidance.
- **PATCH**: Wording clarifications, typo fixes, non-semantic refinements.

**Compliance review**:

- Every `/sp.plan` and `/sp.tasks` execution MUST include a Constitution Check gate
  verifying alignment with the principles above.
- Any deviation MUST be logged in the Complexity Tracking table of the plan and
  justified with a reason why a simpler alternative was insufficient.

**Runtime guidance**: See `.specify/memory/constitution.md` (this file) as the primary
reference. Agent-specific instructions live in `.specify/` command files.

---

**Version**: 1.0.0 | **Ratified**: 2026-05-02 | **Last Amended**: 2026-05-02
