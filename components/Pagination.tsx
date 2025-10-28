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
    <div className="mt-12 flex items-center justify-between text-sm text-muted-foreground">
      {hasPreviousPage ? (
        <Link href={prevPageHref} className="flex items-center hover:underline">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Link>
      ) : (
        <span className="flex items-center opacity-50 cursor-not-allowed">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </span>
      )}

      <span>
        Page {currentPage} of {totalPages}
      </span>

      {hasNextPage ? (
        <Link href={nextPageHref} className="flex items-center hover:underline">
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      ) : (
        <span className="flex items-center opacity-50 cursor-not-allowed">
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </span>
      )}
    </div>
  );
}
