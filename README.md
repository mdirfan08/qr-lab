# QR LAB
### Generate. Design. Stress-test.

A premium, fully client-side QR code engineering studio — built for the **GDG on Campus SRM
Technical Domain Recruitment 2026–27** "QR Code Generator & Designer" assignment.

QR LAB is not a basic QR generator. It's a small design studio, a reliability engine, and a
stress-testing lab, built entirely as a static single-page app with no backend.

---

## Features

**Required (all implemented)**
- URL, Plain Text, Email, Phone, and Wi-Fi QR types
- Dynamic input fields per QR type, with immediate, human-readable validation
- Real-time preview that updates as you type or adjust design controls
- Size, foreground/background color, error-correction level, and quiet-zone (margin)
  customization
- Six visual presets (Minimal, Midnight, Professional, Soft, Glass, Bold) that remain
  fully editable after selection
- PNG download that matches the on-screen preview exactly
- Scan-reliability considerations, surfaced as a live, explainable score
- Recent/saved QR codes with local persistence across refreshes
- Responsive desktop → tablet → mobile layout
- A test suite for the core generation and reliability logic (see `npm test`)
- 100% client-side — no backend, no network calls, no telemetry

**Beyond the brief**
- Additional QR types: Contact (vCard) and SMS
- A hand-rolled SVG rendering engine (not just a thin wrapper) with dot styles (square /
  rounded / dots), eye styles (square / rounded / soft), gradients, and logo overlay
- **Reliability Engine** — scores contrast, quiet zone, error correction, module size, and
  logo coverage, each with a plain-language explanation. Never claims to guarantee a scan;
  language is deliberately hedged ("estimated," "potential issue," "recommended").
- **Auto-Fix** — one click applies safe, deterministic adjustments to resolve flagged
  issues, and reports exactly what changed and why.
- **Test Lab** — stress-tests a rendered QR against blur, low contrast, compression-like
  noise, and small-display rendering using a **real decode attempt** (via `jsQR`) against a
  degraded raster of the actual QR. Rotation and perspective-distortion scenarios are not
  independently modelled, so they are clearly labeled "Visual stress simulation" rather than
  presented as verified results.
- **Batch Generator** — turns a CSV list into many QR codes at once, downloadable
  individually or as a single ZIP (via `jszip`), entirely in-browser.
- SVG download alongside PNG
- Library search/filter, duplicate, edit-in-place, and JSON export/clear in Settings

---

## Tech stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- [`qrcode`](https://www.npmjs.com/package/qrcode) — used only to compute the spec-correct
  module matrix; all visual rendering (dots, eyes, gradients, logo) is custom SVG
