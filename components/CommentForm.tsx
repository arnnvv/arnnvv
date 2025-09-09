"use client";

import { type JSX, type KeyboardEvent, useRef } from "react";
import { addCommentAction } from "@/app/actions/comment-actions";
import { ActionFormWrapper } from "@/components/ActionFormWrapper";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CommentWithDetails, User } from "@/lib/db/types";

export function CommentForm({
  blogId,
  parentCommentId,
  currentUser,
  onCommentAddedAction,
  onCancelAction,
  placeholder = "Write a comment...",
  submitButtonText = "Post Comment",
}: {
  blogId: number;
  parentCommentId?: number | null;
  currentUser: User | null;
  onCommentAddedAction?: (newComment: CommentWithDetails) => void;
  onCancelAction?: () => void;
  placeholder?: string;
  submitButtonText?: string;
}): JSX.Element {
  const formRef = useRef<HTMLFormElement>(null);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  if (!currentUser) {
    return (
      <p className="text-sm text-gray-500 dark:text-zinc-400 my-4">
        Please{" "}
        <a href="/login/google" className="text-blue-500 hover:underline">
          log in
        </a>{" "}
        to comment.
      </p>
    );
  }

  return (
    <ActionFormWrapper
      formRef={formRef}
      action={addCommentAction}
      onSuccess={(data, form) => {
        form.reset();
        if (data.comment && onCommentAddedAction) {
          onCommentAddedAction(data.comment);
        }
        if (onCancelAction) onCancelAction();
      }}
      className="mt-4 mb-2"
    >
      <input type="hidden" name="blogId" value={blogId} />
      {parentCommentId && (
        <input type="hidden" name="parentCommentId" value={parentCommentId} />
      )}
      <Textarea
        name="content"
        placeholder={placeholder}
        rows={3}
        required
        className="mb-2 bg-secondary dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
        minLength={1}
        maxLength={1000}
        onKeyDown={handleKeyDown}
      />
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm">
          {submitButtonText}
        </Button>
        {onCancelAction && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onMouseDown={onCancelAction}
          >
            Cancel
          </Button>
        )}
      </div>
    </ActionFormWrapper>
  );
}
