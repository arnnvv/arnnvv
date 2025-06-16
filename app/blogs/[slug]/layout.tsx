import { type JSX, type ReactNode, Suspense } from "react";

function BlogPostLoadingSkeleton(): JSX.Element {
  return (
    <main className="flex-grow relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/10 dark:to-accent/10" />
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-float"
        style={{ animationDelay: "2s" }}
      />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="animate-pulse max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="h-10 bg-muted rounded-lg w-3/4 mx-auto mb-4" />
            <div className="h-6 bg-muted rounded w-1/2 mx-auto" />
          </div>

          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-20 bg-muted rounded w-full mt-6" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-full mt-4" />
            <div className="h-4 bg-muted rounded w-4/5" />
          </div>

          <div className="mt-16 pt-8 border-t border-border">
            <div className="h-8 bg-muted rounded w-1/3 mb-6" />
            <div className="space-y-4">
              <div className="h-20 bg-muted/50 rounded-lg" />
              <div className="h-16 bg-muted/30 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function BlogPostLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return <Suspense fallback={<BlogPostLoadingSkeleton />}>{children}</Suspense>;
}
