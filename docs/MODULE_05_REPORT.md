# Module 5 — Cinematic Home Hero

**Implementation scope:** Production Next.js homepage cinematic hero, based on the Module 2–3 approved assets and `ANIMATION_PLAYBOOK.md`.

## Implemented

- Responsive split-composition hero with real server-rendered heading, service positioning, and immediate CTAs.
- Authentic source-derived AmplifyWorld emblem, original 2.5D mountain imagery, starfield, distant peaks, foreground and a separate SVG road path using the design kit's world coordinates (1000×800).
- GSAP 7.2-second timeline: ascending road light, Strategy (1.1–1.55), Marketing (2.1–2.55), Technology (3.2–3.65), Scalable Growth (4.3–4.75), authentic logo (4.9–5.7), Earth emphasis (5.7–6.9), and settled scene by 7.2 seconds.
- Procedural React Three Fiber globe with actual spherical material maps from the design kit, 23.4° axial tilt, 72-second axial rotation, independent 28/42-second tilted orbital rings, moving nodes, atmospheric rim shader, and deterministic particle field.
- GSAP controls for pause/resume and replay without blocking the headline/CTAs. The inspection query `/?heroTime=4.75` freezes a deterministic timeline frame; valid range 0–7.2 seconds.
- Loads the WebGL canvas only after the hero enters view and the browser indicates support. Reduces DPR and geometry complexity on phones. Pauses the timeline/Earth offscreen, when document is hidden, or when user pauses.
- Source-backed still-artwork fallbacks for reduced motion, Save Data, no WebGL and lost WebGL context.
- Semantic ordered milestone names for accessibility, visible animation controls, reduced-motion behavior, and focusable link/CTA content at first paint.
- Copy and CTA labels remain consistent with approved design. No invented WhatsApp number or client outcomes.

## Reused assets

Under `apps/web/public/design`, reused existing original blobs rather than duplicating entire screenshots:
- `brand/logo-emblem.webp`
- `scene/mountain-main-{1200,640}.webp`
- `scene/mountain-distant.svg`
- `scene/foreground.svg`
- `scene/starfield.svg`
- `scene/globe-fallback-{1200,640}.webp`
- `scene/earth-surface-{2048,1024}.webp`
- `scene/earth-emissive-2048.webp`

## Dependencies

- `gsap`: timeline controller and timeline inspection.
- `three`, `@react-three/fiber`: genuine real-time Earth and orbital materials.
- `@types/three`: TypeScript types.

No paid service, server-side generation endpoint or video API is required.

## Quality and limitations

- Project CI must pass install, Next.js/Express builds, TypeScript, lint and Node tests before merging.
- Added static Module 5 source-contract tests alongside existing route/layout tests.
- **Module 5 is the hero only.** The remaining homepage sections will receive their complete design in Module 6; About, Portfolio, Blog and Contact follow in Modules 7–10.
- The still fallback is intentional on devices without supported WebGL or with reduced-motion/save-data preferences. WebGL rendering requires a compatible client GPU/browser.
- Real-device FPS, visual reference screenshots, screen-reader behavior, WebGL context loss and cross-browser validation remain production QA goals for Module 16. Do not interpret a green compilation as a complete real-device performance audit.
- WhatsApp CTA remains disabled until an actual verified business number is configured.
