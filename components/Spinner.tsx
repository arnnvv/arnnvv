import type { JSX } from "react";

export function Spinner(): JSX.Element {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary" />
    </div>
  );
}
