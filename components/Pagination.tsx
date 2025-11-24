import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { JSX } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
}: PaginationProps): JSX.Element | null {
  if (totalPages <= 1) return null;

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const prevPageHref =
    currentPage === 2 ? "/blogs" : `${basePath}/${currentPage - 1}`;
  const nextPageHref = `${basePath}/${currentPage + 1}`;

  return (
    <div className="text-muted-foreground mt-12 flex items-center justify-between text-sm">
      {hasPreviousPage ? (
        <Link href={prevPageHref} className="flex items-center hover:underline">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Link>
      ) : (
        <span className="flex cursor-not-allowed items-center opacity-50">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </span>
      )}

      <span>
        Page {currentPage} of {totalPages}
      </span>

      {hasNextPage ? (
        <Link href={nextPageHref} className="flex items-center hover:underline">
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      ) : (
        <span className="flex cursor-not-allowed items-center opacity-50">
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </span>
      )}
    </div>
  );
}
