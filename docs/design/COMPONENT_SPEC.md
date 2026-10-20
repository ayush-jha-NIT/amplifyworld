# Component contract — Module 2

Live visual catalogue: `design-assets/catalogue/index.html`. This isolated HTML/CSS preview is editable and intentionally disconnected from production APIs. JSON tokens and the CSS stylesheet are the design source of truth.

## Shared states

| Component | Geometry | Default / hover | Focus / active | Disabled / loading |
|---|---|---|---|---|
| Primary button | 48px min height, 24px inline inset, pill | Dark violet gradient, white label; hover 2px lift / stronger glow | 2px focus ring, 5px outside; pressed 1px down | 45% opacity; no lift; fixed-width “Sending…” + `aria-busy` |
| Secondary button | Same hit target, 1px violet edge | Transparent → raised violet surface | Same focus ring | Same disabled treatment |
| Icon button | 44–48px square | Dark fill, 1px edge | Accessible name mandatory; focus ring | Native disabled where appropriate |
| Input/select | 48px min height, radius 9–12px, 14px text | Dark fill, visible label | Focus outline + label remains visible | Retain label; do not blank previous value |
| Textarea | 130px min height, vertically resizable | Same input recipe | Same | Preserve input on retry |
| Service card | 16px radius, 24px inset, 58px icon | Glass recipe; arrow links to inquiry | Link gets ring; card is not an ambiguous nested button | No “loading” unless content actually fetches |
| Filter chip | 44px min height, 12px label | Dark pill edge | Selected gradient + `aria-pressed=true` | Native disabled only if unavailable |
| Project card | 3:2 visual, 16px shell | 1px border; 4px hover lift where pointer permits | Whole button or single link; no nested controls | Static skeleton retains ratio |
| Article card | 1.9:1 cover, title, category, metadata | Border strengthens; 4px lift | Focus ring; `aria-controls=reader` | Skeleton reserves visual/title dimensions |
| Dialog | max 760px, 24–32px inset | Dark solid elevated panel | Native modal focus trapping, Escape closes, restore trigger focus | Do not close while saving without explicit state design |

## Navigation and footer

Desktop navbar height 88px; tablet 76px; mobile 72px. Current-page label and underline identify location without color alone. Header remains in document flow in this preview; if sticky in production, reserve its height and update anchor scroll margins. No animation may delay navigation.

At widths below 1100px, collapse links into a disclosed menu; `aria-expanded`, `aria-controls`, visible close state and Escape-to-trigger behavior. Navigation is an ordinary disclosure, not an ARIA menu widget. Minimum 44px mobile targets; allow page scrolling when expanded. If the development team uses a modal drawer instead, add a focus trap and background inertness together.

Services → `/#services`; Process → `/#process`; Work → `/portfolio`. Pricing is omitted. No empty social, legal or privacy links. Production legal links must be added only after reviewed content exists. Footer contains genuine brand positioning, approved routes and service taxonomy.

## Form

Required: name, email, service, project details. Optional: phone and company. The preview tests a 20-character minimum for project details; backend validation policy remains a development decision. Phone must not be required without a business reason. Labels are persistent; placeholders are supplemental.

| State | Visual and behavior |
|---|---|
| Idle | Neutral boundary, instructions visible |
| Focus | Visible lavender outline, no layout shift |
| Invalid | Pink boundary + specific inline text, `aria-invalid`, linked error ID |
| Submitting | Button disabled; fixed width; “Sending…” and polite live status |
| Success | Green-tinted message + explicit confirmation; production only after durable API acknowledgement |
| Failed | Pink-tinted message; retain every input; retry action; no success claim |

First invalid field receives focus on submission. Server errors should also produce an error summary linked to fields. Submission does not transmit anything in this catalogue. `contact.html?state=failed` demonstrates the failure path after valid input.

WhatsApp buttons retain the required labels. While the business number is absent, the review preview opens an explanatory dialog; no `wa.me` destination is invented. In production, wire a verified E.164 number and URL-encoded message. If missing, present a truthful unavailable state or point to the inquiry flow with an appropriate label; do not claim chat was opened.

## Empty, loading and error

404: “A different direction.” + “This page could not be found.” + Back to Home. Filter empty: explain that nothing matches and offer Clear filters. Preserve the filter control focus. Skeletons mirror content dimensions and do not pulse under reduced motion. Never show fake projects while data is unavailable.

## Accessibility and content semantics

One H1 per route; semantic section headings; meaningful image alternatives; decorative artwork `alt=""`. Avoid duplicate narration of the logo beside the wordmark. Focus order follows reading order. Do not visually reorder form controls away from their DOM order.

Cards should have descriptive labels, not repeated “Read more” names. The carousel announces the selected project and position after explicit navigation; it never auto-advances. Mobile swipe is optional enhancement; arrows remain. Article TOC uses anchors; the reader is a normal page region, not a modal.

No flashing effects. Moving scenes have a visible pause. Reduced-motion removes continuous motion and transforms, revealing the completed scene immediately. Final integrated accessibility testing with a screen reader is still required in Module 16; the preview QA is not a certification.
