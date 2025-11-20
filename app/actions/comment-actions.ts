"use server";

import { DatabaseError } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";

import { isUserAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionResult, CommentWithDetails } from "@/lib/db/types";
import { globalPOSTRateLimit } from "@/lib/request";

import { getCurrentSession } from "./auth-actions";

export async function addCommentAction(
  formData: FormData,
): Promise<ActionResult & { comment?: CommentWithDetails }> {
  if (!(await globalPOSTRateLimit())) {
    return { success: false, message: "Rate limit exceeded." };
  }

  const { session, user } = await getCurrentSession();
  if (!session || !user) {
    return { success: false, message: "You must be logged in to comment." };
  }

  const content = formData.get("content") as string;
  const blogIdString = formData.get("blogId") as string;
  const parentCommentIdString = formData.get("parentCommentId") as
    | string
    | null;

  if (!content || content.trim().length === 0) {
    return { success: false, message: "Comment content cannot be empty." };
  }
  if (content.trim().length > 1000) {
    return {
      success: false,
      message: "Comment is too long (max 1000 characters).",
    };
  }
  if (!blogIdString) {
    return { success: false, message: "Blog ID is missing." };
  }
  const blogId = Number.parseInt(blogIdString, 10);
  if (Number.isNaN(blogId)) {
    return { success: false, message: "Invalid Blog ID." };
  }

  const parentCommentId = parentCommentIdString
    ? Number.parseInt(parentCommentIdString, 10)
    : null;
  if (parentCommentIdString && Number.isNaN(parentCommentId as number)) {
    return { success: false, message: "Invalid Parent Comment ID." };
  }

  try {
    const result = await db`
      WITH inserted_comment AS (
          INSERT INTO arnnvv_comments (blog_id, user_id, content, parent_comment_id)
          VALUES (${blogId}, ${user.id}, ${content.trim()}, ${
            parentCommentId ?? null
          })
          RETURNING id, blog_id, user_id, content, parent_comment_id, created_at, updated_at
      )
      SELECT
          ic.id, ic.blog_id, ic.user_id, ic.parent_comment_id, ic.content, ic.created_at, ic.updated_at,
          u.name AS user_name,
          u.picture AS user_picture,
          0 AS like_count,
          FALSE AS is_liked_by_current_user,
          0 AS reply_count
      FROM inserted_comment ic
      JOIN arnnvv_users u ON ic.user_id = u.id;
      `;

    const comments = result as CommentWithDetails[];

    if (comments.length === 1) {
      const newComment = comments[0];
      if (!newComment) {
        throw new Error(
          "Database returned length 1, but the item is undefined.",
        );
      }
      const blogPost = await db`
        SELECT slug FROM arnnvv_blogs WHERE id = ${blogId}
      `;
      const post = blogPost[0] as { slug: string } | undefined;
      if (post) {
        revalidatePath(`/blogs/${post.slug}`);
      } else {
        revalidatePath("/blogs");
      }
      return {
        success: true,
        message: "Comment added.",
        comment: newComment,
      };
    }
    throw new Error("Failed to add comment.");
  } catch (e) {
    console.error(`Error adding comment: ${e}`);
    return {
      success: false,
      message: "Error adding comment. Please try again.",
    };
  }
}

export async function getCommentsForBlogAction(
  blogId: number,
): Promise<CommentWithDetails[]> {
  const { user: currentUser } = await getCurrentSession();
  const currentUserId = currentUser?.id;

  try {
    const result = await db`
      SELECT
          c.id, c.blog_id, c.user_id, c.parent_comment_id, c.content, c.created_at, c.updated_at,
          u.name AS user_name,
          u.picture AS user_picture,
          c.like_count,
          c.reply_count,
          EXISTS(
              SELECT 1 FROM arnnvv_comment_likes cl_user
              WHERE cl_user.comment_id = c.id AND cl_user.user_id = ${
                currentUserId ?? null
              }
          ) AS is_liked_by_current_user
      FROM arnnvv_comments c
      JOIN arnnvv_users u ON c.user_id = u.id
      WHERE c.blog_id = ${blogId} AND c.parent_comment_id IS NULL
      ORDER BY c.created_at ASC;
      `;
    return result as CommentWithDetails[];
  } catch (e) {
    console.error(`Error fetching top-level comments: ${e}`);
    return [];
  }
}

