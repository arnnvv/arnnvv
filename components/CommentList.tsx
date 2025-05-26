"use client";

import { type JSX, useState, useEffect } from "react";
import type { CommentWithDetails, User } from "@/lib/db/types";
import { CommentItem } from "./CommentItem";

export function CommentList({
  initialComments,
  blogId,
  currentUser,
}: {
  initialComments: CommentWithDetails[];
  blogId: number;
  currentUser: User | null;
}): JSX.Element {
  const [topLevelComments, setTopLevelComments] =
    useState<CommentWithDetails[]>(initialComments);

  useEffect(() => {
    setTopLevelComments(
      initialComments.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ),
    );
  }, [initialComments]);

  const handleAnyCommentDeleted = (
    deletedCommentId: number,
    parentIdOfDeleted: number | null,
  ) => {
    if (parentIdOfDeleted === null) {
      setTopLevelComments((prevComments) =>
        prevComments.filter((c) => c.id !== deletedCommentId),
      );
    } else {
      setTopLevelComments((prevComments) =>
        prevComments.map((tlc) =>
          tlc.id === parentIdOfDeleted
            ? { ...tlc, reply_count: Math.max(0, tlc.reply_count - 1) }
            : tlc,
        ),
      );
    }
  };

  if (topLevelComments.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-zinc-400 my-4">
        Be the first to comment!
      </p>
    );
  }

  return (
    <div className="space-y-4 divide-y divide-gray-200 dark:divide-zinc-700">
      {topLevelComments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          blogId={blogId}
          currentUser={currentUser}
          onCommentDeleted={handleAnyCommentDeleted}
          depth={0}
        />
      ))}
    </div>
  );
}
