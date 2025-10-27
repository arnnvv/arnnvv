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
        <Link href={prevPageHref} className="hover:underline">
          Previous
        </Link>
      ) : (
        <span className="opacity-50 cursor-not-allowed">Previous</span>
      )}

      <span>
        Page {currentPage} of {totalPages}
      </span>

      {hasNextPage ? (
        <Link href={nextPageHref} className="hover:underline">
          Next
        </Link>
      ) : (
        <span className="opacity-50 cursor-not-allowed">Next</span>
      )}
    </div>
  );
}
