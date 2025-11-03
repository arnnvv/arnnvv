import { type JSX, type ReactNode, Suspense } from "react";
import { PaginatedBlogsLoadingSkeleton } from "@/components/PaginatedBlogPageSkeleton";

export default function BlogLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <Suspense fallback={<PaginatedBlogsLoadingSkeleton />}>{children}</Suspense>
  );
}
