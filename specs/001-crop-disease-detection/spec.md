# Feature Specification: Zaraat AI — Crop Disease Detection

**Feature Branch**: `001-crop-disease-detection`
**Created**: 2026-05-02
**Status**: Draft
**Input**: Full product spec — all screens, API, AI prompt, PDF export, localStorage, i18n, animations, breakpoints

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Photo Diagnosis (Priority: P1) 🎯 MVP

A farmer notices unusual spots or discoloration on their crop. They open Zaraat AI on their phone,
photograph the affected leaf (or choose one from their gallery), and within seconds receive the
disease name, how bad it is, and exactly what to do — in Urdu.

**Why this priority**: This is the entire reason Zaraat AI exists. Without it the product has zero value. Every other story depends on this working first.

**Independent Test**: A user can photograph a diseased wheat leaf, tap Analyze, and read a complete
diagnosis with disease name + severity + numbered treatment steps — without any login, account, or
technical knowledge.

**Acceptance Scenarios**:

1. **Given** a farmer is on the Home screen, **When** they tap "Tasveer Lo / Take Photo" and capture a diseased leaf, **Then** a loading animation plays and within 15 seconds a Result screen appears with disease name, severity badge (Mild/Moderate/Severe), numbered treatment steps, spray schedule, and at least two medicine recommendations.
2. **Given** a farmer has a photo in their gallery, **When** they tap "Gallery se Chunein / Choose from Gallery" and select the image, **Then** the same Result screen appears as in scenario 1.
3. **Given** a farmer uploads a non-plant image (e.g. a rock, their face), **When** the system analyses it, **Then** a friendly error message appears asking them to photograph a crop leaf, with a retry button.
4. **Given** the AI service is temporarily unavailable, **When** a farmer submits a photo, **Then** an error message appears explaining the service is unavailable and offering a retry — no blank screen, no crash.
5. **Given** a farmer uploads a photo larger than 10 MB, **When** they try to submit, **Then** the system immediately rejects it with a message asking them to take a clearer, smaller photo.

---

### User Story 2 — Result Reading & Actions (Priority: P1) 🎯 MVP

After receiving a diagnosis, the farmer needs to act on it. They read the treatment steps, note the
spray schedule, write down or share the medicine names, and either copy the result to share via
WhatsApp or download it as a PDF to show the local agrochemical shop owner.

**Why this priority**: A diagnosis with no actionable output is useless. Copy + PDF are zero-infrastructure exports — they work offline once the result is loaded.

**Independent Test**: After a successful diagnosis, a user can tap "Copy Text" and paste the full result into WhatsApp, OR tap "PDF Download" and receive a saved file containing all diagnosis fields.

**Acceptance Scenarios**:

1. **Given** a Result screen is showing a diagnosis, **When** the farmer taps "Copy Text", **Then** the full diagnosis (disease name, severity, all treatment steps, spray schedule, medicine names) is copied to the clipboard as plain readable text.
2. **Given** a Result screen is showing a diagnosis, **When** the farmer taps "PDF Download", **Then** a PDF file downloads to their device containing all diagnosis fields, branded with Zaraat AI colours, in the selected language.
3. **Given** a farmer taps "Dobara Scan Karein / Scan Again", **Then** they are returned to the Home screen with no previous data carried forward.
4. **Given** a Result screen is in Urdu, **When** the farmer copies the text, **Then** the copied content is in Urdu.

---

### User Story 3 — Language Toggle (Priority: P2)

A farmer prefers to read in English (perhaps a literate family member is helping them). They switch
the language toggle from Urdu to English — all labels, result text, error messages, and AI output
immediately switch to English. Switching back to Urdu reverses this.

**Why this priority**: Bilingual support expands the user base significantly without requiring separate apps. P2 because Urdu is the default and most farmers use it; English is a power-user feature.

**Independent Test**: With the toggle set to English, a complete diagnosis is performed — every string visible on screen (labels, buttons, AI output, error messages) is in English. Toggle back to Urdu — everything switches without page reload.

**Acceptance Scenarios**:

