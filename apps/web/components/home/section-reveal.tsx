"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * Server content stays visible without JS, IntersectionObserver or animations.
 * Observer and media listeners are explicitly disposed on unmount, including
 * client navigation and Strict Mode effect replays.
 */
export function SectionReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;
    const items = Array.from(section.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!items.length) return;

    let observer: IntersectionObserver | null = null;
    let stopped = false;
    const context = gsap.context(() => {
      const animation = gsap.fromTo(
        items,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.56, stagger: 0.06,
          ease: "power3.out", paused: true, clearProps: "opacity,visibility,transform" }
      );
      observer = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting || stopped) return;
        stopped = true;
        animation.play();
        observer?.disconnect();
      }, { threshold: 0.15 });
      observer.observe(section);
    }, section);

    const respectChange = () => {
      if (!motion.matches) return;
      stopped = true;
      observer?.disconnect();
      context.revert();
      gsap.set(items, { clearProps: "opacity,visibility,transform" });
    };
    motion.addEventListener("change", respectChange);
    return () => {
      stopped = true;
      observer?.disconnect();
      motion.removeEventListener("change", respectChange);
      context.revert();
      gsap.set(items, { clearProps: "opacity,visibility,transform" });
    };
  }, []);
  return <div ref={sectionRef} className={className}>{children}</div>;
}
