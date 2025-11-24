import Link from "next/link";
import type { JSX } from "react";

import { SOCIAL_LINKS } from "@/lib/constants";

export function Footer(): JSX.Element {
  return (
    <footer className="bg-background border-border/50 relative border-t px-3 py-2 backdrop-blur-md sm:px-4 sm:py-3 md:py-4">
      <div className="from-accent/5 to-primary/5 dark:from-accent/10 dark:to-primary/10 absolute inset-0 bg-linear-to-r via-transparent" />

      <div className="relative z-10 flex flex-col items-center justify-between gap-2 sm:flex-row sm:gap-0">
        <div className="text-xs text-gray-400 sm:text-sm dark:text-zinc-400">
          &copy; arnav
        </div>
        <div className="flex flex-wrap justify-center gap-2 text-xs tracking-tight sm:gap-3 sm:text-sm md:gap-4">
          <Link
            href="/contact"
            className="text-gray-400 transition-colors duration-200 hover:text-blue-500 dark:text-zinc-400 dark:hover:text-blue-400"
            aria-label="Contact me"
          >
            contact me
          </Link>
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-colors duration-200 hover:text-blue-500 dark:text-zinc-400 dark:hover:text-blue-400"
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
