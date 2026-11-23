import { useFinePointer, useReducedMotionPreference } from "@/hooks/use-motion-preference";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";

type MagneticProps = {
  children: ReactNode;
  className?: string;
  strength?: number;
};

/**
 * Pulls a call to action a few pixels toward the pointer. The movement is
 * capped so buttons never detach from their layout or become hard to click.
 */
export function Magnetic({ children, className, strength = 0.22 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotionPreference();
  const enabled = finePointer && !reducedMotion;

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 260, damping: 18, mass: 0.35 });
  const y = useSpring(rawY, { stiffness: 260, damping: 18, mass: 0.35 });
  const frame = useRef(0);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    const element = ref.current;
    if (!element) return;
    const { clientX, clientY } = event;
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rect = element.getBoundingClientRect();
      const offsetX = (clientX - (rect.left + rect.width / 2)) * strength;
      const offsetY = (clientY - (rect.top + rect.height / 2)) * strength;
      rawX.set(Math.max(-9, Math.min(9, offsetX)));
      rawY.set(Math.max(-7, Math.min(7, offsetY)));
      frame.current = 0;
    });
  };

  const reset = () => {
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = 0;
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      onBlur={reset}
    >
      {children}
    </motion.div>
  );
}
