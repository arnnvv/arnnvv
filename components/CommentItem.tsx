"use client";

import { type JSX, useState } from "react";
import type { CommentWithDetails, User } from "@/lib/db/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/date";
import { LikeButton } from "./LikeButton";
import { MessageSquareReply, User as UserIcon } from "lucide-react";
import { Button } from "./ui/button";
import { CommentForm } from "./CommentForm";

export interface CommentWithReplies extends CommentWithDetails {
  replies: CommentWithReplies[];
}

export function CommentItem({
  comment,
  blogId,
  currentUser,
  onReplyAdded,
  depth = 0,
}: {
  comment: CommentWithReplies;
  blogId: number;
  currentUser: User | null;
  onReplyAdded: (newReply: CommentWithDetails, parentId: number) => void;
  depth?: number;
}): JSX.Element {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleReplyAdded = (newReply: CommentWithDetails) => {
    onReplyAdded(newReply, comment.id);
    setShowReplyForm(false);
  };

  return (
    <div
      className={`py-3 ${depth > 0 ? "pl-4 sm:pl-6 border-l border-gray-200 dark:border-zinc-700 ml-4 sm:ml-6" : ""}`}
    >
      <div className="flex items-start space-x-3">
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
          <AvatarImage src={comment.user_picture} alt={comment.user_name} />
          <AvatarFallback>
            {comment.user_name?.charAt(0).toUpperCase() || (
              <UserIcon size={18} />
            )}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-semibold text-gray-800 dark:text-zinc-100">
              {comment.user_name}
            </p>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              {formatDate(comment.created_at)}
            </p>
          </div>
          <p className="mt-1 text-sm text-gray-700 dark:text-zinc-300 whitespace-pre-wrap">
            {comment.content}
          </p>
          <div className="mt-2 flex items-center space-x-3">
            <LikeButton
              commentId={comment.id}
              initialLikeCount={comment.like_count}
              initialIsLiked={comment.is_liked_by_current_user}
              currentUser={currentUser}
            />
            {currentUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 p-1 h-auto text-xs text-gray-500 dark:text-zinc-400 hover:text-blue-500"
                aria-expanded={showReplyForm}
                aria-label="Reply to comment"
              >
                <MessageSquareReply size={14} />
                <span>Reply</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {showReplyForm && (
        <div className="mt-2 pl-8 sm:pl-10">
          <CommentForm
            blogId={blogId}
            parentCommentId={comment.id}
            currentUser={currentUser}
            onCommentAdded={handleReplyAdded}
            onCancel={() => setShowReplyForm(false)}
            placeholder={`Replying to ${comment.user_name}...`}
            submitButtonText="Post Reply"
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              blogId={blogId}
              currentUser={currentUser}
              onReplyAdded={onReplyAdded}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
