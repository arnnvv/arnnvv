import { type JSX, type ReactNode, Suspense } from "react";
import { TransitionTitle } from "@/components/layout/TransitionTitle";
import { PaginatedBlogsLoadingSkeleton } from "@/components/PaginatedBlogPageSkeleton";

export default function BlogListingsLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <main className="grow relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/10 dark:to-accent/10" />
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div className="container mx-auto px-4 pt-20 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-16">
            <TransitionTitle
              title="My Writings"
              transitionName="page-title-writings"
              className="text-4xl sm:text-5xl font-bold leading-tight"
            />
          </header>
          <Suspense fallback={<PaginatedBlogsLoadingSkeleton />}>
            {children}
          </Suspense>
        </div>
      </div>
    </main>
  );
}
