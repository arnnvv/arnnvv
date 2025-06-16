import { type JSX, type ReactNode, Suspense } from "react";

function BlogsLoadingSkeleton(): JSX.Element {
  const skeletonItems = Array.from({ length: 3 }, (_, i) => `skeleton-${i}`);

  return (
    <main className="flex-grow">
      <div className="container mx-auto px-4 py-12">
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