- [`jsqr`](https://www.npmjs.com/package/jsqr) — real decode verification in the Test Lab
- [`jszip`](https://www.npmjs.com/package/jszip) — batch ZIP export

No UI framework, animation library, or state-management library was added — everything is
built on React state and hooks to keep the dependency surface small.

---

## Architecture

```
src/
  components/ui/       Small, reusable UI primitives (Button, Slider, Toggle, Toast, …)
  features/
    qr-generator/       Type selector, per-type form, live QR preview, design panel
    reliability/         Reliability score + issue list + Auto-Fix trigger
    test-lab/             Stress-test report
    batch/                 CSV → batch QR generation
    history/                Saved-library grid, search/filter, actions
  hooks/                useDebounce, useLibrary (localStorage), useQRRender (encode +
                        analyze pipeline)
  lib/                  Pure, framework-free logic:
                          payload.ts       form fields → QR payload string per type
                          validation.ts    per-type field validation
                          qrEngine.ts      matrix generation + custom SVG rendering + PNG export
                          reliability.ts   explainable reliability scoring
                          autofix.ts       safe, deterministic auto-fix logic
                          testLab.ts       stress-test scenarios (real decode + labeled sims)
                          storage.ts       localStorage persistence
                          download.ts      PNG/SVG download helpers
                          csv.ts           batch CSV parsing
                          presets.ts       design presets
  pages/                Landing, Studio, TestLabPage, BatchPage, HistoryPage, Settings
  types/qr.ts           Shared domain types
```

The split keeps UI, QR generation, validation, reliability analysis, persistence, and
downloads in separate, independently testable modules — no logic lives inside JSX beyond
wiring.

---

## Key engineering decisions

**Why a custom SVG renderer instead of relying on a QR library's built-in styling?**
Most QR npm packages only draw plain square modules. To support dot styles, custom eye
shapes, gradients, and logo overlay while staying byte-for-byte spec-compliant, QR LAB uses
`qrcode`'s `create()` API purely to get the raw module matrix (the black/white grid the spec
dictates for a given payload + error-correction level), then draws every visual element
itself. This is also what makes PNG and SVG downloads pixel-identical to the on-screen
preview — both are generated from the exact same SVG string.

**Why is the reliability score explainable rather than a black box?**
A single opaque number invites false confidence. Each factor (contrast, quiet zone, error
correction, module size, logo coverage) is scored independently with a specific, actionable
explanation, and the UI is careful to say "estimated reliability," never "will scan."

**Why label some Test Lab scenarios as simulations?**
Blur, low contrast, compression noise, and small-display rendering can be reproduced as
actual image degradations and then run through a real QR decoder (`jsQR`) — so those
results are genuine pass/fail outcomes. Rotation and perspective distortion depend on camera
geometry that isn't meaningfully reproducible by degrading a flat raster, so rather than
fabricate a result, those are shown as heuristic "visual stress simulation" notes.

**Why localStorage instead of IndexedDB?**
The saved library is small (JSON records with base64 logo images only when present) and
doesn't need transactional or indexed queries — localStorage keeps the persistence layer
trivial and synchronous, which simplifies the `useLibrary` hook considerably. If logo-heavy
libraries ever needed to scale past a few hundred entries, IndexedDB would be the natural
next step.

**Why no client-side router library?**
The app has six flat views with no nested or parametrized routes, so a small `Route` union
type plus `useState` in `App.tsx` covers navigation without adding a routing dependency.

---

## Privacy

QR LAB has no backend. QR generation, the reliability engine, the Test Lab's decode checks,
batch generation, and your saved library all run entirely in your browser. Saved QR codes
are stored in `localStorage` under a single namespaced key and never transmitted anywhere.
The "Local Mode" indicator in the navigation bar reflects this directly — it is not a
marketing claim layered on top of a different implementation.

---

## Setup

Requires Node.js 18+.

```bash
npm install
```

## Development

```bash
npm run dev
```

Starts a Vite dev server (default: http://localhost:5173) with hot module reload.

## Testing

```bash
npm test
```

Runs the Vitest suite covering payload construction, validation, and the reliability
scoring engine.

## Production build

```bash
npm run build
npm run preview   # serve the production build locally to sanity-check it
```

Outputs a fully static `dist/` folder — deployable to any static host (GitHub Pages,
Vercel, Netlify, Cloudflare Pages) with no server-side configuration.

## Deployment

Because QR LAB is 100% static:

1. Run `npm run build`.
2. Upload the contents of `dist/` to any static host, or point GitHub Pages / Vercel /
   Netlify at this repository with build command `npm run build` and output directory
   `dist`.

No environment variables, API keys, or backend services are required.

---

## Known limitations

- Rotation and perspective-distortion Test Lab scenarios are heuristic simulations, not
  verified decodes (see "Key engineering decisions" above).
- Additional QR types beyond the required five (Contact, SMS) are included, but Location
  and Calendar Event types from the extended wishlist were left out of this build to keep
  the surface area focused and well-tested rather than broad and thin.
- Logo overlay is rendered on top of the code visually; QR LAB does not carve a dedicated
  error-correction-aware "quiet hole" behind the logo — instead it leans on raising error
  correction (via Auto-Fix) to keep the code decodable when a logo is present.
