import { type JSX, type ReactNode, Suspense } from "react";

function BlogsLoadingSkeleton(): JSX.Element {
  const skeletonItems = Array.from({ length: 3 }, (_, i) => `skeleton-${i}`);

  return (
    <main className="flex-grow relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/10 dark:to-accent/10" />
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

          <div className="space-y-8 animate-pulse">
            {skeletonItems.map((id) => (
              <article
                key={id}
                className="group relative p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm"
              >
                <div className="h-8 bg-muted rounded-lg w-3/4 mb-3 animate-pulse" />
                <div className="h-4 bg-muted rounded w-1/2 mb-4 animate-pulse" />
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
                  <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function BlogsLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return <Suspense fallback={<BlogsLoadingSkeleton />}>{children}</Suspense>;
}
