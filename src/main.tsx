
import "@vly-ai/integrations";

import {
  Component,
  StrictMode,
  Suspense,
  lazy,
  useEffect,
  type ReactNode,
} from "react";

import { createRoot } from "react-dom/client";

import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from "react-router";

import { Loader2 } from "lucide-react";

import { Toaster } from "@/components/ui/sonner";
import { InteractiveEffects } from "@/components/effects/InteractiveEffects";
import { RequireAuth } from "@/components/RequireAuth";

import { AppProviders } from "./AppProviders";
import { VlyToolbar } from "../vly-toolbar-readonly";

import "./index.css";

// Lazy-loaded pages
const Landing = lazy(() => import("./pages/Landing"));
const AuthPage = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotesStudio = lazy(() => import("./pages/NotesStudio"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback
function RouteLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
      <Loader2 className="size-5 animate-spin text-primary" />
      <p className="text-xs font-medium text-muted-foreground">
        Preparing your workspace…
      </p>
    </div>
  );
}

// Toolbar error boundary
interface ToolbarProps {
  children: ReactNode;
}

interface ToolbarState {
  hasError: boolean;
}

class ToolbarErrorBoundary extends Component<ToolbarProps, ToolbarState> {
  state: ToolbarState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ToolbarState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("[VlyToolbar] Toolbar disabled:", error);
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

// Root error boundary
interface RootProps {
  children: ReactNode;
}

interface RootState {
  hasError: boolean;
  message: string;
  stack: string;
}

class RootErrorBoundary extends Component<RootProps, RootState> {
  state: RootState = {
    hasError: false,
    message: "",
    stack: "",
  };

  static getDerivedStateFromError(error: Error): RootState {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
      stack: error.stack || "",
    };
  }

  componentDidCatch(error: Error) {
    console.error("[Preview] Root crash:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
          <div className="w-full max-w-lg text-center">
            <p className="text-sm font-semibold">
              Preview runtime error
            </p>

            <p className="mt-2 break-words text-xs text-muted-foreground">
              {this.state.message}
            </p>

            {this.state.stack && (
              <pre className="mt-3 max-h-40 overflow-auto rounded border border-border/60 p-2 text-left text-[10px] leading-4 text-muted-foreground/80">
                {this.state.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Iframe route synchronization
function RouteSyncer() {
  const location = useLocation();

  useEffect(() => {
    window.parent.postMessage(
      {
        type: "iframe-route-change",
        path: location.pathname,
      },
      "*"
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type !== "navigate") return;

      if (event.data.direction === "back") {
        window.history.back();
      }

      if (event.data.direction === "forward") {
        window.history.forward();
      }
    }

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return null;
}

// Root element
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Could not find the "root" element.');
}

// Render application
createRoot(rootElement).render(
  <StrictMode>
    <RootErrorBoundary>
      <ToolbarErrorBoundary>
        <VlyToolbar />
      </ToolbarErrorBoundary>

      <AppProviders>
        <BrowserRouter>
          <RouteSyncer />

          <InteractiveEffects />

          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route
                path="/"
                element={<Landing />}
              />

              <Route
                path="/auth"
                element={
                  <AuthPage redirectAfterAuth="/dashboard" />
                }
              />

              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />

              <Route
                path="/notes/:id"
                element={
                  <RequireAuth redirectImmediately>
                    <NotesStudio />
                  </RequireAuth>
                }
              />

              <Route
                path="*"
                element={<NotFound />}
              />
            </Routes>
          </Suspense>
        </BrowserRouter>

        <Toaster />
      </AppProviders>
    </RootErrorBoundary>
  </StrictMode>
);
