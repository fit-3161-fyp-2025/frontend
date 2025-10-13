import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-provider";
import { useCallback, useMemo } from "react";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  // Determine effective theme when 'system' is used
  const resolvedTheme = useMemo(() => {
    if (theme === "system") {
      if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      return "light";
    }
    return theme || "light";
  }, [theme]);

  const toggle = useCallback(() => {
    // Toggle between light and dark. If current effective is dark, set to light, else dark.
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  }, [resolvedTheme, setTheme]);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label="Toggle theme"
      title={isDark ? "Switch to light" : "Switch to dark"}
    >
      <Sun
        className={
          "h-[1.2rem] w-[1.2rem] transition-all " +
          (isDark ? "scale-0 -rotate-90" : "scale-100 rotate-0")
        }
      />
      <Moon
        className={
          "absolute h-[1.2rem] w-[1.2rem] transition-all " +
          (isDark ? "scale-100 rotate-0" : "scale-0 rotate-90")
        }
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
