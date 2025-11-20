import type { JSX } from "react";

export function Spinner(): JSX.Element {
  return (
    <div className="bg-background/50 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
      <div className="border-muted border-t-primary h-8 w-8 animate-spin rounded-full border-2" />
    </div>
  );
}
