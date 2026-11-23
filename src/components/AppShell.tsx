import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { FolderOpen, Home, LogOut, Menu, PenLine, Plus, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

const NAV = [
  { label: "Dashboard", href: "/dashboard", hash: "", icon: Home },
  { label: "My notes", href: "/dashboard#projects", hash: "#projects", icon: FolderOpen },
  { label: "Create notes", href: "/dashboard#compose", hash: "#compose", icon: PenLine },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const projects = useQuery(api.notes.list);

  const name = user?.name || (user?.isAnonymous ? "Guest student" : "Student");
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo to="/dashboard" />
        <ThemeToggle className="lg:hidden" />
      </div>

      <div className="px-4 pt-1">
        <Button
          className="h-10 w-full justify-start gap-2 rounded-xl shadow-sm"
          onClick={() => {
            setMobileOpen(false);
            navigate("/dashboard#compose");
          }}
        >
          <Plus className="size-4" />
          Create new notes
        </Button>
      </div>

      <nav className="mt-5 space-y-0.5 px-3" aria-label="Main navigation">
        {NAV.map((item) => {
          const active = location.pathname === "/dashboard" && location.hash === item.hash;
          return (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-7 px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">Recent notes</p>
      </div>
      <div className="mt-2 flex-1 overflow-y-auto px-3 pb-4">
        {projects === undefined ? (
          <div className="space-y-2 px-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-muted/70" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <p className="px-3 text-xs leading-5 text-muted-foreground">
            Your notes will appear here once you create your first set.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {projects.slice(0, 5).map((project) => (
              <li key={project._id}>
                <Link
                  to={`/notes/${project._id}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-start gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground"
                >
                  <span
                    className="mt-1 size-1.5 shrink-0 rounded-full"
                    style={{
                      background:
                        project.status === "ready"
                          ? "var(--primary)"
                          : project.status === "error"
                            ? "var(--destructive)"
                            : "var(--muted-foreground)",
                    }}
                  />
                  <span className="line-clamp-2 leading-5">{project.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative mx-4 mb-4 overflow-hidden rounded-xl bg-[#141821] p-3.5 text-white">
        <div aria-hidden className="absolute -right-6 -top-8 size-20 rounded-full bg-[#3c56e0]/40 blur-2xl" />
        <div className="relative flex items-center gap-2 text-xs font-semibold">
          <Sparkles className="size-3.5 text-[#f2bf5e]" />
          Pro tip
        </div>
        <p className="relative mt-1.5 text-[11px] leading-5 text-white/60">
          Ask for a specific angle, like “explain it with analogies” or “prepare me for an exam”.
        </p>
      </div>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/12 text-[11px] font-bold text-primary">
            {initials || "N"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">{name}</p>
            <p className="truncate text-[10px] text-muted-foreground">{user?.email ?? "Signed in"}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            aria-label="Sign out"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:block">
        {sidebar}
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl lg:hidden">
        <Logo to="/dashboard" />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] border-r bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              {sidebar}
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="lg:pl-[264px]">{children}</main>
    </div>
  );
}
