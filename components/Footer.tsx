import Link from "next/link";
import type { JSX } from "react";

export function Footer(): JSX.Element {
  const links = [
    {
      name: "@arnnnvvv",
      url: "https://x.com/arnnnvvv",
    },
    {
      name: "github",
      url: "https://github.com/arnnvv",
    },
    {
      name: "linkedin",
      url: "https://www.linkedin.com/in/arnav-sharma-142716261",
    },
  ];

  return (
    <footer className="bg-gray-100 dark:bg-zinc-950 py-2 sm:py-3 md:py-4 px-3 sm:px-4 border-t border-gray-200 dark:border-zinc-800">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
        <div className="text-xs sm:text-sm text-gray-400 dark:text-zinc-400">
          © 2025
        </div>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm tracking-tight">
          <Link
            href="/contact"
            className="text-gray-400 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
            aria-label="Contact me"
          >
            contact me
          </Link>
          {links.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
