'use client';

import gsap from 'gsap';

/** Fade-up a ref element on mount. Returns ctx for cleanup. */
export function fadeUpOnMount(
  el: HTMLElement | null,
  opts?: { delay?: number; duration?: number },
): gsap.Context {
  const ctx = gsap.context(() => {
    gsap.from(el, {
      opacity: 0,
      y: 20,
      duration: opts?.duration ?? 0.4,
      ease: 'power2.out',
      delay: opts?.delay ?? 0,
    });
  });
  return ctx;
}

/** Scale hover effect — attach to onMouseEnter/Leave. */
export function hoverScale(el: HTMLElement | null, scale = 1.05) {
  return {
    onMouseEnter: () => gsap.to(el, { scale, duration: 0.15, ease: 'power2.out' }),
    onMouseLeave: () => gsap.to(el, { scale: 1, duration: 0.15, ease: 'power2.out' }),
  };
}

/** Stagger children of a container from bottom. */
export function staggerChildren(
  container: HTMLElement | null,
  selector: string,
  opts?: { stagger?: number; delay?: number },
): gsap.Context {
  const ctx = gsap.context(() => {
    const items = container?.querySelectorAll(selector);
    if (!items || items.length === 0) return;
    gsap.from(items, {
      opacity: 0,
      y: 10,
      stagger: opts?.stagger ?? 0.07,
      duration: 0.3,
      ease: 'power2.out',
      delay: opts?.delay ?? 0,
    });
  }, container ?? undefined);
  return ctx;
}

/** Pop scale on mount. */
export function popIn(el: HTMLElement | null, delay = 0): gsap.Context {
  const ctx = gsap.context(() => {
    gsap.from(el, {
      scale: 0,
      duration: 0.4,
      ease: 'back.out(2)',
      delay,
    });
  });
  return ctx;
}

/** Infinite rotation loop (for loading animations). */
export function spinForever(el: SVGElement | HTMLElement | null): gsap.core.Tween {
  return gsap.to(el, {
    rotation: 360,
    duration: 2,
    repeat: -1,
    ease: 'none',
    transformOrigin: 'center center',
  });
}
