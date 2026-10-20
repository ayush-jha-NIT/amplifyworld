import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(new URL("../" + file, import.meta.url), "utf8");

test("home renders the production cinematic hero without removing other sections", () => {
  const page = read("app/page.tsx");
  assert.match(page, /<HomeHero\s*\/>/);
  assert.match(page, /id="services"/);
  assert.match(page, /id="process"/);
  const hero = read("components/home/home-hero.tsx");
  assert.match(hero, /We Amplify/);
  assert.match(hero, /Your Business Growth/);
  assert.match(hero, /Talk to Amplify World/);
  assert.match(hero, /\/portfolio/);
});

test("scene uses all four ordered milestones, authentic assets, and exposes controls", () => {
  const scene = read("components/home/hero-scene.tsx");
  for (const label of ['"Strategy"', '"Marketing"', '"Technology"', '"Scalable Growth"']) {
    assert.ok(scene.includes(label), label);
  }
  assert.ok(scene.indexOf('"Strategy"') < scene.indexOf('"Marketing"'));
  assert.ok(scene.indexOf('"Marketing"') < scene.indexOf('"Technology"'));
  assert.ok(scene.indexOf('"Technology"') < scene.indexOf('"Scalable Growth"'));
  for (const token of ["getPointAtLength", "strokeDashoffset", "gsap.timeline", "data-scene-mark", "Replay journey", "Pause motion", "heroTime", "matchMedia", "IntersectionObserver", "webglcontextlost"]) {
    assert.ok(scene.includes(token) || read("components/home/hero-earth.tsx").includes(token), token);
  }
  assert.match(scene, /\/design\/brand\/logo-emblem\.webp/);
  assert.match(scene, /ssr: false/);
});

test("globe implements independent axial tilt, spin, orbits, atmosphere and low-power settings", () => {
  const globe = read("components/home/hero-earth.tsx");
  for (const token of ["useFrame", "useLoader", "rotation.y", "rotation.z", "23.4", "72", "28", "42", "shaderMaterial", "StarParticles", "frameloop", "powerPreference", "onUnavailable"]) {
    assert.ok(globe.includes(token), token);
  }
});

test("styles provide responsive, reduced motion and fallback imagery", () => {
  const css = read("app/globals.css");
  for (const token of [".cinematic-hero", ".hero-scene-stage", ".globe-still", ".hero-scene-controls", "globe-fallback-640.webp", "@media (prefers-reduced-motion: reduce)"]) {
    assert.ok(css.includes(token), token);
  }
});
