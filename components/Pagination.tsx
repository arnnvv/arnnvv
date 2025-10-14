import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { JSX } from "react";
import { Button } from "@/components/ui/button";

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
  if (totalPages <= 1) {
    return null;
  }

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const prevPageHref =
    currentPage === 2 ? "/blogs" : `${basePath}/${currentPage - 1}`;
  const nextPageHref = `${basePath}/${currentPage + 1}`;

  return (
    <div className="mt-12 flex items-center justify-between">
      {hasPreviousPage ? (
        <Button asChild variant="outline">
          <Link href={prevPageHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Link>
        </Button>
      ) : (
        <Button variant="outline" disabled>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
      )}

      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>

      {hasNextPage ? (
        <Button asChild variant="outline">
          <Link href={nextPageHref}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" disabled>
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
