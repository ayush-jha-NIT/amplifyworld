# Module 6 — Homepage Experience Completion

**Objective:** Implement the remaining homepage sections after the Module 5 mountain-to-globe cinematic hero, guided by `docs/design/PAGE_DESIGN_SPEC.md` and `design-assets/catalogue/home.html`.

## Delivered

1. **Services:** Six separate source-of-truth service categories, descriptive copy and original matching icon SVGs, in a 3-column desktop / 2-column tablet / 1-column mobile responsive grid. Each card links to the existing Contact route; there are no broken imaginary service pages or forms.
2. **Why AmplifyWorld:** Growth-partner positioning in a 40/60-style split composition, with a 2×2 grid of authentic reusable design-system icons and an About CTA.
3. **Featured concepts:** Three responsive illustrated project cards (website, performance campaign and local discovery), using the original design-kit SVGs and **explicit Concept / Placeholder labels**. No fabricated clients, outcomes or live-demo URLs. Portfolio CTA points to the existing route.
4. **Process:** Discover → Strategize → Execute → Grow, with four icons, semantic `<ol>` ordering and a 2×2 mobile layout.
5. **Final CTA:** Original violet Earth-horizon composition, a WhatsApp CTA with the verified-contact gating from Module 4 and an accessible Contact alternative. Avoids duplicating the global footer invitation on the homepage.
6. **Motion:** GSAP progressive-enhancement reveals of headings and card groups, triggered only when the section enters view, 0.56-second staggered entrance, once per section. Reduced-motion users retain a static complete experience. No hidden content with JavaScript disabled.

## Integration and accessibility

- The previously delivered Module 5 hero and its 3D WebGL scene remain intact.
- All content remains server-rendered except the minimal reveal behavior.
- Section anchors `/#services`, `/#process`, `/#featured-work`, `/#why-us` are present and work with the sticky navigation's anchor offset.
- Original `design-assets/exports/icons/` and `design-assets/exports/templates/` were reused through existing Git blob IDs into `apps/web/public/design/`. The assets were not regenerated.
- Original typography, color tokens, focus treatment, semantic headings and separate service cards are preserved.
- Buttons lead to real routes; no unverified phone numbers, client statistics, testimonials or contact information are invented.
- The Module 6 section grid responds to 1440/1024/768/390/375px reference widths by using the approved breakpoints; final in-browser pixel-diff review is not implied by source-level checks.

## Acceptance checks

- Clean pnpm install
- Next.js + Express builds and TypeScript check
- Next.js/Express lint, shared tests, homepage section contract tests
- Verify the Merge PR CI and subsequent `main` CI before calling the module complete.

## Remaining scope

- Module 7: About page visual completion.
- Module 8: Real Portfolio carousel, filtering and detail behaviors. Current homepage work is explicitly labelled **Concept** pending permission-cleared real case studies.
- Module 9: Blog inline full-article reader.
- Module 10: Contact form.
- Modules 11–14: persistence, API, Resend, admin.
- Module 16: manual browser screenshot fidelity, keyboard + screen reader QA, perf/FPS profiling on real devices.

**External content still needed:** Verified WhatsApp business number, authorized project images/details, genuine testimonials (if desired), and approved contact/legal copy.
