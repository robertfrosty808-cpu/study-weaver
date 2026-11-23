import { useFinePointer, useReducedMotionPreference } from "@/hooks/use-motion-preference";
import { useEffect } from "react";
import { GlowCursor } from "./GlowCursor";
import { SmoothScroll } from "./SmoothScroll";

/**
 * One delegated, rAF-throttled pointer listener powers every spotlight and
 * CSS tilt card. Per-card listeners would be wasteful on long dashboards.
 */
function SpotlightAndTilt() {
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotionPreference();
  const enabled = finePointer && !reducedMotion;

  useEffect(() => {
    if (!enabled) return;

    let frame = 0;
    let latestX = 0;
    let latestY = 0;
    let latestTarget: EventTarget | null = null;
    let activeSpotlight: HTMLElement | null = null;
    let activeTilt: HTMLElement | null = null;

    const clearTilt = (element: HTMLElement | null) => {
      if (!element) return;
      element.removeAttribute("data-tilt-active");
      element.style.setProperty("--tilt-x", "0deg");
      element.style.setProperty("--tilt-y", "0deg");
    };

    const apply = () => {
      frame = 0;
      const target = latestTarget instanceof Element ? latestTarget : null;

      const spotlight = target?.closest<HTMLElement>("[data-spotlight]") ?? null;
      if (activeSpotlight && activeSpotlight !== spotlight) {
        activeSpotlight.removeAttribute("data-spotlight-active");
      }
      if (spotlight) {
        const rect = spotlight.getBoundingClientRect();
        spotlight.style.setProperty("--spot-x", `${latestX - rect.left}px`);
        spotlight.style.setProperty("--spot-y", `${latestY - rect.top}px`);
        spotlight.setAttribute("data-spotlight-active", "true");
        activeSpotlight = spotlight;
      } else {
        activeSpotlight = null;
      }

      const tilt = target?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (activeTilt && activeTilt !== tilt) clearTilt(activeTilt);
      if (tilt) {
        const rect = tilt.getBoundingClientRect();
        const max = Number(tilt.dataset.tilt) || 5;
        const px = (latestX - rect.left) / Math.max(rect.width, 1) - 0.5;
        const py = (latestY - rect.top) / Math.max(rect.height, 1) - 0.5;
        tilt.style.setProperty("--tilt-x", `${(-py * max * 2).toFixed(2)}deg`);
        tilt.style.setProperty("--tilt-y", `${(px * max * 2).toFixed(2)}deg`);
        tilt.setAttribute("data-tilt-active", "true");
        activeTilt = tilt;
      } else {
        activeTilt = null;
      }
    };

    const onMove = (event: PointerEvent) => {
      latestX = event.clientX;
      latestY = event.clientY;
      latestTarget = event.target;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      activeSpotlight?.removeAttribute("data-spotlight-active");
      activeSpotlight = null;
      clearTilt(activeTilt);
      activeTilt = null;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onLeave, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onLeave);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
      activeSpotlight?.removeAttribute("data-spotlight-active");
      clearTilt(activeTilt);
    };
  }, [enabled]);

  return null;
}

function ScrollReveal() {
  const reducedMotion = useReducedMotionPreference();

  useEffect(() => {
    const elements = () => Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])"));

    if (reducedMotion) {
      elements().forEach((element) => element.setAttribute("data-revealed", "true"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "true");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );

    const observe = () => elements().forEach((element) => observer.observe(element));
    observe();

    const mutations = new MutationObserver(observe);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [reducedMotion]);

  return null;
}

export function InteractiveEffects() {
  return (
    <>
      <GlowCursor />
      <SpotlightAndTilt />
      <ScrollReveal />
      <SmoothScroll />
    </>
  );
}