export async function getRepliesForCommentAction(
  parentCommentId: number,
): Promise<CommentWithDetails[]> {
  const { user: currentUser } = await getCurrentSession();
  const currentUserId = currentUser?.id;

  try {
    const result = await db`
      SELECT
          c.id, c.blog_id, c.user_id, c.parent_comment_id, c.content, c.created_at, c.updated_at,
          u.name AS user_name,
          u.picture AS user_picture,
          c.like_count,
          c.reply_count,
          EXISTS(
              SELECT 1 FROM arnnvv_comment_likes cl_user
              WHERE cl_user.comment_id = c.id AND cl_user.user_id = ${
                currentUserId ?? null
              }
          ) AS is_liked_by_current_user
      FROM arnnvv_comments c
      JOIN arnnvv_users u ON c.user_id = u.id
      WHERE c.parent_comment_id = ${parentCommentId}
      ORDER BY c.created_at ASC;
      `;
    return result as CommentWithDetails[];
  } catch (e) {
    console.error(
      `Error fetching replies for comment ${parentCommentId}: ${e}`,
    );
    return [];
  }
}

export async function toggleLikeCommentAction(
  commentId: number,
): Promise<ActionResult & { isLiked?: boolean; newLikeCount?: number }> {
  if (!(await globalPOSTRateLimit())) {
    return { success: false, message: "Rate limit exceeded." };
  }

  const { session, user } = await getCurrentSession();
  if (!session || !user) {
    return {
      success: false,
      message: "You must be logged in to like a comment.",
    };
  }

  try {
    const existingLike = await db`
      SELECT 1 FROM arnnvv_comment_likes WHERE user_id = ${user.id} AND comment_id = ${commentId}
    `;

    let isLikedAfterToggle: boolean;

    if (existingLike.length > 0) {
      await db`
        DELETE FROM arnnvv_comment_likes WHERE user_id = ${user.id} AND comment_id = ${commentId}
      `;
      isLikedAfterToggle = false;
    } else {
      await db`
        INSERT INTO arnnvv_comment_likes (user_id, comment_id) VALUES (${user.id}, ${commentId})
      `;
      isLikedAfterToggle = true;
    }

    const likeCountResult = await db`
      SELECT COUNT(*) FROM arnnvv_comment_likes WHERE comment_id = ${commentId}
    `;
    const row = likeCountResult[0] as { count: string } | undefined;
    const newLikeCount = row ? Number.parseInt(row.count, 10) : 0;

    return {
      success: true,
      message: isLikedAfterToggle ? "Comment liked." : "Comment unliked.",
      isLiked: isLikedAfterToggle,
      newLikeCount: newLikeCount,
    };
  } catch (e) {
    console.error(`Error toggling like: ${e}`);
    if (e instanceof DatabaseError && e.code === "23503") {
      return { success: false, message: "Comment not found or user invalid." };
    }
    return {
      success: false,
      message: "Error processing like. Please try again.",
    };
  }
}

export async function deleteCommentAction(
  commentId: number,
): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return { success: false, message: "Rate limit exceeded." };
  }

  const { session, user } = await getCurrentSession();
  if (!session || !user) {
    return {
      success: false,
      message: "You must be logged in to delete comments.",
    };
  }

  try {
    const commentResult = await db`
      SELECT user_id, blog_id FROM arnnvv_comments WHERE id = ${commentId}
    `;

    const commentData = commentResult[0] as
      | { user_id: number; blog_id: number }
      | undefined;
    if (!commentData) {
      return { success: false, message: "Comment not found." };
    }

    const commentOwnerId = commentData.user_id;
    const blogIdOfComment = commentData.blog_id;

    if (commentOwnerId !== user.id && !isUserAdmin(user)) {
      return {
        success: false,
        message: "You are not authorized to delete this comment.",
      };
    }

    await db`
      DELETE FROM arnnvv_comments WHERE id = ${commentId}
    `;

    const blogPost = await db`
      SELECT slug FROM arnnvv_blogs WHERE id = ${blogIdOfComment}
    `;
    const post = blogPost[0] as { slug: string } | undefined;
    if (post) {
      revalidatePath(`/blogs/${post.slug}`);
    } else {
      revalidatePath("/blogs");
    }

    return { success: true, message: "Comment deleted successfully." };
  } catch (e) {
    console.error(`Error deleting comment: ${e}`);
    return {
      success: false,
      message:
        "An error occurred while deleting the comment. Please try again.",
    };
  }
}
