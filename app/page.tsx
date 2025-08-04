import { AnimatedPageWrapper } from "@/components/layout/AnimatedPageWrapper";
import { Link } from "next-view-transitions";
import type { JSX } from "react";
import { wrapWordsWithTransition } from "@/lib/transitions";

export default function Home(): JSX.Element {
  const linkGradientClasses =
    "bg-gradient-to-r from-primary/98 to-accent/98 bg-clip-text text-transparent";

  return (
    <AnimatedPageWrapper className="items-center justify-center px-4 py-8 md:p-0">
      <div className="max-w-2xl w-full p-6 sm:p-8 text-center">
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
            <span className="text-primary font-semibold">IIT Roorkee</span>,
            exploring systems, software, and the thinking behind how things
            work. I spend most of my time building small tools, testing ideas,
            and learning by doing.
          </p>
          <p className="text-muted-foreground">
            My focus is on clarity, leverage, and execution finding what
            compounds over time and cutting out what doesn't. I care about how
            systems scale, how decisions age, and how to make things that are
            simple, robust, and useful.
          </p>
          <p className="text-muted-foreground">
            I don't have all the answers, but I ask better questions each week.
            For me, building is a way to think about design, about tradeoffs,
            and about what matters.
          </p>
        </div>
        <div className="mt-10 flex flex-col sm:flex-row gap-6 justify-center items-center text-base sm:text-lg">
          <Link
            href="/blogs"
            className="group relative inline-flex items-center font-bold transition-all duration-300"
          >
            <span className="relative text-base sm:text-lg">
              {wrapWordsWithTransition(
                "My Writings",
                "page-title-writings",
                linkGradientClasses,
              )}
              <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-primary/98 to-accent/98 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </span>
            <svg
              className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
          <span className="text-muted-foreground/50 hidden sm:block">•</span>
          <Link
            href="/work"
            className="group relative inline-flex items-center font-bold transition-all duration-300"
          >
            <span className="relative text-base sm:text-lg">
              {wrapWordsWithTransition(
                "My Work",
                "page-title-work",
                linkGradientClasses,
              )}
              <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-primary/98 to-accent/98 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </span>
            <svg
              className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </AnimatedPageWrapper>
  );
}
