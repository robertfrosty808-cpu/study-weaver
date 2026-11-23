import { useReducedMotionPreference } from "@/hooks/use-motion-preference";
import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

/**
 * Window-level smooth scrolling. Lenis is skipped entirely when reduced motion
 * is requested; the route-scroll reset still works in that case.
 */
export function SmoothScroll() {
  const reducedMotion = useReducedMotionPreference();
  const location = useLocation();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const onAnchorClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      const element = document.querySelector(hash);
      if (!(element instanceof HTMLElement)) return;
      event.preventDefault();
      lenis.scrollTo(element, { offset: -88, duration: 1.15 });
      window.history.replaceState(null, "", hash);
    };

    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element instanceof HTMLElement) {
        if (lenisRef.current) {
          lenisRef.current.scrollTo(element, { offset: -88, duration: 1.15 });
        } else {
          element.scrollIntoView({ block: "start" });
        }
        return;
      }
    }

    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [location.pathname, location.hash]);

  return null;
}
