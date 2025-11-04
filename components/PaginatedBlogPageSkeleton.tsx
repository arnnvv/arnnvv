import type { JSX } from "react";
import { BLOGS_PER_PAGE } from "@/lib/constants";

export function PaginatedBlogsLoadingSkeleton(): JSX.Element {
  const skeletonItems = Array.from(
    { length: BLOGS_PER_PAGE },
    (_, i) => `skeleton-${i}`,
  );

  return (
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
  );
}
