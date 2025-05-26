"use client";

import { type JSX, useState, useEffect } from "react";
import type { CommentWithDetails, User } from "@/lib/db/types";
import { CommentItem, type CommentWithReplies } from "./CommentItem";

function buildCommentTree(
  comments: CommentWithDetails[],
  parentId: number | null = null,
): CommentWithReplies[] {
  return comments
    .filter((comment) => comment.parent_comment_id === parentId)
    .map((comment) => ({
      ...comment,
      replies: buildCommentTree(comments, comment.id),
    }))
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
}

export function CommentList({
  initialComments,
  blogId,
  currentUser,
}: {
  initialComments: CommentWithDetails[];
  blogId: number;
  currentUser: User | null;
}): JSX.Element {
  const [allCommentsFlat, setAllCommentsFlat] =
    useState<CommentWithDetails[]>(initialComments);

  useEffect(() => {
    setAllCommentsFlat(
      initialComments.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ),
    );
  }, [initialComments]);

  const handleCommentOrReplyAdded = (newComment: CommentWithDetails) => {
    setAllCommentsFlat((prevComments) =>
      [...prevComments, newComment].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ),
    );
  };

  const handleCommentDeleted = (deletedCommentId: number) => {
    const commentsToDelete = new Set<number>();
    const queue: number[] = [deletedCommentId];
    commentsToDelete.add(deletedCommentId);

    while (queue.length > 0) {
      const currentParentId = queue.shift();
      if (currentParentId === undefined) {
        throw new Error(
          "Invariant violated: queue should never be empty here.",
        );
      }
      for (const comment of allCommentsFlat) {
        if (comment.parent_comment_id === currentParentId) {
          commentsToDelete.add(comment.id);
          queue.push(comment.id);
        }
      }
    }
    setAllCommentsFlat((prevComments) =>
      prevComments.filter((c) => !commentsToDelete.has(c.id)),
    );
  };

  const commentTreeToRender = buildCommentTree(allCommentsFlat, null);

  if (commentTreeToRender.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-zinc-400 my-4">
        Be the first to comment!
      </p>
    );
  }

  return (
    <div className="space-y-4 divide-y divide-gray-200 dark:divide-zinc-700">
      {commentTreeToRender.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          blogId={blogId}
          currentUser={currentUser}
          onReplyAdded={handleCommentOrReplyAdded}
          onCommentDeleted={handleCommentDeleted}
        />
      ))}
    </div>
  );
}
