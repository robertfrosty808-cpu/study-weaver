import { cn } from "@/lib/utils";
import { Link } from "react-router";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid place-items-center overflow-hidden rounded-[10px] text-white shadow-sm",
        "size-8",
        className,
      )}
      style={{ background: "linear-gradient(140deg, #253fb5 0%, #4a63e8 52%, #12968f 100%)" }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-[18px]">
        <path d="M6 18V6.8c0-.5.6-.8 1-.5l10 8.4c.4.3 1 0 1-.5V6" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M18.5 4.5l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3L16.7 6.3l1.3-.5.5-1.3Z" fill="white" opacity=".85" />
      </svg>
      <span className="pointer-events-none absolute inset-0 bg-white/10 opacity-0 transition-opacity hover:opacity-100" />
    </span>
  );
}

export function Logo({ className, to = "/" }: { className?: string; to?: string }) {
  return (
    <Link to={to} className={cn("group inline-flex items-center gap-2.5 outline-none", className)} aria-label="NoteForge home">
      <LogoMark />
      <span className="font-display text-[17px] font-extrabold tracking-[-0.03em]">
        Note<span className="text-primary">Forge</span>
      </span>
    </Link>
  );
}
