import { useFinePointer, useReducedMotionPreference } from "@/hooks/use-motion-preference";
import { useEffect, useRef } from "react";

type Ripple = {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  hue: number;
};

type TrailPoint = { x: number; y: number; life: number };

/**
 * A lightweight canvas ripple field for the landing hero. It is intentionally
 * not a WebGL simulation: a handful of expanding rings and a soft pointer
 * wake stay smooth on ordinary laptops, and the effect never runs on touch or
 * reduced-motion devices.
 */
export function HeroFluid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotionPreference();
  const enabled = finePointer && !reducedMotion;

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let inView = true;
    let started = false;
    let lastTime = performance.now();
    let lastRippleTime = 0;
    let lastX = 0;
    let lastY = 0;

    const ripples: Ripple[] = [];
    const trail: TrailPoint[] = [];
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, alpha: 0, active: false };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!started) {
        pointer.x = pointer.targetX = width * 0.64;
        pointer.y = pointer.targetY = height * 0.38;
        started = true;
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!inside) {
        pointer.active = false;
        return;
      }

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      pointer.targetX = x;
      pointer.targetY = y;
      pointer.active = true;

      const now = performance.now();
      const distance = Math.hypot(x - lastX, y - lastY);
      if (now - lastRippleTime > 52 || distance > 24) {
        ripples.push({
          x,
          y,
          radius: 8,
          maxRadius: 62 + Math.random() * 78,
          life: 1,
          hue: Math.random() > 0.45 ? 265 : 190,
        });
        if (ripples.length > 16) ripples.shift();
        lastRippleTime = now;
        lastX = x;
        lastY = y;
      }

      trail.push({ x, y, life: 1 });
      if (trail.length > 14) trail.shift();
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const draw = (time: number) => {
      frame = 0;
      if (!inView || document.hidden) return;

      const delta = Math.min(Math.max((time - lastTime) / 16.667, 0.2), 2);
      lastTime = time;

      context.clearRect(0, 0, width, height);
      pointer.x += (pointer.targetX - pointer.x) * 0.08 * delta;
      pointer.y += (pointer.targetY - pointer.y) * 0.08 * delta;
      pointer.alpha += ((pointer.active ? 1 : 0) - pointer.alpha) * 0.07 * delta;

      if (pointer.alpha > 0.01) {
        const radius = Math.max(190, Math.min(width, height) * 0.52);
        const halo = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);
        halo.addColorStop(0, "rgba(139,92,246,0.14)");
        halo.addColorStop(0.42, "rgba(34,211,238,0.08)");
        halo.addColorStop(1, "rgba(34,211,238,0)");
        context.globalAlpha = pointer.alpha;
        context.fillStyle = halo;
        context.beginPath();
        context.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
      }

      for (let index = trail.length - 1; index >= 0; index -= 1) {
        const point = trail[index];
        point.life -= 0.045 * delta;
        if (point.life <= 0) {
          trail.splice(index, 1);
          continue;
        }
        context.fillStyle = `rgba(139,92,246,${(point.life * 0.055).toFixed(3)})`;
        context.beginPath();
        context.arc(point.x, point.y, 22 + (1 - point.life) * 28, 0, Math.PI * 2);
        context.fill();
      }

      for (let index = ripples.length - 1; index >= 0; index -= 1) {
        const ripple = ripples[index];
        ripple.life -= 0.014 * delta;
        ripple.radius += (ripple.maxRadius - ripple.radius) * 0.055 * delta;
        if (ripple.life <= 0) {
          ripples.splice(index, 1);
          continue;
        }

        const alpha = ripple.life;
        const violet = ripple.hue === 265;
        context.lineWidth = 1.35;
        context.strokeStyle = violet
          ? `rgba(167,139,250,${(alpha * 0.48).toFixed(3)})`
          : `rgba(34,211,238,${(alpha * 0.42).toFixed(3)})`;
        context.beginPath();
        context.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        context.stroke();

        context.lineWidth = 1;
        context.strokeStyle = `rgba(34,211,238,${(alpha * 0.22).toFixed(3)})`;
        context.beginPath();
        context.arc(ripple.x, ripple.y, ripple.radius * 0.7, 0, Math.PI * 2);
        context.stroke();
      }

      frame = requestAnimationFrame(draw);
    };

    const start = () => {
      if (!frame && inView && !document.hidden) {
        lastTime = performance.now();
        frame = requestAnimationFrame(draw);
      }
    };

    const intersection = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) start();
      },
      { threshold: 0.01 },
    );
    intersection.observe(canvas);

    const onVisibility = () => {
      if (!document.hidden) start();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      intersection.disconnect();
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
