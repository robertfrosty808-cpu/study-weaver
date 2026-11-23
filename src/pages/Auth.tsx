import { LogoMark } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check, Loader2, Mail, Palette, PenLine, ShieldCheck, Sparkles, UserX } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(returnTo: string | null, fallback = "/dashboard") {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(searchParams.get("returnTo"), redirectAfterAuth);
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (err) {
      console.error("Email sign-in error:", err);
      setError(err instanceof Error ? err.message : "Failed to send the verification code. Please try again.");
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch (err) {
      console.error("OTP verification error:", err);
      setError("That code did not match. Check your inbox and try again.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (err) {
      console.error("Guest login error:", err);
      setError(err instanceof Error ? err.message : "Guest sign-in is unavailable right now.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-[#10131c] p-10 text-white lg:flex lg:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(60% 50% at 20% 10%, rgba(74,99,232,0.35), transparent 60%), radial-gradient(50% 45% at 90% 80%, rgba(18,150,143,0.28), transparent 60%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 70% 60% at 30% 20%, black, transparent 75%)",
          }}
        />

        <Link to="/" className="relative inline-flex items-center gap-2.5 self-start">
          <LogoMark />
          <span className="font-display text-[17px] font-extrabold tracking-[-0.03em]">NoteForge</span>
        </Link>

        <div className="relative mt-auto max-w-md pb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-medium text-white/70">
            <Sparkles className="size-3 text-[#9fb2ff]" />
            AI notes studio
          </div>
          <h2 className="font-display mt-5 text-[38px] font-extrabold leading-[1.08] tracking-[-0.035em]">
            Study notes that actually teach.
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/60">
            Bring a topic. Get a structured, deeply explained study guide — then edit it and restyle it until it feels like yours.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              { Icon: PenLine, text: "Edit every line, reorder every block" },
              { Icon: Palette, text: "Six editorial themes, one click apart" },
              { Icon: ShieldCheck, text: "Autosaved, always yours" },
            ].map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-[13px] text-white/75">
                <span className="grid size-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-[#9fb2ff]">
                  <Icon className="size-3.5" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex items-center gap-2">
            {["#0d0f15", "#faf6ee", "#061923", "#1d1218", "#ffffff", "#090913"].map((color, index) => (
              <span
                key={color}
                className="h-8 w-8 rounded-lg border border-white/10"
                style={{ background: color, opacity: 1 - index * 0.06 }}
              />
            ))}
            <span className="ml-2 text-[10px] uppercase tracking-[0.16em] text-white/40">All six themes included</span>
          </div>
        </div>

        <p className="relative mt-10 text-[10px] text-white/30">Notes for the curious.</p>
      </aside>

      {/* Form panel */}
      <div className="relative flex min-h-screen flex-col">
        <div className="flex items-center justify-between p-5 sm:px-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground lg:invisible">
            <ArrowLeft className="size-3.5" /> Back home
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-14 sm:px-8">
          <div className="w-full max-w-[400px]">
            <div className="mb-7 lg:hidden">
              <Link to="/" className="inline-flex items-center gap-2">
                <LogoMark />
                <span className="font-display text-base font-extrabold tracking-tight">NoteForge</span>
              </Link>
            </div>

            {step === "signIn" ? (
              <>
                <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Free to start
                </div>
                <h1 className="font-display mt-4 text-[30px] font-extrabold tracking-[-0.03em] sm:text-[34px]">
                  Learn something new today.
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Sign in with a one-time code. No password to remember, and your notes stay saved to your account.
                </p>

                <form onSubmit={handleEmailSubmit} className="mt-7">
                  <label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Email address
                  </label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="relative flex-1">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        placeholder="you@example.com"
                        type="email"
                        autoComplete="email"
                        className="h-11 rounded-xl bg-card pl-9 text-sm"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <Button type="submit" size="icon" className="size-11 shrink-0 rounded-xl" disabled={isLoading} aria-label="Continue with email">
                      {isLoading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                    </Button>
                  </div>
                  {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}

                  <Button type="submit" className="mt-3 h-11 w-full rounded-xl text-sm font-semibold" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Mail className="mr-2 size-4" />}
                    Continue with email
                  </Button>
                </form>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-xl text-sm"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                >
                  <UserX className="mr-2 size-4" />
                  Continue as guest
                </Button>
                <p className="mt-2 text-center text-[10px] text-muted-foreground">
                  Guest projects live in this browser session only.
                </p>

                <p className="mt-7 text-center text-[10px] leading-5 text-muted-foreground/70">
                  By continuing you agree to use NoteForge responsibly. AI notes can make mistakes — verify important facts.
                </p>
              </>
            ) : (
              <>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Mail className="size-5" />
                </div>
                <h1 className="font-display mt-4 text-[30px] font-extrabold tracking-[-0.03em]">Check your inbox.</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  We sent a six-digit code to <span className="font-medium text-foreground">{step.email}</span>.
                </p>

                <form onSubmit={handleOtpSubmit} className="mt-7">
                  <input type="hidden" name="email" value={step.email} />
                  <input type="hidden" name="code" value={otp} />
                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                      disabled={isLoading}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && otp.length === 6 && !isLoading) {
                          const form = (event.target as HTMLElement).closest("form");
                          form?.requestSubmit();
                        }
                      }}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {error && <p className="mt-3 text-center text-xs font-medium text-destructive">{error}</p>}

                  <Button type="submit" className="mt-5 h-11 w-full rounded-xl text-sm font-semibold" disabled={isLoading || otp.length !== 6}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" /> Verifying…
                      </>
                    ) : (
                      <>
                        Verify and continue <ArrowRight className="ml-2 size-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-5 flex flex-col items-center gap-2 text-xs text-muted-foreground">
                  <button
                    type="button"
                    className="font-medium text-primary hover:underline"
                    onClick={() => {
                      setStep("signIn");
                      setOtp("");
                      setError(null);
                    }}
                  >
                    Use a different email
                  </button>
                  <span className={cn("flex items-center gap-1.5 text-[10px]")}>
                    <Check className="size-3" /> The code expires in a few minutes.
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-border/60 px-5 py-4 text-center text-[10px] text-muted-foreground sm:px-8">
          NoteForge · Turn topics into notes worth keeping.
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
