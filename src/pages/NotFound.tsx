import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Compass } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-5">
      <div aria-hidden className="paper-grid pointer-events-none absolute inset-0" />
      <div className="relative w-full max-w-md text-center">
        <div className="mb-10 flex justify-center">
          <Logo />
        </div>
        <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-border bg-card text-primary shadow-sm">
          <Compass className="size-5" />
        </div>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">404</p>
        <h1 className="font-display mt-2 text-3xl font-extrabold tracking-[-0.03em]">This page wandered off.</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          It may have moved, or the link may be incomplete. Your study sets are safe.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Button asChild>
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 size-4" /> Back to dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
