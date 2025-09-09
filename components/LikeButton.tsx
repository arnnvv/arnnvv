"use client";

import { Heart } from "lucide-react";
import { type JSX, useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleLikeCommentAction } from "@/app/actions/comment-actions";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/db/types";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  commentId: number;
  initialLikeCount: number;
  initialIsLiked: boolean;
  currentUser: User | null;
}

export function LikeButton({
  commentId,
  initialLikeCount,
  initialIsLiked,
  currentUser,
}: LikeButtonProps): JSX.Element {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(Number(initialLikeCount));
  const [isPending, startTransition] = useTransition();

  const handleLike = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to like comments.");
      return;
    }
    if (isPending) return;

    const originalIsLiked = isLiked;
    const originalLikeCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount((prevCount) => Number(prevCount) + (!isLiked ? 1 : -1));

    startTransition(async () => {
      const result = await toggleLikeCommentAction(commentId);
      if (result.success) {
        if (result.isLiked !== undefined) setIsLiked(result.isLiked);
        if (result.newLikeCount !== undefined)
          setLikeCount(Number(result.newLikeCount));
      } else {
        toast.error(result.message || "Failed to update like.");
        setIsLiked(originalIsLiked);
        setLikeCount(originalLikeCount);
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onMouseDown={handleLike}
      disabled={isPending || !currentUser}
      className={cn(
        "flex items-center gap-1 p-1 h-auto text-xs",
        isLiked
          ? "text-red-500 hover:text-red-600"
          : "text-gray-500 dark:text-zinc-400 hover:text-red-500",
      )}
      aria-pressed={isLiked}
      aria-label={isLiked ? "Unlike comment" : "Like comment"}
    >
      <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
      <span>{likeCount}</span>
    </Button>
  );
}
