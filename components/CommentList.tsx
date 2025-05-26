"use client";

import { type JSX, useState, useEffect } from "react";
import type { CommentWithDetails, User } from "@/lib/db/types";
import { CommentItem, type CommentWithReplies } from "./CommentItem";

function buildCommentTree(
  comments: CommentWithDetails[],
): CommentWithReplies[] {
  const commentMap: { [key: number]: CommentWithReplies } = {};
  const rootComments: CommentWithReplies[] = [];

  for (const comment of comments) {
    commentMap[comment.id] = { ...comment, replies: [] };
  }

  for (const comment of comments) {
    if (comment.parent_comment_id && commentMap[comment.parent_comment_id]) {
      commentMap[comment.parent_comment_id].replies.push(
        commentMap[comment.id],
      );
    } else {
      rootComments.push(commentMap[comment.id]);
    }
  }
  return rootComments;
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
  const [comments, setComments] =
    useState<CommentWithDetails[]>(initialComments);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleCommentOrReplyAdded = (newComment: CommentWithDetails) => {
    setComments((prevComments) =>
      [...prevComments, newComment].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ),
    );
  };

  const commentTree = buildCommentTree(comments);

  if (commentTree.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-zinc-400 my-4">
        Be the first to comment!
      </p>
    );
  }

  return (
    <div className="space-y-4 divide-y divide-gray-200 dark:divide-zinc-700">
      {commentTree.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          blogId={blogId}
          currentUser={currentUser}
          onReplyAdded={handleCommentOrReplyAdded}
        />
      ))}
    </div>
  );
}
