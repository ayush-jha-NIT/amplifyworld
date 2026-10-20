"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";

const EarthCanvas = dynamic(() => import("./hero-earth").then((module) => module.HeroEarth), {
  ssr: false,
  loading: () => null
});

export const ROAD_PATH =
  "M 60 710 C 240 720 760 650 820 575 C 870 510 590 555 655 475 C 695 427 820 448 735 392 C 695 362 625 365 625 330";

const MILESTONES = [
  { id: "strategy", label: "Strategy", x: 33.3, y: 84.6, start: 1.1 },
  { id: "marketing", label: "Marketing", x: 74.5, y: 76.25, start: 2.1 },
  { id: "technology", label: "Technology", x: 66.2, y: 61.25, start: 3.2 },
  { id: "scalable-growth", label: "Scalable Growth", x: 62.5, y: 41.25, start: 4.3 }
] as const;

type HeroControls = { pause: (paused: boolean) => void; replay: () => void };
type Connection = { saveData?: boolean };

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    const supported = Boolean(context);
    // Probe only. A real context belongs to the lazily mounted React Three Fiber canvas.
    if (context && "getExtension" in context) {
      const release = context.getExtension("WEBGL_lose_context");
      release?.loseContext();
    }
    return supported;
  } catch {
    return false;
  }
}

