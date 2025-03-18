import type { JSX } from "react";

export function Footer(): JSX.Element {
  const links = [
    { name: "@arnnnvvv", url: "https://x.com/arnnnvvv" },
    { name: "github", url: "https://github.com/arnnvv" },
    {
      name: "linkedin",
      url: "https://www.linkedin.com/in/arnav-sharma-142716261/",
    },
  ];

  return (
    <footer className="bg-gray-100 dark:bg-zinc-950 py-4 px-4 border-t border-gray-200 dark:border-zinc-800">
      <div className="container mx-auto flex flex-row justify-between items-center">
        <div className="text-sm text-gray-400 dark:text-zinc-400">© 2025</div>
        <div className="flex space-x-4 tracking-tight">
          <a
            href="/contact"
            className="text-gray-400 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
            aria-label="Contact me"
          >
            contact me
          </a>
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
