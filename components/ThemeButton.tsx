"use client";

import { Moon, Sun } from "lucide-react";
import type { JSX } from "react";
import { useTheme } from "./ThemeProvider";

export function ThemeButton(): JSX.Element {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="text-gray-400 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
      aria-label="Toggle theme"
      type="button"
      onMouseDown={toggleTheme}
    >
      {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
    </button>
  );
}
