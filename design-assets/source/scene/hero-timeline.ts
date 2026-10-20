import { gsap } from 'gsap';
/**
 * Isolated Module 5 integration reference. Mount into an SVG/DOM scene with the
 * documented selectors. All text/CTAs must remain visible outside this scope.
 * Timings agree with ANIMATION_PLAYBOOK.md and the time-addressable HTML study.
 */
export function createHeroTimeline(root: HTMLElement, setEarthRunning: (running: boolean) => void) {
  const road = root.querySelector<SVGPathElement>('#road-progress');
  const pulse = root.querySelector<SVGCircleElement>('#travel-light');
  const mark = root.querySelector<HTMLElement>('.scene-mark');
  const globe = root.querySelector<HTMLElement>('.scene-globe');
  const milestones = Array.from(root.querySelectorAll<HTMLElement>('.milestone'));
  if (!road || !pulse || !mark || !globe || milestones.length !== 4) throw new Error('Incomplete scene asset contract');
  const length = road.getTotalLength();
  const progress = { value: 0 };
  let timeline: gsap.core.Timeline | undefined;
  let userPaused = false;
  const media = gsap.matchMedia();
  const context = gsap.context(() => {
    media.add({ reduced: '(prefers-reduced-motion: reduce)', mobile: '(max-width: 639px)', desktop: '(min-width: 640px)' }, (ctx) => {
      const reduced = Boolean(ctx.conditions?.reduced);
      setEarthRunning(false);
      if (reduced) {
        gsap.set([mark, globe, ...milestones], { autoAlpha: 1, y: 0 });
        gsap.set(road, { strokeDasharray: length, strokeDashoffset: 0 });
        gsap.set(pulse, { autoAlpha: 0 });
        return;
      }
      gsap.set(road, { strokeDasharray: length, strokeDashoffset: length });
      gsap.set([mark, ...milestones], { autoAlpha: 0 });
      gsap.set(globe, { autoAlpha: .28 });
      gsap.set(pulse, { autoAlpha: 0 });
      progress.value = 0;
      timeline = gsap.timeline({ paused: true, onComplete: () => setEarthRunning(!userPaused) });
      timeline.to(pulse, { autoAlpha: 1, duration: .2 }, .5)
        .to(progress, { value: 1, duration: 4.3, ease: 'none', onUpdate: () => {
          const p = road.getPointAtLength(progress.value * length);
          road.style.strokeDashoffset = String(length * (1 - progress.value));
          pulse.setAttribute('cx', String(p.x)); pulse.setAttribute('cy', String(p.y));
        } }, .5);
      [1.1, 2.1, 3.2, 4.3].forEach((start, i) => timeline!.fromTo(milestones[i], { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: .45, ease: 'power3.out' }, start));
      timeline.to(pulse, { autoAlpha: 0, duration: .3 }, 4.9)
        .fromTo(mark, { autoAlpha: 0, clipPath: 'inset(100% 0 0 0)' }, { autoAlpha: 1, clipPath: 'inset(0% 0 0 0)', duration: .8, ease: 'power3.out' }, 4.9)
        .to(globe, { autoAlpha: 1, duration: 1.2, ease: 'power2.out' }, 5.7)
        .to({}, { duration: .3 }, 6.9);
      timeline.play();
      return () => { timeline?.kill(); setEarthRunning(false); };
    });
  }, root);
  let inView = true;
  const sync = () => {
    const active = inView && !document.hidden && !userPaused;
    if (active) timeline?.resume(); else timeline?.pause();
    setEarthRunning(active && !matchMedia('(prefers-reduced-motion: reduce)').matches && (timeline?.progress() ?? 0) === 1);
  };
  const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }, { threshold: .05 });
  observer.observe(root); document.addEventListener('visibilitychange', sync);
  return {
    pause(paused: boolean) { userPaused = paused; sync(); },
    replay() { userPaused = false; progress.value = 0; setEarthRunning(false); timeline?.restart(); },
    seek(seconds: number) { timeline?.pause().seek(Math.max(0, Math.min(seconds, 7.2))); setEarthRunning(false); },
    destroy() { observer.disconnect(); document.removeEventListener('visibilitychange', sync); media.revert(); context.revert(); setEarthRunning(false); }
  };
}
