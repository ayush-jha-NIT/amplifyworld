# Animation playbook — Modules 4–10

The homepage sequence lasts **7.2 seconds**. It is autoplay on first entry, not a scroll-jacked intro. Content is readable and actionable immediately. A separate Earth motion study demonstrates actual 3D rotation; final production integration is intentionally outside this PR.

Sources: `source/scene/hero-timeline.ts`, `source/scene/Earth.reference.tsx`, `source/scene/scene-layout.json`, `source/scene/earth-scene.json`. Inspect the 8 exported storyboard beats in `previews/storyboard/`.

## Coordinate and layer contract

World viewBox: **1000 × 800**. Keep every scene layer on the same aspect-ratio stage. Use CSS cover only on decorative textures; never independently stretch road coordinates.

Road path, base to summit:

```svg
M 60 710
C 240 720 760 650 820 575
C 870 510 590 555 655 475
C 695 427 820 448 735 392
C 695 362 625 365 625 330
```

Milestone anchors: Strategy (333,677), Marketing (745,610), Technology (662,490), Scalable Growth (625,330). Sign visual offsets are above the anchors; the stem meets terrain. The source SVG signs are 220 × 96; essential label text should remain HTML in production.

Layers back→front: starfield z0; Earth/back orbit z1; distant peaks z2; main terrain z3; road z4; emblem z5; foreground z6; milestone text z7; front orbital accents as locally masked z8; controls z10. Back and front orbit segments must be depth-tested in WebGL rather than drawing a full front ring across the Earth.

## Timed hero storyboard

| Time | Choreography | Exact motion / easing | Exit state |
|---|---|---|---|
| 0.00–0.50 | Dark scene establishes | Terrain visible; globe at 28% opacity; starfield static | Headline/CTAs already usable |
| 0.50–1.10 | Traveling light begins | Road progress 0→~14%; total path drawing 4.3s, linear; 5px pulse follows `getPointAtLength` | Lower road lit |
| 1.10–1.55 | Strategy | opacity 0→1, y 8→0, .45s `power3.out` | Sign remains |
| 2.10–2.55 | Marketing | Same .45s reveal, coherent with ascending light | Both earlier signs remain |
| 3.20–3.65 | Technology | Same .45s reveal | Three signs remain |
| 4.30–4.75 | Scalable Growth | Same .45s reveal at summit | All milestones visible |
| 4.90–5.70 | Authentic logo resolves | Clip inset(100% 0 0 0)→inset(0), opacity 0→1, .8s `power3.out`; travel pulse fades by 5.2s | Exact full emblem, no morph |
| 5.70–6.90 | Attention connects to Earth | Globe opacity .28→1 over 1.2s `power2.out`; orbit node begins near arrow-facing quadrant | Globe/orbits fully visible |
| 6.90–7.20 | Settle | .3s hold, no text movement | Stable final composition |
| 7.20 onward | Ambient state | Earth 1 revolution / 72s; orbit nodes 28s and 42s; no repeated road loop | Pausable ongoing motion |

Storyboard exports use 0, 1.55, 2.55, 3.65, 4.75, 5.7, 6.9 and 7.2s, capturing the resolved end of each beat. The catalogue frame links should use these same times. The road/light timing is a continuous visual journey; signs do not behave like unrelated popups.

No camera translation is necessary for the 2.5D mountain. An optional pointer parallax is capped at 12px desktop foreground, 6px background, .6s smoothing. Disable on touch, reduced motion and during keyboard focus. Never move the CTA hit target with parallax.

First visit plays once. Returning via history restores the complete scene. Replay resets only scene progress, not page content/scroll. Pause freezes both the intro and ambient loops. Resume continues from the current time. `seek(seconds)` is deterministic for QA. Destroy the GSAP context, observers and visibility listener on unmount.

## Earth, materials and 3D implementation

| Property | Target |
|---|---|
| Camera | perspective FOV 35°, position [0,.2,5.8], near .1, far 20 |
| Sphere | radius 1, 64 longitude × 32 latitude segments desktop; 40 × 24 mobile |
| Axial tilt | 23.4° around z; rotate only the sphere's y for revolution |
| Spin | `delta * 2π / 72`; clamp resumed delta to .05s |
| Albedo | 2048 × 1024 desktop, 1024 × 512 mobile, sRGB |
| Emissive | same UVs, sRGB, intensity .6; decorative network nodes are not real performance data |
| Surface | roughness .84, metalness .08 |
| Key light | [-3,3,4], lavender, intensity 3.2 |
| Fill | ambient lavender, intensity 1.4 |
| Rim light | [3,-1,-2], violet, intensity 3 |
| Atmosphere | radius 1.035, additive shader, depthWrite false, rim `pow(1-dot(N,V),3.2)` |
| Orbit 1 | radius 1.38, rotations [.8,0,-.45], 28s node period |
| Orbit 2 | radius 1.56, rotations [1.4,0,.35], 42s node period |
| Nodes | sphere radius .026, 12 × 8 geometry; reuse material |
| Particles | deterministic seed, 96 desktop / 24 mobile; one Points draw call |
| Pixel ratio | max 1.5 desktop / 1.25 mobile; cap further after sustained slow frames |

