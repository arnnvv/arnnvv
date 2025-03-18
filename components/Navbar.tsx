"use client";

import type { JSX } from "react";
import { Home, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Navbar(): JSX.Element {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="bg-gray-100 dark:bg-zinc-950 py-4 px-4 border-b border-gray-200 dark:border-zinc-800">
      <div className="container mx-auto flex flex-row justify-between items-center">
        <a
          href="/"
          className="text-gray-400 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
          aria-label="Home"
        >
          <Home size={24} />
        </a>

        {mounted && (
          <button
            className="text-gray-400 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
            aria-label="Toggle theme"
            type="button"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        )}
      </div>
    </nav>
  );
}
