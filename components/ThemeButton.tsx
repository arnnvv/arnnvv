"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, type JSX } from "react";

export function ThemeButton(): JSX.Element {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="text-gray-400 dark:text-zinc-400 transition-colors duration-200"
        aria-label="Toggle theme"
        type="button"
        disabled
      >
        <Moon size={24} />
      </button>
    );
  }

  return (
    <button
      className="text-gray-400 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
      aria-label="Toggle theme"
      type="button"
      onMouseDown={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
    </button>
  );
}
