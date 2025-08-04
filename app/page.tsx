import { AnimatedPageWrapper } from "@/components/layout/AnimatedPageWrapper";
import { TransitionLink } from "@/components/layout/TransitionLink";
import type { JSX } from "react";

export default function Home(): JSX.Element {
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
          <TransitionLink
            href="/blogs"
            title="My Writings"
            transitionName="page-title-writings"
          />
          <span className="text-muted-foreground/50 hidden sm:block">•</span>
          <TransitionLink
            href="/work"
            title="My Work"
            transitionName="page-title-work"
          />
        </div>
      </div>
    </AnimatedPageWrapper>
  );
}
