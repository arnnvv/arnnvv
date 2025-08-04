import type { ComponentProps, JSX } from "react";
import { wrapWordsWithTransition } from "@/lib/transitions";

interface TransitionTitleProps extends ComponentProps<"h1"> {
  title: string;
  transitionName: string;
}

export function TransitionTitle({
  title,
  transitionName,
  className,
  ...props
}: TransitionTitleProps): JSX.Element {
  const gradientClasses =
    "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent";

  return (
    <h1 className={className} {...props}>
      {wrapWordsWithTransition(title, transitionName, gradientClasses)}
    </h1>
  );
}
