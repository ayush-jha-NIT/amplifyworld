# Modules 2–3 → Modules 4–10 integration handoff

This PR adds only design documentation, editable assets, exports, isolated studies and verification evidence. It does not add production Next.js/Express code, change deployment settings, create a database, send inquiries or configure Resend.

## Start here

1. Open `design-assets/catalogue/index.html` through the local preview server.
2. Review all five pages and the inline article state.
3. Inspect `previews/comparisons/` alongside `PAGE_DESIGN_SPEC.md`.
4. Use the asset manifest rather than guessing filenames.
5. Follow the module map below.

From `design-assets/`:

```sh
npm install
npm run preview
```

Open `http://127.0.0.1:4173/catalogue/index.html`. A browser is needed for the WebGL study and history-based article reading. Static page documents also open locally, but the server is the supported review path.

Rebuild exports with `npm run assets`; rebuild HTML with `node tools/build-pages.cjs`; rebuild the model with `node tools/build-glb.cjs`. Image-generation originals are committed, so rebuilding does not call a paid or external image API. The included map data and font make the pipeline independent of remote asset availability.

`npm run capture` and `npm run verify` use Playwright with a local Microsoft Edge channel. Install Edge or change the channel to an installed Chromium browser. The production application has no dependency on these tools.

## Module-by-module mapping

| Module | Consume | Implementation contract |
|---|---|---|
| 4 Global UI | tokens JSON/CSS, Tailwind mapping, logo crops, custom icons, component specs | Responsive navbar, valid section links, focus/disabled/loading states, footer; verified WhatsApp number only |
| 5 Hero | mountain layers, road SVG, milestone signs, emblem, Earth textures/GLB, GSAP/R3F references | Keep world coordinates aligned, 7.2s order, pausable Earth/orbits, deterministic seek, fallback dimensions |
| 6 Home sections | service/value/process icons, concept project shells, horizon composition | Six exact services; no invented proof; reviewed project data replaces examples |
| 7 About | Earth/mark/terrain layers, Mission/Vision/value icons | Restrained motion, concise content, no counters |
| 8 Portfolio | desktop/mobile frames, three project templates, carousel state evidence | Accessible selection, filters/search, touch + buttons, labelled examples, keyboard modal |
| 9 Blog | four editorial illustrations, reader layouts, cover guidance | `/blog?article=slug`, full same-page semantic article, history/TOC/progress/scroll restoration |
| 10 Contact | envelope motif, form icons/states, process copy | Required/optional field contract, client + API validation later, truthful success/failure and verified destinations |

## Asset installation

The application folder does not yet exist in this repository. Keep the independent design package here. In the later application PR, copy selected `exports/` into `apps/web/public/design/`, keeping the same subdirectories. Do not copy `source/references/` or page screenshots into the website's public bundle.

Import tokens into the app's global CSS. Adapt the Tailwind mapping to the chosen Tailwind version; the exported object is a mapping reference, not an assumed complete application config. Self-host the font with `next/font/local` or the equivalent local CSS declaration. Preserve the OFL file when redistributing it.

Use responsive `<picture>` or Next.js Image for raster artwork, reserve the actual aspect ratio, and supply accurate sizes. Prefer 640px artwork on phones, 1200px desktop, 1536px terrain only when justified by display size. The Earth surface texture is 2:1, not a hero image. Use WebP as the texture loader fallback because Three's image loader cannot rely on Next.js image transformation behavior.

For SVG icons, decorative instances use empty alt or `aria-hidden`; functional controls have a visible or accessible label. Inline SVGs must receive unique IDs when they contain gradient/filter definitions. Do not copy identical `id="brand"` defs into the same document without prefixing.

## 3D details

Choose either the self-contained GLB for geometry convenience or procedural R3F geometry. Do not load both. Use `EarthRevolve` for rotation, leaving `EarthAxialTilt` fixed. The richer `earth-surface` texture is artistic and geographically guided; the `earth-albedo` SVG/WebP is a deterministic low-cost geographic alternative. Neither decorative network lights nor node positions represent actual clients or measured data.

For enhanced depth use the atmosphere shader, orbit groups and particle buffer from `catalogue/earth-study.js`. Keep the canvas separate from the HTML logo, milestone labels and CTAs. The logo points into the Earth composition and must not be replaced by an approximate text or arrow icon.

The homepage HTML demonstrates the intro with independent layers and uses the detailed beauty still at rest. The separate Earth study demonstrates continuous actual 3D rotation. Combining those two reference pieces is the explicit Module 5 frontend task, not a hidden implementation claim in this package.

## Content and outstanding production inputs

- Verified public WhatsApp number.
- Permission-cleared project images, names and case descriptions.
- Reviewed publication text, authors and dates.
- Approved business email/location/hours if those modules are desired.
- Approved privacy/legal copy and data-retention policy.

These content inputs do not prevent reviewing the design package. They do prevent publishing placeholders as company facts. Source mockups contain fabricated-looking demo data; their presence in the references directory is not verification.

## Delivery and testing boundaries

Design preview interaction checks and all 25 responsive page captures passed as recorded in `VISUAL_QA_REPORT.md`. The snippets are inspectable integration references; no production Next.js build, lint, typecheck or backend test was claimed. Run those checks when the later workflow integrates the package.

Perform real-device visual/FPS tests and screen-reader testing in Module 16. Validate WhatsApp links against the real number and inquiry success against durable backend delivery in Modules 10–13. No production deployment is part of this handoff.
