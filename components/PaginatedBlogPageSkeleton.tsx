import type { JSX } from "react";

export function PaginatedBlogsLoadingSkeleton(): JSX.Element {
  const skeletonItems = Array.from({ length: 3 }, (_, i) => `skeleton-${i}`);

  return (
    <main className="grow relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/10 dark:to-accent/10" />
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-float"
        style={{ animationDelay: "2s" }}
      />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-16">
            <div className="h-12 bg-muted rounded-lg w-3/4 mx-auto mb-4 animate-pulse" />
          </header>

          <div className="space-y-8">
            {skeletonItems.map((id, index) => (
              <article key={id} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <div className="h-7 sm:h-8 bg-muted/40 rounded w-2/3 animate-pulse" />
                  <div className="h-4 bg-muted/30 rounded w-24 shrink-0 animate-pulse" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
