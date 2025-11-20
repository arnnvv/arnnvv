import { type JSX, Suspense } from "react";

import { getCurrentSession } from "@/app/actions/auth-actions";
import { getCommentsForBlogAction } from "@/app/actions/comment-actions";
import type { User } from "@/lib/db/types";

import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

function CommentListSkeleton(): JSX.Element {
  const skeletonItems = Array.from({ length: 3 }, (_, i) => `skeleton-${i}`);

  return (
    <div className="animate-pulse space-y-6">
      {skeletonItems.map((id) => (
        <div
          key={id}
          className="rounded-lg border border-gray-200 p-4 shadow-sm dark:border-zinc-700"
        >
          <div className="mb-2 h-6 w-3/4 rounded bg-gray-300 dark:bg-zinc-600" />
          <div className="mb-3 h-4 w-1/2 rounded bg-gray-300 dark:bg-zinc-600" />
          <div className="h-4 w-1/4 rounded bg-gray-300 dark:bg-zinc-600" />
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
      className="mt-12 border-t border-gray-200 pt-8 dark:border-zinc-700"
    >
      <h2 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-zinc-100">
        Comments
      </h2>

      <CommentForm blogId={blogId} currentUser={currentUser} />

      <Suspense fallback={<CommentListSkeleton />}>
        <CommentsLoader blogId={blogId} currentUser={currentUser} />
      </Suspense>
    </section>
  );
}
