import { cn } from "@/lib/utils";
import { Link } from "react-router";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid size-8 place-items-center overflow-hidden rounded-[10px] text-white shadow-sm",
        className,
      )}
      style={{ background: "linear-gradient(140deg, #2036a8 0%, #3c56e0 50%, #0b8f86 100%)" }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-[18px]">
        <path d="M7 6.5h9M7 12h6.5M7 17.5h9" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M18.2 3.8l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6.6-1.6Z" fill="#f7c15c" />
      </svg>
    </span>
  );
}

export function Logo({ className, to = "/" }: { className?: string; to?: string }) {
  return (
    <Link to={to} className={cn("group inline-flex items-center gap-2 outline-none", className)} aria-label="EduNotes Pro home">
      <LogoMark />
      <span className="font-display text-[17px] font-extrabold tracking-[-0.035em]">EduNotes</span>
      <span className="rounded-md bg-[#f2bf5e] px-1.5 py-[3px] font-display text-[8px] font-extrabold uppercase tracking-[0.14em] text-[#1b1a16]">
        Pro
      </span>
    </Link>
  );
}
