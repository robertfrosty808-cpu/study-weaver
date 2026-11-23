import { useSyncExternalStore } from "react";

export type AppTheme = "light" | "dark";

const STORAGE_KEY = "noteforge:app-theme";
const listeners = new Set<() => void>();

function readTheme(): AppTheme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "dark" ? "dark" : "light";
}

let currentTheme: AppTheme = readTheme();

function applyTheme(theme: AppTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  root.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#171a22" : "#f7f6f3");
}

if (typeof document !== "undefined") {
  applyTheme(currentTheme);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setTheme(theme: AppTheme) {
  currentTheme = theme;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, theme);
  }
  applyTheme(theme);
  listeners.forEach((listener) => listener());
}

export function useAppTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    () => currentTheme,
    () => "light" as AppTheme,
  );

  return {
    theme,
    setTheme,
    toggleTheme: () => setTheme(currentTheme === "dark" ? "light" : "dark"),
  };
}
