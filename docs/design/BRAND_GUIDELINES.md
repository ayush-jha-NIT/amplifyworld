# AmplifyWorld — Brand system v1.0

Design handoff for Modules 2–3. Production application implementation remains in Modules 4–10. Read alongside the original master prompt and Module 0.

## Source authority

Both supplied logos and all five approved page images were inspected. Exact originals are preserved in `design-assets/source/brand/` and `design-assets/source/references/`. Reference screenshots are never used as whole-page production backgrounds.

The wide logo is 2069 × 760 pixels. Its original pixels, lettering, arrow, proportions and gradient are retained in the derivative crops. The supplied circular logo is preserved separately. The emblem and arrow are sourced from the wide artwork; no substitute AW glyph was designed. See `source/brand/regions.json`.

**Raster-source limitation:** no original vector paths were supplied. The editable SVG logo containers embed the original raster rather than pretending to be infinitely scalable vectors. Use the provided high-resolution derivatives within their recorded size. An official vector master can later replace the embedded raster without changing the logo's layout contract.

## Color

Raw source-pixel evidence lives in `source/brand/palette-samples.json`.

| Sample coordinate in original wide logo | Color | Role |
|---|---|---|
| 420,448 | `#5003dc` | Deep purple |
| 600,330 | `#5e03df` | Purple midtone |
| 665,220 | `#9d17f8` | Vivid violet |
| 550,457 | `#d94efb` | Magenta highlight |
| 290,421 | `#f8f7fb` | Logo white |

The editable tokens use a palette derived from these samples. Surface and semantic colors are interface decisions, not purported samples from the logo. Primary control fills are darker than decorative magenta so white labels remain legible.

| Semantic token | Value | Use |
|---|---|---|
| canvas | `#03040a` | Page background |
| surface | `#0b0b16` | Inputs, neutral cards |
| raised | `#161024` | Elevated panels |
| text | `#f8f5fc` | Body and headings |
| muted | `#beb7ce` | Secondary copy |
| border | `#443052` | Decorative containment |
| focus | `#edb7ff` | Keyboard outline |
| success | `#9ae0c2` | Success text + icon |
| error | `#ffb5cb` | Error text + icon |

Use the machine-readable JSON, CSS custom properties and Tailwind mapping under `design-assets/source/`. The machine-generated verification report records contrast ratios. Decorative card borders do not carry essential information. Controls use a stronger boundary or focus outline; errors never rely on color alone.

## Type and rhythm

Plus Jakarta Sans variable, 200–800, is bundled with its SIL Open Font License. The original reference font was not supplied; this family closely preserves the rounded, dense headline character while remaining available to the development team.

| Style | Desktop | Tablet | Mobile | Weight / leading |
|---|---:|---:|---:|---|
| Display | 76 | 50–60 | 42 | 800 / 1.03–1.06 |
| H2 | 40 | 34 | 30 | 800 / 1.12 |
| H3 | 20 | 20 | 18–20 | 700 / 1.3 |
| Body | 16–17 | 15–16 | 15–16 | 400 / 1.65 |
| Article | 18 | 18 | 17 | 400 / 1.8 |
| Control | 14 | 12–14 | 12–14 | 700 / 1.4 |
| Overline | 10–11 | 10 | 8–10 | 700 / 1.5 |

Overlines and milestone signs are decorative/secondary. Essential instructions and labels use readable body/control sizing. Hero milestone names also appear in the scene accessible description and should be exposed as a semantic ordered list in production.

The base rhythm is 8px: 8, 16, 24, 32, 40, 48, 64, 80, 96, 128. Use 4px only for optical alignment. Content maximum is 1320px with 60px desktop, 32px tablet and 20px phone gutters. Card radius 16px, feature radius 24px, control radius 12px, button radius 999px.

## Surfaces and lighting

Glass recipe: solid dark fallback plus a subtle diagonal violet gradient; 1px border; optional 8px backdrop blur only for small overlaid controls. Never blur the whole page. Card depth comes from layered composition and restrained shadows, not continuous glow. Only primary CTAs, the road, Earth rim and selected carousel card receive luminous emphasis.

Shadows and gradients are exported tokens. Text is never baked into the mountain, planet, editorial cover or contact artwork. The logo is the intentional exception because the provided artwork contains its official wordmark.

## Brand copy

- Hero: **We Amplify Your Business Growth**
- Services: **Growth Services Built for Modern Businesses**
- Navbar WhatsApp: **Let's Grow**
- Main WhatsApp: **Talk to Amplify World**
- Essence: **Strategy | Technology | Marketing**

Use all six exact service names from Module 0. Do not publish the reference mockups' invented client names, metrics, testimonials, author portraits, business email, phone, office, hours or response SLA. Current project cards and article copy are prominently labelled Concept / Placeholder or Design sample. Mission/vision wording is proposed brand copy for review, not a historical company claim.

## Logo use

Keep the mark upright. Animate opacity, clipping and small translations, not the shape or lettering. Minimum wide logo width: 180px in normal desktop navigation, compact width 150px on phones. The emblem can be used at 56px and above. Maintain clear space of at least 0.15 × emblem height. The circular source is for avatars/social applications; the navigation uses the wide derivative. Do not use a tiny full tagline in mobile navigation.

Source geometry crops are documented. The crop/export process does not redraw the mark. Source files remain untouched. A transparent, keyed derivative is allowed only for the known near-black background of the owned artwork; retain the source and compare its silhouette at 100%.