export function HeroScene() {
  const rootRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HeroControls | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [canUseWebGL, setCanUseWebGL] = useState(false);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const [earthReady, setEarthReady] = useState(false);
  const [earthRunning, setEarthRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const road = root.querySelector<SVGPathElement>("[data-road-progress]");
    const pulse = root.querySelector<SVGCircleElement>("[data-travel-light]");
    const globe = root.querySelector<HTMLElement>("[data-scene-globe]");
    const logo = root.querySelector<HTMLElement>("[data-scene-mark]");
    const signs = Array.from(root.querySelectorAll<HTMLElement>("[data-milestone]"));
    const orbitalLabels = Array.from(root.querySelectorAll<HTMLElement>("[data-orbital-label]"));
    if (!road || !pulse || !globe || !logo || signs.length !== 4) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    const saveData = Boolean(connection?.saveData);
    const totalLength = road.getTotalLength();

    let currentTimeline: gsap.core.Timeline | null = null;
    let currentContext: gsap.Context | null = null;
    let manuallyPaused = false;
    let inView = true;
    let isFinished = false;

    const sync = () => {
      const active = !manuallyPaused && inView && !document.hidden && !motionPreference.matches;
      if (active) currentTimeline?.resume();
      else currentTimeline?.pause();
      setEarthRunning(active && isFinished);
    };

    const init = () => {
      currentTimeline?.kill();
      currentContext?.revert();
      currentTimeline = null;
      currentContext = null;
      isFinished = false;
      manuallyPaused = false;
      setPaused(false);
      setFinished(false);
      setReducedMotion(motionPreference.matches);
      setCanUseWebGL(!motionPreference.matches && !saveData && supportsWebGL());
      setEarthRunning(false);

      currentContext = gsap.context(() => {
        if (motionPreference.matches) {
          gsap.set(road, { strokeDasharray: totalLength, strokeDashoffset: 0 });
          gsap.set([globe, logo, ...signs, ...orbitalLabels], { autoAlpha: 1, y: 0, clearProps: "clipPath" });
          gsap.set(pulse, { autoAlpha: 0 });
          isFinished = true;
          setFinished(true);
          root.dataset.heroState = "complete";
          return;
        }

        gsap.set(road, { strokeDasharray: totalLength, strokeDashoffset: totalLength });
        gsap.set([logo, ...signs, ...orbitalLabels], { autoAlpha: 0 });
        gsap.set(globe, { autoAlpha: 0.28 });
        gsap.set(pulse, { autoAlpha: 0 });
        const progress = { value: 0 };

        currentTimeline = gsap.timeline({
          paused: true,
          onUpdate: () => { root.dataset.heroTime = currentTimeline?.time().toFixed(2) ?? "0"; },
          onComplete: () => {
            isFinished = true;
            setFinished(true);
            root.dataset.heroState = "complete";
            sync();
          }
        });

        currentTimeline
          .to(pulse, { autoAlpha: 1, duration: 0.2 }, 0.5)
          .to(progress, {
            value: 1,
            ease: "none",
            duration: 4.3,
            onUpdate: () => {
              const point = road.getPointAtLength(progress.value * totalLength);
              road.style.strokeDashoffset = String(totalLength * (1 - progress.value));
              pulse.setAttribute("cx", String(point.x));
              pulse.setAttribute("cy", String(point.y));
            }
          }, 0.5);

        MILESTONES.forEach(({ start }, index) => {
          currentTimeline?.fromTo(signs[index]!,
            { autoAlpha: 0, y: 8 },
            { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" }, start);
        });

        currentTimeline
          .to(pulse, { autoAlpha: 0, duration: 0.3 }, 4.9)
          .fromTo(logo,
            { autoAlpha: 0, clipPath: "inset(100% 0 0 0)" },
            { autoAlpha: 1, clipPath: "inset(0% 0 0 0)", duration: 0.8, ease: "power3.out" }, 4.9)
          .to(globe, { autoAlpha: 1, duration: 1.2, ease: "power2.out" }, 5.7)
          .fromTo(orbitalLabels,
            { autoAlpha: 0, y: 7 },
            { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.08 }, 6.5)
          .to({}, { duration: 0.3 }, 6.9);
      }, root);

      root.dataset.heroState = motionPreference.matches ? "complete" : "playing";
      const requested = new URL(window.location.href).searchParams.get("heroTime");
      const inspectionTimeline = currentTimeline as gsap.core.Timeline | null;
      if (requested !== null && inspectionTimeline) {
        const seek = Number(requested);
        if (Number.isFinite(seek)) {
          manuallyPaused = true;
          setPaused(true);
          inspectionTimeline.pause(Math.max(0, Math.min(7.2, seek)));
          isFinished = seek >= 7.2;
          setFinished(isFinished);
          root.dataset.heroState = "inspection";
          setEarthRunning(false);
          return;
        }
      }
      sync();
    };

    controlsRef.current = {
      pause(nextPaused) {
        manuallyPaused = nextPaused;
        setPaused(nextPaused);
        sync();
      },
      replay() {
        if (!currentTimeline || motionPreference.matches) return;
        manuallyPaused = false;
        isFinished = false;
        setFinished(false);
        setPaused(false);
        setEarthRunning(false);
        root.dataset.heroState = "playing";
        currentTimeline.restart().pause();
        sync();
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = Boolean(entry?.isIntersecting);
      if (inView) setHasEnteredView(true);
      sync();
    }, { threshold: 0.05 });
    observer.observe(root);
    motionPreference.addEventListener("change", init);
    document.addEventListener("visibilitychange", sync);
    init();

    return () => {
      observer.disconnect();
      motionPreference.removeEventListener("change", init);
      document.removeEventListener("visibilitychange", sync);
      currentTimeline?.kill();
      currentContext?.revert();
      controlsRef.current = null;
    };
  }, []);

  return (
    <div ref={rootRef} className="hero-visual" role="group"
      aria-label="A glowing road climbs a mountain past Strategy, Marketing, Technology and Scalable Growth, leading to the AmplifyWorld logo and Earth.">
      <div className="hero-scene-stage" aria-hidden="true">
        <div className="hero-scene-stars" />
        <div className="hero-scene-globe" data-scene-globe>
          <div className="globe-halo" />
          <div className={"globe-still" + (earthReady && canUseWebGL ? " is-enhanced" : "")} />
          {canUseWebGL && hasEnteredView && (
            <EarthCanvas
              running={earthRunning && !reducedMotion}
              onReady={() => setEarthReady(true)}
              onUnavailable={() => { setCanUseWebGL(false); setEarthReady(false); }}
            />
          )}
          <span className="orbital-label orbital-label-ai" data-orbital-label>AI</span>
          <span className="orbital-label orbital-label-seo" data-orbital-label>SEO</span>
          <span className="orbital-label orbital-label-growth" data-orbital-label>GROWTH</span>
        </div>
        <div className="hero-scene-distant" />
        <div className="hero-scene-mountain" />
        <svg className="hero-scene-road" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid meet" focusable="false">
          <defs>
            <linearGradient id="hero-road-gradient" x1="0" x2="1" y1="1" y2="0">
              <stop offset="0" stopColor="#7924d8" />
              <stop offset=".6" stopColor="#d45dff" />
              <stop offset="1" stopColor="#f8bcff" />
            </linearGradient>
            <filter id="hero-road-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>
          <path d={ROAD_PATH} fill="none" stroke="#41195a" strokeWidth="13" strokeLinecap="round" opacity=".7" />
          <path d={ROAD_PATH} fill="none" stroke="#8923e2" strokeWidth="14" strokeLinecap="round" opacity=".8" filter="url(#hero-road-glow)" />
          <path data-road-progress d={ROAD_PATH} fill="none" stroke="url(#hero-road-gradient)" strokeWidth="5" strokeLinecap="round" />
          <circle data-travel-light r="9" cx="60" cy="710" fill="#f4c8ff" filter="url(#hero-road-glow)" />
        </svg>
        <div className="hero-scene-mark" data-scene-mark>
          <Image src="/design/brand/logo-emblem.webp" alt="" fill sizes="(max-width: 640px) 150px, 240px" style={{ objectFit: "contain" }} />
        </div>
        <div className="hero-scene-foreground" />
        {MILESTONES.map((item) => (
          <span className="hero-milestone" data-milestone key={item.id}
            style={{ left: item.x + "%", top: item.y + "%" }}>
            {item.label}
          </span>
        ))}
      </div>
      <ol className="sr-only" aria-label="AmplifyWorld growth journey">
        {MILESTONES.map((item) => <li key={item.id}>{item.label}</li>)}
      </ol>
      <div className="hero-scene-controls" aria-label="Animation controls">
        <button type="button" disabled={reducedMotion} onClick={() => controlsRef.current?.pause(!paused)}>
          {paused ? "Resume motion" : "Pause motion"}
        </button>
        <button type="button" disabled={reducedMotion} onClick={() => controlsRef.current?.replay()}>
          Replay journey
        </button>
      </div>
      <span className="sr-only" aria-live="polite">
        {reducedMotion ? "Motion is reduced. The final scene is shown." : finished ? "The growth journey has reached Earth." : ""}
      </span>
    </div>
  );
}