1. **Given** the language is set to Urdu (default), **When** the farmer taps the language toggle to English, **Then** all visible text on the current screen switches to English within one second — no reload required.
2. **Given** language is set to English, **When** the farmer closes and reopens the app, **Then** the language is still English (preference is remembered).
3. **Given** language is set to English, **When** a diagnosis is requested, **Then** the AI output (disease name, treatment steps, spray schedule, medicine names) is all in English.
4. **Given** language is Urdu and text is displayed right-to-left, **When** the user toggles to English, **Then** the layout switches to left-to-right.

---

### User Story 4 — FAQ & How-to-Use (Priority: P3)

A new user is confused about how to take a good photo or what the severity levels mean. They tap
the FAQ link from the Home screen and read simple illustrated explanations.

**Why this priority**: Reduces first-time confusion and support burden. Does not block the core diagnosis flow.

**Independent Test**: A user can navigate to the FAQ screen, read answers to the top 5 common questions, and navigate back to Home — all without any diagnosis being triggered.

**Acceptance Scenarios**:

1. **Given** the farmer is on the Home screen, **When** they tap the FAQ link, **Then** the FAQ screen opens showing at least 5 Q&A pairs about how to use Zaraat AI.
2. **Given** the FAQ screen is open, **When** the farmer taps the Back/Home button, **Then** they return to the Home screen.
3. **Given** the language is Urdu, **Then** all FAQ content is in Urdu.

---

### Edge Cases

- What happens when the farmer's photo is extremely blurry or taken in very low light? → System returns a DIAGNOSIS_FAILED state with a message asking them to retake in better lighting. Retry button shown.
- What happens if the farmer submits the form with no image selected? → Submit button is disabled until an image is selected; no network request is made.
- What happens if local storage quota is exceeded when saving a scan? → The scan result is still displayed and copy/PDF still works; a silent prune of the oldest stored scan is attempted; if still failing, a non-blocking warning is shown.
- What happens if the farmer loses connectivity mid-upload? → The request times out after 30 seconds; an error message with a retry button is shown.
- What if the diagnosed crop disease has no known Pakistani brand medicine? → The AI returns "generic treatment recommended" in the brand field; generic names are always present.
- What if the optional context text is very long (> 500 characters)? → The text input is limited to 500 characters with a visible counter; excess characters cannot be typed.

---

## Requirements *(mandatory)*

### Functional Requirements

**Home / Dashboard Screen**

- **FR-001**: The Home screen MUST display a prominent upload area as the primary action — it MUST be the first interactive element a user sees.
- **FR-002**: The Home screen MUST show a language toggle (Urdu / English) accessible from every screen without navigating away.
- **FR-003**: The Home screen MUST display a link to the FAQ screen.
- **FR-004**: The Home screen MUST show a list of previously completed scans stored locally (scan date + disease name), limited to the 10 most recent.
- **FR-005**: Each item in the recent scan list MUST have a "Download PDF" action to re-export that scan.

**Upload & Analysis Flow**

- **FR-006**: Users MUST be able to initiate a photo capture using the device camera directly from the upload area.
- **FR-007**: Users MUST be able to select an existing image from the device gallery.
- **FR-008**: Users MUST be able to type optional context text (max 500 characters) alongside the image before submitting.
- **FR-009**: The Submit / Analyze button MUST be disabled when no image is selected.
- **FR-010**: The system MUST reject images larger than 10 MB with an immediate, user-friendly message before making any network request.
- **FR-011**: The system MUST reject files that are not images (JPEG, PNG, WebP) with an immediate message.
- **FR-012**: While analysis is in progress, an animated loading screen MUST be shown — the user MUST NOT be able to submit again while a request is in flight.

**Result Screen**

