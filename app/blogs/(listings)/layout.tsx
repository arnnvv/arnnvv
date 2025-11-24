import { type JSX, type ReactNode, Suspense } from "react";

import { TransitionTitle } from "@/components/layout/TransitionTitle";
import { PaginatedBlogsLoadingSkeleton } from "@/components/PaginatedBlogPageSkeleton";

export default function BlogListingsLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <main className="relative grow overflow-hidden">
      <div className="from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 absolute inset-0 bg-linear-to-br via-transparent" />
      <div className="bg-primary/10 animate-float absolute top-20 left-10 h-20 w-20 rounded-full blur-xl" />
      <div
        className="bg-accent/10 animate-float absolute right-10 bottom-20 h-32 w-32 rounded-full blur-xl"
        style={{ animationDelay: "2s" }}
      />
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-12">
        <div className="mx-auto max-w-4xl">
          <header className="mb-16 text-center">
            <TransitionTitle
              title="My Writings"
              transitionName="page-title-writings"
              className="text-4xl leading-tight font-bold sm:text-5xl"
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
