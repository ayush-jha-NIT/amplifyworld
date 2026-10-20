# Visual QA report — Module 2–3 design package

Date: 20 October 2026. Scope: isolated design catalogue, asset exports and handoff documents. This is not a production deployment or a claim that Modules 4–10 have been integrated.

## Result

All five pages have complete desktop/tablet/mobile designs and exported previews at **1440, 1024, 768, 390 and 375px**. All **25 page/width captures** completed with **zero horizontal overflow, zero missing images and zero uncaught browser errors**. The inline blog reader also has separate exports at all five widths.

Evidence:

- `design-assets/previews/layout-checks.json`
- `design-assets/previews/verification-results.json`
- `design-assets/previews/glb-validation.json`
- `design-assets/previews/comparisons/`
- `design-assets/previews/states/`
- `design-assets/previews/storyboard/`

## Source and visual inspection

Both original logos and all five approved page references were inspected. Original files are preserved. Palette samples are recorded at actual source-pixel coordinates. The logo's original mark and wordmark are used; no substitute AW lettering was invented.

Desktop page overview, mobile hero compositions, individual hero/3D study captures and the reference comparison boards were inspected. Review focused on section hierarchy, artwork layering, headline wrapping, control visibility, card density and source fidelity. The mobile scene is stacked below copy and CTAs, rather than shrinking the desktop grid.

Issues found and corrected:

1. Intrinsic image height attributes initially stretched the navigation logo and terrain. Global aspect-ratio preservation and source-aware sizing corrected this.
2. Lazy images with no reserved intrinsic dimensions could be absent from preview captures. Catalogue assets now load deterministically; production loading guidance requires reserved dimensions and accurate responsive sizes.
3. The emblem crop included part of the neighbouring white wordmark. The derivative export excludes that unrelated white fragment and keys the known black background while preserving source RGB.
4. The summit label competed with the emblem. The emblem was moved to the upper-left of the globe and the foreground layer's opacity reduced.
5. Mobile navigation and scene motion controls now retain 44px target heights.
6. The scene wrapper is an accessible group, so its pause/replay controls remain exposed.

## Reference fidelity

| Page | Preserved | Deliberate changes |
|---|---|---|
| Home | Split hero; ascending road; four ordered signs; authentic logo; Earth; six services; partner/process/CTA structure | Remove unverified proof, testimonials and clients; original terrain; more breathing room |
| About | Premium brand-over-Earth hero; introduction; Mission/Vision; values; expertise; horizon CTA | Omit invented counters; restrained motion |
| Portfolio | Layered hero frames; featured perspective carousel; filters; project rail; detail view | Original clearly labelled concept media; no fake clients, results or live links |
| Blog | Editorial hero/cards; topic filters; same-page complete reader; TOC/progress/related reading | Original sample copy and artwork; no invented authors/dates |
| Contact | Purple planet/envelope hero; paired actions; inquiry form/next steps; CTA | No unverified email, phone, map, hours or response SLA |

The design is not claimed to be pixel-identical to a generative screenshot. Exact font source and vector logo masters were not supplied; a licensed close font substitute and authentic raster-backed logo containers are documented. See `DECISIONS_LOG.md`.

## Interaction checks

Passed in local Microsoft Edge through Playwright:

- Carousel next action changes the selected project.
- Category filtering produces an honest empty state; Clear filters restores results.
- Project modal opens; Escape closes it.
- Article selection keeps `/blog.html` and adds query state.
- Full article sections are present.
- Browser Back closes the reader; Forward restores it.
- Direct article query links open the correct reader.
- Empty form identifies invalid fields and focuses the first error.
- Valid form demonstrates a clearly labelled simulated success.
- Failure state retains the user's input and permits retry.
- WhatsApp buttons expose the pending verified-number state without inventing a destination.
- Mobile disclosure opens and Escape closes it.
- Reduced motion resolves the hero immediately to its final state.
- Forced no-WebGL state displays a still.
- Actual WebGL Earth study starts and its pause control works.

No messages were transmitted by these checks. Sample form data was used only in the local preview.

## Contrast measurements

WCAG relative-luminance formula, computed from exported CSS colors:

| Pair | Ratio |
|---|---:|
| Main text / canvas | 18.97:1 |
| Muted text / surface | 10.11:1 |
| Primary label / gradient start | 6.94:1 |
| Primary label / gradient end | 5.64:1 |
| Error text / surface | 11.85:1 |
| Focus ring / canvas | 12.50:1 |

Both primary gradient endpoints exceed 4.5:1. These measurements do not replace a complete integrated accessibility audit of every rendered state.

## Asset and model checks

Every manifest filename and editable-source path was checked for existence. The manifest includes dimensions, alpha presence, byte sizes, SHA-256, provenance, dependencies and module use. Vector and raster exports render in the catalogue. Source screenshot references are marked reference-only.

`earth-orbits.glb` was checked with Khronos glTF Validator `2.0.0-dev.3.10`: **0 errors, 0 warnings, 0 hints**. It contains named independently controllable Earth and orbit nodes plus an embedded texture. The separate live WebGL study uses the supplied surface map, rim shader and orbital nodes.

Export examples:

| Asset | Export size |
|---|---:|
| Phone mountain, 640px AVIF | 44,844 bytes |
| Phone Earth beauty, 640px AVIF | 72,255 bytes |
| Desktop mountain, 1200px AVIF | 128,240 bytes |
| Desktop Earth beauty, 1200px AVIF | 191,614 bytes |
| Rich Earth surface, 2048px WebP | 231,018 bytes |
| Self-contained Earth/orbits GLB | 653,816 bytes |

The complete package contains source references and full-page evidence, which are not part of the initial website payload. Use the manifest for exact current values.

## Acceptance gates

- [x] Both original logos and all five approved references inspected.
- [x] Exact service taxonomy and required CTA copy retained.
- [x] Reusable tokens and component states documented.
- [x] Five responsive page designs and full inline article state exported.
- [x] Original terrain, independent road, four signs, logo derivatives, Earth assets and custom icons delivered.
- [x] Eight-beat timed storyboard and GSAP/Three/R3F references supplied.
- [x] Reduced-motion, low-power and no-WebGL behavior specified.
- [x] Concept content distinguished from real company facts.
- [x] File/source existence, preview interactions, contrast and 3D model validated.
- [x] Integration handoff scoped to Modules 4–10 without implementing the production application.

## Remaining production work

User review of the concrete design package; verified business contact data and actual client/editorial content; production frontend integration; backend delivery; real handset FPS/thermal tests; full screen-reader and cross-browser audit. No production build, API, email delivery or deployment has been claimed.
