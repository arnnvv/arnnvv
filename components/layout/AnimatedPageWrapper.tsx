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
      className={cn("grow relative overflow-hidden flex flex-col", className)}
    >
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/10 dark:to-accent/10" />
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/2 left-1/4 w-16 h-16 bg-primary/5 rounded-full blur-lg animate-float"
        style={{ animationDelay: "1.5s" }}
      />
      <div className="relative z-10 grow flex flex-col">{children}</div>
    </main>
  );
}
