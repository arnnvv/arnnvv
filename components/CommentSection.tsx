import { type JSX, Suspense } from "react";
import { getCommentsForBlogAction, getCurrentSession } from "@/app/actions";
import { CommentList } from "./CommentList";
import { CommentForm } from "./CommentForm";
import type { User } from "@/lib/db/types";

function CommentListSkeleton(): JSX.Element {
  const skeletonItems = Array.from({ length: 3 }, (_, i) => `skeleton-${i}`);

  return (
    <div className="space-y-6 animate-pulse">
      {skeletonItems.map((id) => (
        <div
          key={id}
          className="p-4 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-sm"
        >
          <div className="h-6 bg-gray-300 dark:bg-zinc-600 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-300 dark:bg-zinc-600 rounded w-1/2 mb-3" />
          <div className="h-4 bg-gray-300 dark:bg-zinc-600 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}

async function CommentsLoader({
  blogId,
  currentUser,
}: {
  blogId: number;
  currentUser: User | null;
}) {
  const comments = await getCommentsForBlogAction(blogId);
  return (
    <CommentList
      initialComments={comments}
      blogId={blogId}
      currentUser={currentUser}
    />
  );
}

export async function CommentSection({
  blogId,
}: {
  blogId: number;
}): Promise<JSX.Element> {
  const { user: currentUser } = await getCurrentSession();

  return (
    <section
      aria-labelledby="comments-heading"
      className="mt-12 pt-8 border-t border-gray-200 dark:border-zinc-700"
    >
      <h2
        id="comments-heading"
        className="text-2xl font-semibold text-gray-800 dark:text-zinc-100 mb-6"
      >
        Comments
      </h2>

      <CommentForm blogId={blogId} currentUser={currentUser} />

      <Suspense fallback={<CommentListSkeleton />}>
        <CommentsLoader blogId={blogId} currentUser={currentUser} />
      </Suspense>
    </section>
  );
}
