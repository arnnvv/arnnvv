import type { JSX } from "react";
import { Home, Moon } from "lucide-react";

export function Navbar(): JSX.Element {
  return (
    <nav className="bg-gray-100 py-4 px-4 border-b border-gray-200">
      <div className="container mx-auto flex flex-row justify-between items-center">
        <a
          href="/"
          className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
          aria-label="Home"
        >
          <Home size={24} />
        </a>

        <button
          className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
          aria-label="Toggle theme"
        >
          <Moon size={24} />
        </button>
      </div>
    </nav>
  );
}
