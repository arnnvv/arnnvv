import type { JSX } from "react";

export default function Home(): JSX.Element {
  return (
    <main className="flex-grow flex items-center justify-center px-4 py-8 md:p-0 dark:bg-zinc-950">
      <div className="max-w-xl w-full p-4 sm:p-8 text-center">
        <p className="text-base sm:text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-600 dark:text-zinc-200">
          Hey there, I'm Arnav
        </p>
        <p className="text-sm sm:text-base md:text-lg mb-3 md:mb-4 text-gray-600 dark:text-zinc-200">
          Currently navigating my undergrad at IIT Roorkee, I spend most of my
          time building, breaking, and rebuilding things—sometimes for fun,
          sometimes because curiosity gets the better of me.
        </p>
        <p className="text-sm sm:text-base md:text-lg mb-3 md:mb-4 text-gray-600 dark:text-zinc-200">
          Code is just the tool; the real obsession lies in figuring out how
          things work (or how they can work better).
        </p>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-zinc-200">
          Whether it's designing scalable systems, launching new ideas, or
          pushing the limits of what's possible, there's always something in the
          pipeline.
        </p>
      </div>
    </main>
  );
}
