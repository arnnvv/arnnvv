import Link from "next/link";
import type { JSX } from "react";

export default function Home(): JSX.Element {
  return (
    <main className="flex-grow flex items-center justify-center px-4 py-8 md:p-0 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/10 dark:to-accent/10" />

      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-float"
        style={{ animationDelay: "2s" }}
      />

      <div className="max-w-2xl w-full p-6 sm:p-8 text-center relative z-10">
        <div className="mb-8 space-y-1">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
            <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse" />
            Beyond the screen
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Hey there, I'm Arnav
          </h1>
        </div>

        <div className="space-y-6 text-base sm:text-lg leading-relaxed">
          <p className="text-muted-foreground">
            Currently navigating my undergrad at{" "}
            <span className="text-primary font-semibold">IIT Roorkee</span>, I
            spend most of my time building, breaking, and rebuilding
            things—sometimes for fun, sometimes because curiosity gets the
            better of me.
          </p>

          <p className="text-muted-foreground">
            Code is just the tool; the real obsession lies in figuring out how
            things work{" "}
            <span className="italic text-foreground">
              (or how they can work better)
            </span>
            .
          </p>

          <p className="text-muted-foreground">
            Whether it's designing scalable systems, launching new ideas, or
            pushing the limits of what's possible, there's always something in
            the pipeline.
          </p>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/blogs"
            className="group relative inline-flex items-center px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
          >
            <span className="relative z-10">Explore my takes</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>

          <Link
            href="/work"
            className="group relative inline-flex items-center px-8 py-3 rounded-full border-2 border-primary text-primary font-medium transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
          >
            Look at my work
          </Link>
        </div>

        <div className="mt-16 flex justify-center">
          <div className="animate-bounce">
            <svg
              className="w-6 h-6 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </div>
    </main>
  );
}
