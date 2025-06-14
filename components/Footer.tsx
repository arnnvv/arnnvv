import type { JSX } from "react";
import { ContactLink } from "./ContactLink";

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
    <footer className="relative backdrop-blur-md bg-card/70 border-t border-border/50 py-2 sm:py-3 md:py-4 px-3 sm:px-4">
      <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-primary/5 dark:from-accent/10 dark:to-primary/10" />

      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
        <div className="text-xs sm:text-sm text-gray-400 dark:text-zinc-400">
          © 2025
        </div>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm tracking-tight">
          <ContactLink />
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