The GLB contains named EarthAxialTilt, EarthRevolve and independent OrbitPrimary/OrbitSecondary nodes plus embedded geographic texture. Atmosphere and particles are runtime enhancements supplied by the editable scene study. GLB does not contain a fake baked rotation animation; runtime controls rotation and accessibility state.

`Earth.reference.tsx` gives the React Three Fiber mesh/material contract; `catalogue/earth-study.js` contains the complete orbit/atmosphere study. Port named geometry/material settings into the production client component. Keep all text in server-rendered HTML. Use a client-only dynamic import for the canvas, with a still image occupying the exact dimensions from first paint.

Show the detailed Earth beauty image for reduced motion, save-data, no WebGL or context loss. The smaller geographic SVG is a second fallback. The procedural geographic material is an intentional low-cost interpretation; the high-detail surface texture is available as an optional richer material. Do not pretend the generated beauty still is itself a 3D model or a measured satellite image.

Pause rendering when outside the viewport or the document is hidden. R3F `frameloop="demand"` for paused/static scenes; `always` only while active. Dispose geometry, materials, textures and observers. No React state updates inside the frame loop. No postprocessing bloom dependency is required; the rim shader and a small CSS halo provide the effect.

## Interaction timelines

| Interaction | Trigger | Duration / easing | Start → end | Reduced motion |
|---|---|---|---|---|
| Navbar active | route selection | .16s ease-out | underline opacity 0→1 | immediate |
| Menu | button | .20s power2.out | opacity 0→1, y -8→0 | immediate |
| Primary hover | pointer | .16s ease-out | y 0→-2, glow strengthens | color only |
| Section reveal | 15% visible, once | .56s power3.out | opacity .0→1, y 12→0, stagger .06s | fully visible |
| Route enter | navigation | .24s power2.out | opacity .6→1; no screen-covering loader | immediate |
| Portfolio next | button/swipe | .62s power3.out | current x0→-16%, scale1→.9, rotateY0→18°, opacity1→.5; incoming x23%→0, scale.9→1, rotateY-24°→0 | replace instantly |
| Portfolio previous | button/swipe | .62s power3.out | inverse card direction | replace instantly |
| Filter change | filter/search | .18s exit + .32s enter | fade/8px translate; preserve control focus | immediate |
| Project details | card/button | .24s power2.out | modal opacity0→1, y12→0; no large zoom | immediate |
| Blog reader | card | .28s power2.out | opacity0→1; scroll once to reader heading | instant scroll |
| Article close | button/Back | .16s | remove reader, restore list scroll/focus | immediate |
| Reading progress | scroll | direct, no delayed tween | 0→100 over article range | same semantic progress |
| Form focus | focus | .16s | boundary/focus ring only | immediate |
| Form error | submit | .18s opacity | inline message appears, no shake | immediate |
| Form sending | submit | while pending | fixed label “Sending…”; small optional spinner | static busy icon |
| Form success/failure | API result | .24s fade | message replaces status region | immediate |

Carousel focus stays on the activated arrow/indicator; disabled adjacent card contents must not become keyboard stops. Ignore overlapping navigation during the transition or coalesce to the latest direction. Swipes must not cancel vertical scrolling; use `touch-action: pan-y`.

Blog reader is not a modal: never trap focus or lock page scrolling. Preserve list scroll in history state and put the article slug in the query. Handle `popstate`. Don't animate an article's height from zero while simultaneously scrolling over it; insert reserved content, then fade.

## Performance and accessibility budgets

- Initial hero image payload target: ≤650KB phone, ≤1.2MB desktop including the beauty still and mountain, excluding optional WebGL code; measured exported sizes are in the manifest.
- 3D enhanced download target: ≤1.5MB compressed across lazy code + textures; verify real production compression later.
- One canvas on Home, not five separate persistent canvases. About/Contact use still artwork with restrained transitions.
- Aim for ≤12 draw calls and <15k triangles mobile; cap DPR before lowering visual quality.
- Motion never blocks interaction; no flashing; no rapid full-screen luminance changes.
- Reduced-motion chooses the complete still scene from first paint. No looping Earth, orbit, parallax or road pulse.
- Save-data/low-power users may retain the detailed still indefinitely. Never substitute a blank rectangle.
- Core Web Vitals, real handset FPS, thermal behavior and memory must be tested in production Module 16. The design preview results are not those measurements.

Official references consulted: [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia/), [R3F performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance), [Three.js documentation](https://threejs.org/docs/). Pin and audit dependency versions in the later application PR.
