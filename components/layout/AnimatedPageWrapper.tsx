import type { JSX, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AnimatedPageWrapperProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedPageWrapper({
  children,
  className,
}: AnimatedPageWrapperProps): JSX.Element {
  return (
    <main
      className={cn("relative flex grow flex-col overflow-hidden", className)}
    >
      <div className="from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 absolute inset-0 bg-linear-to-br via-transparent" />
      <div className="bg-primary/10 animate-float absolute top-20 left-10 h-20 w-20 rounded-full blur-xl" />
      <div
        className="bg-accent/10 animate-float absolute right-10 bottom-20 h-32 w-32 rounded-full blur-xl"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="bg-primary/5 animate-float absolute top-1/2 left-1/4 h-16 w-16 rounded-full blur-lg"
        style={{ animationDelay: "1.5s" }}
      />
      <div className="relative z-10 flex grow flex-col">{children}</div>
    </main>
  );
}
