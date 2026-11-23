import { useFinePointer, useReducedMotionPreference } from "@/hooks/use-motion-preference";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

const INTERACTIVE = 'a, button, [role="button"], [data-cursor-grow], summary';

/**
 * A soft violet-cyan glow that trails the pointer with spring physics. It is
 * deliberately excluded from the notes studio, where reading and writing need
 * a calm surface, and is never rendered for touch or reduced-motion users.
 */
export function GlowCursor() {
  const location = useLocation();
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotionPreference();
  const inNotesStudio = location.pathname.startsWith("/notes/");
  const enabled = finePointer && !reducedMotion && !inNotesStudio;

  const pointerX = useMotionValue(-200);
  const pointerY = useMotionValue(-200);
  const x = useSpring(pointerX, { stiffness: 280, damping: 30, mass: 0.55 });
  const y = useSpring(pointerY, { stiffness: 280, damping: 30, mass: 0.55 });
  const scale = useSpring(1, { stiffness: 320, damping: 26 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return;
    }

    let frame = 0;
    let latestX = 0;
    let latestY = 0;
    let latestTarget: EventTarget | null = null;

    const apply = () => {
      pointerX.set(latestX);
      pointerY.set(latestY);
      const element = latestTarget instanceof Element ? latestTarget.closest(INTERACTIVE) : null;
      scale.set(element ? 1.45 : 1);
      frame = 0;
    };

    const onMove = (event: PointerEvent) => {
      latestX = event.clientX;
      latestY = event.clientY;
      latestTarget = event.target;
      setVisible(true);
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled, pointerX, pointerY, scale]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100]"
      style={{ x, y, opacity: visible ? 1 : 0 }}
    >
      <motion.div
        style={{
          scale,
          background:
            "radial-gradient(circle, rgba(167,139,250,0.34) 0%, rgba(34,211,238,0.18) 42%, rgba(34,211,238,0) 72%)",
          filter: "blur(2px)",
        }}
        className="-ml-[85px] -mt-[85px] size-[170px] rounded-full will-change-transform"
      />
    </motion.div>
  );
}
