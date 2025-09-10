import type NextLink from "next/link";
import type { ComponentProps, JSX } from "react";
import { wrapWordsWithTransition } from "@/lib/transitions";
import { TransitionLink as BaseTransitionLink } from "@/lib/view-transition";

interface TransitionLinkProps
  extends Omit<ComponentProps<typeof NextLink>, "children"> {
  title: string;
  transitionName: string;
}

export function TransitionLink({
  title,
  transitionName,
  ...props
}: TransitionLinkProps): JSX.Element {
  return (
    <BaseTransitionLink
      className="group relative inline-flex items-center font-bold transition-all duration-300"
      {...props}
    >
      <span className="relative text-base sm:text-lg">
        <span className="invisible">
          {wrapWordsWithTransition(title, transitionName)}
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-0 whitespace-nowrap bg-gradient-to-r from-primary/98 to-accent/98 bg-clip-text text-transparent"
        >
          {title}
        </span>
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
    </BaseTransitionLink>
  );
}
