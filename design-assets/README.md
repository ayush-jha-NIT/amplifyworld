# AmplifyWorld design kit

Editable Module 2–3 deliverables covering Modules 4–10. This folder is isolated from the future production application.

- [Design catalogue](catalogue/index.html)
- [All-page overview](previews/all-pages-desktop.webp)
- [Complete machine-readable asset inventory](asset-manifest.json)
- [Integration handoff](../docs/design/INTEGRATION_HANDOFF.md)
- [Animation playbook](../docs/design/ANIMATION_PLAYBOOK.md)
- [Visual QA](../docs/design/VISUAL_QA_REPORT.md)
- [Licenses and provenance](LICENSES_AND_PROVENANCE.md)

Run `npm install` then `npm run preview`. Open `http://127.0.0.1:4173/catalogue/index.html`. The preview sends no inquiries and has no backend.

## Page previews

| Page | Desktop 1440 | Tablet 1024 | Tablet 768 | Mobile 390 | Mobile 375 |
|---|---|---|---|---|---|
| Home | [View](previews/home-1440.webp) | [View](previews/home-1024.webp) | [View](previews/home-768.webp) | [View](previews/home-390.webp) | [View](previews/home-375.webp) |
| About | [View](previews/about-1440.webp) | [View](previews/about-1024.webp) | [View](previews/about-768.webp) | [View](previews/about-390.webp) | [View](previews/about-375.webp) |
| Portfolio | [View](previews/portfolio-1440.webp) | [View](previews/portfolio-1024.webp) | [View](previews/portfolio-768.webp) | [View](previews/portfolio-390.webp) | [View](previews/portfolio-375.webp) |
| Blog listing | [View](previews/blog-1440.webp) | [View](previews/blog-1024.webp) | [View](previews/blog-768.webp) | [View](previews/blog-390.webp) | [View](previews/blog-375.webp) |
| Blog reader | [View](previews/blog-reader-1440.png) | [View](previews/blog-reader-1024.png) | [View](previews/blog-reader-768.png) | [View](previews/blog-reader-390.png) | [View](previews/blog-reader-375.png) |
| Contact | [View](previews/contact-1440.webp) | [View](previews/contact-1024.webp) | [View](previews/contact-768.webp) | [View](previews/contact-390.webp) | [View](previews/contact-375.webp) |

## Editable sources

`source/brand/` holds unchanged supplied logos, sample coordinates, derivative regions and raster-backed SVG containers. `source/scene/` contains mountain/planet originals, geographic data, individual vector layers, scene parameters and TypeScript integration references. `source/icons/` contains 30 original vector icons. `source/artwork/` contains four editorial covers and the contact envelope. `source/templates/` contains device frames and three clearly labelled project concepts.

The HTML/CSS page layouts and interaction studies are editable in `catalogue/`; `tools/build-pages.cjs` is their authoring source. Edit the generator and rebuild to avoid losing changes.

`exports/` contains optimized deliverables. `previews/` contains review evidence, including eight storyboard beats, component states and five side-by-side reference comparisons. Never use those full-page images as production website backgrounds.

## Rebuild order

```sh
npm run assets
node tools/build-glb.cjs
node tools/build-pages.cjs
npm run preview
# In another terminal:
npm run capture
node tools/comparison-boards.cjs
node tools/manifest.cjs
npm run verify
node tools/manifest.cjs
```

Image-generation outputs are committed and require no regeneration service to rebuild exports. No paid third-party imagery, video, asset library or animation generation service was used.
