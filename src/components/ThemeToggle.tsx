import { Button } from "@/components/ui/button";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useAppTheme();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={className}
    >
      <motion.span
        key={theme}
        initial={{ rotate: -30, opacity: 0, scale: 0.8 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="grid place-items-center"
      >
        {theme === "dark" ? <Moon className="size-[18px]" /> : <Sun className="size-[18px]" />}
      </motion.span>
    </Button>
  );
}