- **FR-013**: The Result screen MUST display: disease name, severity level (Mild / Moderate / Severe), numbered treatment steps (at least 1), spray schedule, at least one brand-name medicine, at least one generic medicine name.
- **FR-014**: Severity MUST be indicated with both a text label AND a distinct colour: Mild = green (#74C69D), Moderate = amber, Severe = red.
- **FR-015**: The Result screen MUST provide a "Copy Text" button that copies all diagnosis fields as plain text to the device clipboard.
- **FR-016**: The Result screen MUST provide a "Download PDF" button that generates and downloads a PDF of the current diagnosis.
- **FR-017**: The Result screen MUST provide a "Scan Again / Dobara Scan" link that returns the user to the Home screen.
- **FR-018**: Each completed scan MUST be automatically saved to local device storage immediately when the Result screen loads.

**Error States**

- **FR-019**: When the submitted image is not a crop leaf, the system MUST show a specific message asking the user to photograph a crop leaf, with a retry button.
- **FR-020**: When the AI service cannot identify a disease (ambiguous/healthy image), the system MUST show a message advising the user to retake the photo in better conditions, with a retry button.
- **FR-021**: When the analysis service is unavailable, the system MUST show a service-unavailable message with a retry button — never a raw error or blank screen.

**FAQ Screen**

- **FR-022**: The FAQ screen MUST answer at least these 5 questions: (1) How to take a good photo, (2) What the severity levels mean, (3) Which crops are supported, (4) How to use the medicines list, (5) Why the result might say "try again".
- **FR-023**: FAQ content MUST be available in both Urdu and English.

**Language**

- **FR-024**: The language toggle MUST switch all visible text on screen instantly without a full page reload.
- **FR-025**: The language preference MUST persist across browser sessions.
- **FR-026**: The default language MUST be Urdu.
- **FR-027**: When Urdu is active, text direction MUST be right-to-left.

**PDF Export**

- **FR-028**: The exported PDF MUST contain: Zaraat AI header, scan date, disease name, severity level, all numbered treatment steps, spray schedule, brand medicine names, generic medicine names, footer attribution.
- **FR-029**: The PDF MUST be readable without zooming on an A4 page (font size minimum 11pt for body text).
- **FR-030**: The PDF MUST be generated without a server round-trip and download automatically on user tap.

---

### Key Entities

- **Scan**: A completed disease analysis record. Contains: unique ID, date/time, disease name, severity, treatment steps array, spray schedule, medicines (brand + generic), and the language selected at time of scan.
- **DiseaseResult**: The structured output of one AI analysis — the canonical data shape shared between the analysis response and stored Scan records.
- **Medicine**: A recommendation item with two variants — brand name (with manufacturer e.g. "Syngenta") and generic chemical name.
- **LanguagePreference**: User's selected language (`ur` or `en`), persisted across sessions.

---

## Screen Specifications

### Screen 1 — Home / Dashboard

**Layout** (mobile-first, 375 px base):

```
┌─────────────────────────────┐
│  [Zaraat AI Logo]  [ur | en] │  ← header: logo left, lang toggle right
├─────────────────────────────┤
│                             │
│   ╔═══════════════════╗    │
│   ║  [Camera Icon]    ║    │  ← primary upload card (large, tappable)
│   ║  Tasveer Lo       ║    │
│   ║  Choose Photo     ║    │
│   ╚═══════════════════╝    │
│                             │
│   [Optional: type context]  │  ← textarea, bilingual placeholder
│   [        Analyze        ] │  ← CTA button, disabled until image selected
│                             │
├─────────────────────────────┤
│  Purani Scans / Recent      │
│  ┌───────────────────────┐  │
│  │ 01 May — Wheat Rust   │  │
│  │ 30 Apr — Cotton Leaf  │  │  ← scrollable list, max 10
│  └───────────────────────┘  │
│                             │
│  [FAQ / Madad]              │  ← footer link
└─────────────────────────────┘
```

**Interactions**:
- Tapping the upload card opens an OS action sheet: "Camera / Gallery" options.
- After image selection, a thumbnail preview replaces the upload icon inside the card.
- Textarea accepts up to 500 chars; shows a remaining-characters counter below 100 chars left.
- Analyze button activates once an image is selected.
- Each recent scan row taps to offer PDF download only (not re-analysis).

**GSAP Animations**:
- Upload card: fade + slide up on mount (opacity 0→1, y 20→0, 0.4s, power2.out).
- Analyze button: scale 1.05 on hover/focus, reverse on leave (0.15s).
- Recent scan list items: staggered fade-in (stagger 0.07s) when list renders.

---

### Screen 2 — Upload / Capture (inline on Home)

The upload flow is inline — no separate route. The Home screen transforms after image selection:

1. User taps upload card → OS action sheet (Camera / Gallery).
2. Image selected → thumbnail shown inside card, card shrinks slightly.
3. Optional context text field becomes more prominent.
4. Analyze button becomes active (green fill, #1B4332).
5. User taps Analyze → transitions to Loading screen.

**Validation (client-side, instant)**:
- File type: JPEG, PNG, WebP only — show error toast if another type is selected.
- File size: 10 MB maximum — show error toast if exceeded.
- No image: Analyze button remains disabled.

**Mobile behavior**:
- Camera input uses the device's native camera (rear-facing by default).
- Gallery input allows selection from the device photo library.
- Both triggers are tappable elements with minimum 44 px height.

---

### Screen 3 — Loading Screen

**Route**: Transition state shown while the analysis request is in flight.

**Layout**:

```
┌─────────────────────────────┐
│                             │
│         [Zaraat AI]          │
│                             │
│    ┌─────────────────┐      │
│    │  🌿  (animated) │      │  ← looping leaf animation
│    └─────────────────┘      │
│                             │
│  Tasveer ka jaiza ho raha   │
│  hai... / Analysing...      │
│                             │
│  ████████░░░░░░░░░░░░  40% │  ← progress bar (animated 0→95% over 8s)
│                             │
└─────────────────────────────┘
```

**Behaviour**:
- Displayed immediately when Analyze is tapped.
- Cannot be dismissed by the user (navigation disabled during analysis).
- If the request takes > 15 seconds, a "Please wait a moment longer" message appears.
- On success → navigate to Result screen.
- On error → navigate back to Home with error toast.

**GSAP Animations**:
- Leaf icon: continuous rotation oscillation (rotation ±10°, yoyo loop, 1.2s, sine.inOut).
- Progress bar: fill animation from 0% to 95% over 8 seconds (power1.inOut).
- Screen entrance: opacity fade in (0.3s).

---

### Screen 4 — Result Screen

**Route**: `/result`

**Layout**:

```
┌─────────────────────────────┐
│  ← Back   Zaraat AI  [ur|en] │
├─────────────────────────────┤
│                             │
│  ┌─────────────────────┐   │
│  │  گندم کا زنگ        │   │  ← disease name, large bold, GSAP reveal
│  │  Wheat Rust          │   │
│  └─────────────────────┘   │
│                             │
│  [● Moderate / متوسط]       │  ← severity badge, amber fill, GSAP pop
│                             │
│  Ilaj ke Qadam / Treatment  │
│  ─────────────────────────  │
│  1. پہلے متاثرہ پتے ہٹائیں  │  ← numbered list, stagger reveal
│  2. 48 گھنٹوں میں دوائی لگائیں│
│  3. ہر 3 دن بعد معائنہ کریں   │
│                             │
│  Spray Schedule             │
│  ─────────────────────────  │
│  ہر 7 دن بعد، 3 ہفتوں تک    │
│                             │
│  Dawa / Medicines           │
│  Brand:   Tilt 250 EC       │
│  Generic: Propiconazole     │
│                             │
├─────────────────────────────┤
│  [📋 Copy Text] [📄 PDF]    │
│  [← Dobara Scan Karein]     │
└─────────────────────────────┘
```

**GSAP Animations**:
- Disease name card: opacity 0→1, y 30→0, 0.6s, back.out(1.4).
- Severity badge: scale 0.7→1, opacity 0→1, 0.35s delay 0.3s, back.out(2).
- Treatment steps: opacity 0→1, x -20→0, stagger 0.1s per step, 0.4s, power2.out.
- Spray + medicines sections: opacity 0→1, y 15→0, stagger 0.08s, 0.35s, power2.out.

**Interactions**:
- "Copy Text": assembles plain-text string from all result fields, writes to clipboard, shows a 2-second "Copied!" toast.
- "PDF Download": triggers client-side PDF generation and auto-downloads.
- "Dobara Scan": clears state, navigates to Home.
- Back arrow: same as "Dobara Scan".

---

### Screen 5 — FAQ Screen

**Route**: `/faq`

**Layout**: Single scrollable page with accordion or flat Q&A pairs.

**Required Q&A pairs** (bilingual):

| # | Question (Urdu) | Question (English) |
|---|---|---|
| 1 | اچھی تصویر کیسے لیں؟ | How to take a good photo? |
| 2 | Mild/Moderate/Severe کا مطلب کیا ہے؟ | What do severity levels mean? |
| 3 | کون سی فصلیں سپورٹڈ ہیں؟ | Which crops are supported? |
| 4 | دواؤں کی فہرست کیسے استعمال کریں؟ | How to use the medicines list? |
| 5 | "دوبارہ کوشش کریں" کیوں آتا ہے؟ | Why does "try again" appear? |

**Good photo guidance (Q1 answer)**:
- Hold phone 30–40 cm from the leaf.
- Use natural daylight, avoid flash.
- Ensure the affected area fills more than half the frame.
- One leaf per photo.

**GSAP Animation**: FAQ items fade in with stagger on scroll-into-view (ScrollTrigger or IntersectionObserver fallback).

---

## API Specification

### POST `/api/analyze`

**Purpose**: Accept a crop photo and optional context, call the AI vision service server-side, return a structured diagnosis JSON.

**Request** (`multipart/form-data`):

| Field | Type | Required | Constraints |
|---|---|---|---|
| `image` | File | Yes | JPEG / PNG / WebP, max 10 MB |
| `context` | string | No | Max 500 characters |
| `language` | `"ur"` or `"en"` | No | Default: `"ur"` |

**Success Response** (`200 OK`, `application/json`):

```json
{
  "disease": "گندم کا زنگ (Puccinia striiformis)",
  "severity": "Moderate",
  "treatmentSteps": [
    "1. پہلے تمام متاثرہ پتے توڑ کر جلا دیں۔",
    "2. 48 گھنٹوں کے اندر فنگی سائیڈ اسپرے کریں۔",
    "3. ہر 3 دن بعد فصل کا معائنہ کریں۔"
  ],
  "spraySchedule": "ہر 7 دن بعد اسپرے کریں، مسلسل 3 ہفتوں تک۔",
  "medicines": {
    "brandNames": ["Tilt 250 EC (Syngenta)", "Score 250 EC (Syngenta)"],
    "genericNames": ["Propiconazole 25% EC", "Difenoconazole 25% EC"]
  }
}
```

**Error Responses**:

| HTTP Status | `code` | Trigger |
|---|---|---|
| `400` | `INVALID_IMAGE` | Missing image, wrong MIME type, or file > 10 MB |
| `400` | `NOT_A_CROP_LEAF` | AI determines image is not a plant/crop leaf |
| `422` | `DIAGNOSIS_FAILED` | AI cannot confidently identify a disease (blurry, healthy, or ambiguous image) |
| `500` | `UPSTREAM_ERROR` | AI service returned non-200 or threw an exception |
| `408` | `TIMEOUT` | Request exceeded 30-second timeout |

**Error response shape** (all errors):

```json
{
  "error": {
    "code": "NOT_A_CROP_LEAF",
    "message": "براہ کرم فصل کے پتے کی تصویر اپ لوڈ کریں۔",
    "messageEn": "Please upload a photo of a crop leaf."
  }
}
```

---

## GPT-4 Vision System Prompt

The `{LANGUAGE}` placeholder is replaced at runtime with `Urdu` or `English`.
The `{CONTEXT}` placeholder is replaced with the optional farmer's text, or omitted if empty.

```
You are a certified Pakistani agricultural expert and plant pathologist with 20 years of field
experience in Punjab, Sindh, and KPK. Farmers rely on you for accurate, actionable disease
diagnoses.

TASK: Analyse the provided crop leaf image and identify the single most likely disease.
Follow every rule below without exception.

RULES:
1. Return ONLY the single most probable disease. NEVER list multiple diseases or say
   "it could be X or Y".
2. NEVER include confidence scores, probabilities, or percentages.
3. If the image does NOT show a crop or plant leaf, return ONLY this JSON:
   {"error":"NOT_A_CROP_LEAF"}
4. If the image is too blurry, too dark, or you cannot confidently identify a disease,
   return ONLY this JSON: {"error":"DIAGNOSIS_FAILED"}
5. Respond in {LANGUAGE}. ALL text fields in the JSON must be in {LANGUAGE}.
   Disease scientific names may remain in Latin parenthetical notation.
6. Brand medicine names MUST be Pakistani brands where available: Engro, FFC, Syngenta,
   Bayer, Dow AgroSciences. Include the brand/manufacturer in parentheses.
7. Treatment steps MUST be numbered and start with an action verb.
8. Spray schedule MUST specify both frequency AND total duration
   (e.g., "once every 7 days for 3 weeks").

OUTPUT FORMAT: Respond ONLY with valid JSON — no markdown fences, no explanation, no preamble:
{
  "disease": "<disease name in {LANGUAGE}, Latin name in parentheses>",
  "severity": "<exactly one of: Mild | Moderate | Severe>",
  "treatmentSteps": [
    "<step 1 — numbered, starts with verb>",
    "<step 2>",
    "<step 3>"
  ],
  "spraySchedule": "<frequency and total duration in {LANGUAGE}>",
  "medicines": {
    "brandNames": ["<Brand Name (Manufacturer)>"],
    "genericNames": ["<chemical name + concentration>"]
  }
}

Farmer's additional context (their own words): {CONTEXT}
```

---

## PDF Export Specification

### Required Content Blocks

1. **Header**: Zaraat AI name in dark green, tagline "AI-Powered Crop Disease Detection", horizontal rule
2. **Metadata**: Scan date (DD MMM YYYY), Scan ID (short identifier)
3. **Disease name**: Bold, 16pt
4. **Severity badge**: Coloured box — Mild = #74C69D (green), Moderate = amber, Severe = red — with text label inside
5. **Treatment Steps**: Section heading, numbered list — each step on its own line, 11pt
6. **Spray Schedule**: Section heading, italic body text, 11pt
7. **Medicines**: Two labelled sub-sections — "Brand Names" (with manufacturer) and "Generic Names" (chemical formula)
8. **Footer**: "Generated by Zaraat AI — AI-powered crop disease detection for Pakistani farmers"

### Layout & Formatting

- Page: A4 portrait, 20 mm margins all sides
- Primary colour: `#1B4332` for headings and borders
- Body font size: 11pt minimum (readability requirement SC-004)
- File name: `Zaraat AI-YYYY-MM-DD.pdf`
- Language direction: RTL for Urdu export, LTR for English export
- Generation: fully client-side — no server involved in PDF creation

---

## localStorage Schema

```
Key: "zaraat_scans"
Value: JSON array of ScanRecord objects

ScanRecord fields:
  id            — 8-character unique identifier
  date          — ISO 8601 timestamp (e.g. "2026-05-02T14:30:00.000Z")
  lang          — "ur" or "en" (language active when scan was performed)
  disease       — string
  severity      — "Mild", "Moderate", or "Severe"
  treatmentSteps — array of strings
  spraySchedule  — string
  medicines      — { brandNames: string[], genericNames: string[] }
  imageThumb     — optional base64 JPEG thumbnail, max 5 KB

Key: "zaraat_lang"
Value: "ur" or "en"
Purpose: persisted language preference
```

**Storage management**:
- Maximum 10 scans stored; when an 11th scan arrives, the oldest is deleted first (FIFO).
- If storage write fails (quota exceeded), attempt to prune oldest scan and retry once.
- If retry also fails, skip saving and show a non-blocking informational toast — the result screen still works fully.

---

## Language Toggle Behaviour

- **Default**: Urdu (`ur`).
- **Toggle location**: Top-right header pill (`اردو | EN`), visible on every screen.
- **On toggle**:
  1. Language preference is saved to local storage immediately.
  2. All visible strings update in place without a page reload.
  3. Text direction switches: RTL for Urdu, LTR for English.
  4. The AI analysis prompt language updates for the next request.
  5. Already-displayed result data stays in the language it was generated in — the user must start a new scan to get the result in the other language.

---

## GSAP Animation Triggers & Types

| Trigger | Element | Animation | Duration | Easing |
|---|---|---|---|---|
| Component mount | Upload card | opacity 0→1, y 20→0 | 0.4s | power2.out |
| Component mount | Recent scans list | opacity 0→1, y 10→0, stagger 0.07s | 0.35s | power2.out |
| Hover / focus | Analyze button | scale 1→1.05, reverse on leave | 0.15s | power1.out |
| Hover / focus | Copy Text button | scale 1→1.04, reverse on leave | 0.15s | power1.out |
| Hover / focus | PDF Download button | scale 1→1.04, reverse on leave | 0.15s | power1.out |
| Component mount | Result: disease name | opacity 0→1, y 30→0 | 0.6s | back.out(1.4) |
| Mount + 0.3s delay | Result: severity badge | scale 0.7→1, opacity 0→1 | 0.35s | back.out(2) |
| Component mount | Result: treatment steps | opacity 0→1, x -20→0, stagger 0.1s | 0.4s | power2.out |
| Component mount | Result: spray + medicines | opacity 0→1, y 15→0, stagger 0.08s | 0.35s | power2.out |
| Continuous loop | Loading: leaf icon | rotation ±10°, yoyo, repeat -1 | 1.2s | sine.inOut |
| Loading start | Progress bar | width 0→95% | 8s | power1.inOut |
| Scroll into view | FAQ items | opacity 0→1, y 15→0, stagger 0.1s | 0.4s | power2.out |
| Drag-over upload | Upload card border | borderColor → #74C69D, scale 1→1.02 | 0.2s | power2.out |

All mount animations MUST use `gsap.context` with cleanup (`ctx.revert()`) in component teardown.

---

## Responsive Breakpoints

Zaraat AI uses a mobile-first approach. Base styles target 375 px; breakpoints expand upward.

| Breakpoint | Min Width | Key layout change |
|---|---|---|
| Base (mobile) | 0 px | Full-width single column, stacked layout |
| `sm` | 640 px | Increased horizontal padding, larger text |
| `md` | 768 px | Centred container (max 512 px wide), card shadow |
| `lg` | 1024 px | Wider container (max 576 px), optional two-column Result layout |

**Mandatory mobile rules (Base)**:
- Upload card: full width, minimum 200 px height.
- Analyze button: full width, minimum 52 px height.
- All interactive elements: minimum 44 × 44 px touch target.
- Body text: 16px minimum.
- No horizontal scroll at any breakpoint.
- iOS safe area insets respected for notched devices.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A farmer can photograph a diseased leaf and receive a complete diagnosis (disease name + severity + ≥ 3 treatment steps + spray schedule + ≥ 2 medicines) within 15 seconds of tapping Analyze on a standard 4G connection.
- **SC-002**: A non-plant image uploaded by a user is rejected with a helpful retry message in 100% of cases — no nonsensical disease is ever diagnosed for a non-crop image.
- **SC-003**: All user-visible text switches language (Urdu ↔ English) within 1 second of tapping the toggle, with no page reload.
- **SC-004**: A downloaded PDF contains all 7 required content blocks (header, date, disease, severity, treatment steps, spray schedule, medicines) and is readable without zooming on a phone screen.
- **SC-005**: The app is fully functional on a 375 px wide mobile screen — no horizontal scrolling, no clipped elements, all touch targets ≥ 44 px.
- **SC-006**: The app loads and is interactive within 3 seconds on a mid-range Android device on a 4G connection.
- **SC-007**: Previously completed scans can be re-exported as PDF from the Recent Scans list without needing to re-submit any photo.
- **SC-008**: All 13 GSAP animation triggers defined in this spec fire correctly — verified visually with no jank on a mid-range Android device.

---

## Assumptions

1. The AI service is called once per analysis — no automatic retry with a different prompt on DIAGNOSIS_FAILED; the user retakes the photo instead.
2. No image is stored server-side — the analysis route processes and discards the image within the same request lifecycle.
3. All PDF generation happens client-side; no server is involved in PDF creation.
4. The Recent Scans list shows the 10 most recent scans sorted by date descending.
5. Urdu font rendering varies by device — system Urdu fonts are acceptable as a fallback when custom fonts fail to load.
6. The app will be deployed on a free hosting tier; the OpenAI API key and associated costs are managed by the project owner.
