"use client";

import { type JSX, useState, useTransition } from "react";
import type { CommentWithDetails, User } from "@/lib/db/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/date";
import { LikeButton } from "./LikeButton";
import { CommentForm } from "./CommentForm";
import {
  MessageSquareReply,
  Trash2,
  ChevronDown,
  ChevronRight,
  Loader2,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteCommentAction, getRepliesForCommentAction } from "@/app/actions";
import { toast } from "sonner";

export function CommentItem({
  comment,
  blogId,
  currentUser,
  onCommentDeleted,
  depth = 0,
}: {
  comment: CommentWithDetails;
  blogId: number;
  currentUser: User | null;
  onCommentDeleted: (
    deletedCommentId: number,
    parentIdOfDeleted: number | null,
  ) => void;
  depth?: number;
}): JSX.Element {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [loadedReplies, setLoadedReplies] = useState<CommentWithDetails[]>([]);
  const [areRepliesVisible, setAreRepliesVisible] = useState(false);
  const [isLoadingReplies, startLoadingRepliesTransition] = useTransition();
  const [currentReplyCount, setCurrentReplyCount] = useState(
    comment.reply_count,
  );

  const handleLocalReplyAdded = (newReply: CommentWithDetails) => {
    setLoadedReplies((prev) =>
      [...prev, newReply].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ),
    );
    setCurrentReplyCount((prev) => prev + 1);
    if (!areRepliesVisible) setAreRepliesVisible(true);
    setShowReplyForm(false);
  };

  const handleChildReplyDeleted = (
    deletedReplyId: number,
    parentIdOfDeleted: number | null,
  ) => {
    if (parentIdOfDeleted === comment.id) {
      setLoadedReplies((prevReplies) =>
        prevReplies.filter((reply) => reply.id !== deletedReplyId),
      );
      setCurrentReplyCount((prevCount) => Math.max(0, prevCount - 1));
    }
    onCommentDeleted(deletedReplyId, parentIdOfDeleted);
  };

  const handleDelete = () => {
    if (!currentUser || currentUser.id !== comment.user_id) {
      toast.error("You are not authorized to delete this comment.");
      return;
    }
    startDeleteTransition(async () => {
      const result = await deleteCommentAction(comment.id);
      if (result.success) {
        toast.success(result.message);
        onCommentDeleted(comment.id, comment.parent_comment_id);
      } else {
        toast.error(result.message || "Failed to delete comment.");
      }
    });
  };

  const toggleReplies = async () => {
    if (isLoadingReplies) return;

    if (areRepliesVisible) {
      setAreRepliesVisible(false);
    } else {
      if (loadedReplies.length === 0 && currentReplyCount > 0) {
        startLoadingRepliesTransition(async () => {
          const repliesData = await getRepliesForCommentAction(comment.id);
          setLoadedReplies(
            repliesData.sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime(),
            ),
          );
          setAreRepliesVisible(true);
        });
      } else {
        setAreRepliesVisible(true);
      }
    }
  };

  const isOwnComment = currentUser?.id === comment.user_id;

  return (
    <div
      className={`py-3 ${depth > 0 ? "pl-4 sm:pl-6 border-l border-gray-200 dark:border-zinc-700 ml-4 sm:ml-6" : ""}`}
    >
      <div className="flex items-start space-x-3">
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
          <AvatarImage src={comment.user_picture} alt={comment.user_name} />
          <AvatarFallback>
            {comment.user_name?.charAt(0).toUpperCase() || (
              <UserIcon size={18} />
            )}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-semibold text-gray-800 dark:text-zinc-100 truncate">
                {comment.user_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 shrink-0">
                {formatDate(comment.created_at)}
              </p>
            </div>
            {isOwnComment && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 p-1 text-gray-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 shrink-0"
                onMouseDown={handleDelete}
                disabled={isDeleting}
                aria-label="Delete comment"
              >
                {isDeleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
              </Button>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-700 dark:text-zinc-300 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
          <div className="mt-2 flex items-center space-x-1 sm:space-x-3 flex-wrap">
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
                onMouseDown={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 p-1 h-auto text-xs text-gray-500 dark:text-zinc-400 hover:text-blue-500"
                aria-expanded={showReplyForm}
                aria-label="Reply to comment"
              >
                <MessageSquareReply size={14} />
                <span>Reply</span>
              </Button>
            )}
            {currentReplyCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onMouseDown={toggleReplies}
                disabled={isLoadingReplies}
                className="flex items-center gap-1 p-1 h-auto text-xs text-gray-500 dark:text-zinc-400 hover:text-blue-500"
                aria-expanded={areRepliesVisible}
                aria-label={areRepliesVisible ? "Hide replies" : "View replies"}
              >
                {isLoadingReplies ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : areRepliesVisible ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
                <span>
                  {currentReplyCount}{" "}
                  {currentReplyCount === 1 ? "Reply" : "Replies"}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {showReplyForm && (
        <div
          className={`mt-2 ${depth > 0 || (comment.parent_comment_id === null && depth === 0) ? "pl-8 sm:pl-10" : ""}`}
        >
          <CommentForm
            blogId={blogId}
            parentCommentId={comment.id}
            currentUser={currentUser}
            onCommentAdded={handleLocalReplyAdded}
            onCancel={() => setShowReplyForm(false)}
            placeholder={`Replying to ${comment.user_name}...`}
            submitButtonText="Post Reply"
          />
        </div>
      )}

      {areRepliesVisible && loadedReplies.length > 0 && (
        <div className="mt-3">
          {loadedReplies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              blogId={blogId}
              currentUser={currentUser}
              onCommentDeleted={handleChildReplyDeleted}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
      {areRepliesVisible &&
        loadedReplies.length === 0 &&
        currentReplyCount > 0 &&
        !isLoadingReplies && (
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-2 pl-8 sm:pl-10">
            No replies found or they may have been deleted.
          </p>
        )}
    </div>
  );
}
