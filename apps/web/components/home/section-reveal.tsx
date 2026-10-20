"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * Progressive enhancement: the server renders everything fully visible.
 * Scroll motion applies only where IntersectionObserver and normal-motion
 * preferences are supported. Content never depends on an animation to exist.
 */
export function SectionReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;

    const items = Array.from(section.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (items.length === 0) return;

    const context = gsap.context(() => {
      const animation = gsap.fromTo(
        items,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.56, stagger: 0.06, ease: "power3.out", paused: true, clearProps: "opacity,visibility,transform" }
      );

      let played = false;
      const observer = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting || played) return;
        played = true;
        animation.play();
        observer.disconnect();
      }, { threshold: 0.15 });

      const respectChange = () => {
        if (motion.matches) {
          animation.progress(1);
          observer.disconnect();
        }
      };

      observer.observe(section);
      motion.addEventListener("change", respectChange);

      return () => {
        observer.disconnect();
        motion.removeEventListener("change", respectChange);
      };
    }, section);

    return () => {
      context.revert();
      gsap.set(items, { clearProps: "opacity,visibility,transform" });
    };
  }, []);

  return <div ref={sectionRef} className={className}>{children}</div>;
}
