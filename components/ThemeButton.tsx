"use client";

import { Moon, Sun } from "lucide-react";
import type { JSX } from "react";

import { useTheme } from "./ThemeProvider";

export function ThemeButton(): JSX.Element {
  const { toggleTheme } = useTheme();

  return (
    <button
      className="text-gray-400 transition-colors duration-200 hover:text-blue-500 dark:text-zinc-400 dark:hover:text-blue-400"
      aria-label="Toggle theme"
      type="button"
      onMouseDown={toggleTheme}
    >
      <Sun size={24} className="hidden dark:block" />
      <Moon size={24} className="block dark:hidden" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
