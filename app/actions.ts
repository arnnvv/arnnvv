"use server";

import {
  invalidateSession,
  type SessionValidationResult,
  validateSessionToken,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { globalPOSTRateLimit } from "@/lib/request";
import { deleteSessionTokenCookie } from "@/lib/session";
import type { ActionResult } from "@/type";
import { cookies } from "next/headers";
import { createTransport } from "nodemailer";
import { cache } from "react";
import { slugify } from "@/lib/utils";
import type {
  BlogSummary,
  BlogPost,
  CommentWithDetails,
  ProjectWithDetails,
} from "@/lib/db/types";
import { DatabaseError } from "pg";
import { revalidatePath } from "next/cache";

export async function sendEmailAtn(formdata: FormData): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return {
      success: false,
      message: "Rate Limit",
    };
  }

  const email = formdata.get("email") as string;
  const message = formdata.get("message") as string;
  const subject = formdata.get("subject") as string;

  if (!email) {
    return {
      success: false,
      message: "Email is needed",
    };
  }

  if (!subject) {
    return {
      success: false,
      message: "Subject is needed",
    };
  }

  if (!message) {
    return {
      success: false,
      message: "Message is needed",
    };
  }

  const transporter = createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.EMAILTO,
      subject: subject,
      text: `Message from ${email}\n\n${message}`,
    });
    return {
      success: true,
      message: "Message Sent",
    };
  } catch {
    return {
      success: false,
      message: "Error sending message",
    };
  }
}

export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult> => {
    const token = (await cookies()).get("session")?.value ?? null;
    if (token === null) {
      return {
        session: null,
        user: null,
      };
    }
    const result = await validateSessionToken(token);
    return result;
  },
);

export const signOutAction = async (): Promise<ActionResult> => {
  const { session } = await getCurrentSession();
  if (session === null)
    return {
      success: false,
      message: "Not authenticated",
    };

  if (!(await globalPOSTRateLimit())) {
    return {
      success: false,
      message: "Too many requests",
    };
  }
  try {
    await invalidateSession(session.id);
    await deleteSessionTokenCookie();
    return {
      success: true,
      message: "Logged Out",
    };
  } catch (e) {
    return {
      success: false,
      message: `Error LoggingOut ${e}`,
    };
  }
};

async function findUniqueSlug(title: string): Promise<string> {
  const baseSlug = slugify(title);
  let uniqueSlug = baseSlug;
  let counter = 0;

  while (true) {
    const { rows } = await db.query<{ slug: string }>(
      "SELECT slug FROM arnnvv_blogs WHERE slug = $1",
      [uniqueSlug],
    );
    if (rows.length === 0) {
      return uniqueSlug;
    }
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
}

export async function writeBlog(formdata: FormData): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return {
      success: false,
      message: "Rate Limit",
    };
  }

  const { user } = await getCurrentSession();
  if (user?.email !== process.env.EMAILTO) {
    return {
      success: false,
      message: "Not authenticated",
    };
  }

  const title = formdata.get("title") as string;
  const content = formdata.get("description") as string;

  if (!title || title.trim().length === 0) {
    return {
      success: false,
      message: "Title is needed",
    };
  }

  if (!content || content.trim().length === 0) {
    return {
      success: false,
      message: "Content is needed",
    };
  }

  try {
    const slug = await findUniqueSlug(title.trim());

    const result = await db.query<{ id: number; slug: string }>(
      `INSERT INTO arnnvv_blogs (title, slug, description)
       VALUES ($1, $2, $3)
       RETURNING id, slug`,
      [title.trim(), slug, content.trim()],
    );
    if (result.rowCount === 1) {
      const newBlogId = result.rows[0].id;
      const newBlogSlug = result.rows[0].slug;
      revalidatePath("/blogs");
      revalidatePath(`/blogs/${newBlogSlug}`);
      return {
        success: true,
        message: `Blog Written (ID: ${newBlogId}, Slug: ${newBlogSlug})`,
      };
    }
    throw new Error("Failed to insert blog post.");
  } catch (e) {
    console.error("Error writing blog:", e);
    if (e instanceof DatabaseError && e.code === "23505") {
      return {
        success: false,
        message:
          "A blog with a similar title already exists. Please try a different title.",
      };
    }
    return {
      success: false,
      message: "Error Writing blog. Please try again.",
    };
  }
}

export async function getBlogSummaries(): Promise<BlogSummary[]> {
  "use cache";
  try {
    const result = await db.query<BlogSummary>(
      `SELECT id, title, slug, created_at
       FROM arnnvv_blogs
       ORDER BY created_at DESC`,
    );
    return result.rows;
  } catch (e) {
    console.error("Error fetching blog summaries:", e);
    return [];
  }
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  "use cache";
  try {
    const result = await db.query<BlogPost>(
      `SELECT id, title, slug, description, created_at
       FROM arnnvv_blogs
       WHERE slug = $1
       LIMIT 1`,
      [slug],
    );
    if (result.rowCount === 0) {
      return null;
    }
    return result.rows[0];
  } catch (e) {
    console.error(`Error fetching blog post by slug (${slug}):`, e);
    return null;
  }
}

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
    const result = await db.query<CommentWithDetails>(
      `
      WITH inserted_comment AS (
          INSERT INTO arnnvv_comments (blog_id, user_id, content, parent_comment_id)
          VALUES ($1, $2, $3, $4)
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
      `,
      [blogId, user.id, content.trim(), parentCommentId ?? null],
    );

    if (result.rowCount === 1) {
      const blogPost = await db.query<{ slug: string }>(
        "SELECT slug FROM arnnvv_blogs WHERE id = $1",
        [blogId],
      );
      if (blogPost.rows.length > 0) {
        revalidatePath(`/blogs/${blogPost.rows[0].slug}`);
      } else {
        revalidatePath("/blogs");
      }
      return {
        success: true,
        message: "Comment added.",
        comment: result.rows[0],
      };
    }
    throw new Error("Failed to add comment.");
  } catch (e) {
    console.error("Error adding comment:", e);
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
    const result = await db.query<CommentWithDetails>(
      `
      SELECT
          c.id, c.blog_id, c.user_id, c.parent_comment_id, c.content, c.created_at, c.updated_at,
          u.name AS user_name,
          u.picture AS user_picture,
          COALESCE(l.like_count, 0) AS like_count,
          EXISTS(
              SELECT 1 FROM arnnvv_comment_likes cl_user
              WHERE cl_user.comment_id = c.id AND cl_user.user_id = $2
          ) AS is_liked_by_current_user,
          COALESCE(r.reply_count, 0) as reply_count
      FROM arnnvv_comments c
      JOIN arnnvv_users u ON c.user_id = u.id
      LEFT JOIN (
          SELECT comment_id, COUNT(*) as like_count
          FROM arnnvv_comment_likes
          GROUP BY comment_id
      ) l ON c.id = l.comment_id
      LEFT JOIN (
          SELECT parent_comment_id, COUNT(*) as reply_count
          FROM arnnvv_comments
          WHERE parent_comment_id IS NOT NULL
          GROUP BY parent_comment_id
      ) r ON c.id = r.parent_comment_id
      WHERE c.blog_id = $1 AND c.parent_comment_id IS NULL
      ORDER BY c.created_at ASC;
      `,
      [blogId, currentUserId ?? null],
    );
    return result.rows;
  } catch (e) {
    console.error("Error fetching top-level comments:", e);
    return [];
  }
}

export async function getRepliesForCommentAction(
  parentCommentId: number,
): Promise<CommentWithDetails[]> {
  const { user: currentUser } = await getCurrentSession();
  const currentUserId = currentUser?.id;

  try {
    const result = await db.query<CommentWithDetails>(
      `
      SELECT
          c.id, c.blog_id, c.user_id, c.parent_comment_id, c.content, c.created_at, c.updated_at,
          u.name AS user_name,
          u.picture AS user_picture,
          COALESCE(l.like_count, 0) AS like_count,
          EXISTS(
              SELECT 1 FROM arnnvv_comment_likes cl_user
              WHERE cl_user.comment_id = c.id AND cl_user.user_id = $2
          ) AS is_liked_by_current_user,
          COALESCE(r.reply_count, 0) as reply_count
      FROM arnnvv_comments c
      JOIN arnnvv_users u ON c.user_id = u.id
      LEFT JOIN (
          SELECT comment_id, COUNT(*) as like_count
          FROM arnnvv_comment_likes
          GROUP BY comment_id
      ) l ON c.id = l.comment_id
      LEFT JOIN (
          SELECT parent_comment_id AS sub_parent_id, COUNT(*) as reply_count
          FROM arnnvv_comments
          WHERE parent_comment_id IS NOT NULL
          GROUP BY parent_comment_id
      ) r ON c.id = r.sub_parent_id
      WHERE c.parent_comment_id = $1
      ORDER BY c.created_at ASC;
      `,
      [parentCommentId, currentUserId ?? null],
    );
    return result.rows;
  } catch (e) {
    console.error(`Error fetching replies for comment ${parentCommentId}:`, e);
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
    const existingLike = await db.query(
      "SELECT 1 FROM arnnvv_comment_likes WHERE user_id = $1 AND comment_id = $2",
      [user.id, commentId],
    );

    let isLikedAfterToggle: boolean;

    if ((existingLike.rowCount ?? 0) > 0) {
      await db.query(
        "DELETE FROM arnnvv_comment_likes WHERE user_id = $1 AND comment_id = $2",
        [user.id, commentId],
      );
      isLikedAfterToggle = false;
    } else {
      await db.query(
        "INSERT INTO arnnvv_comment_likes (user_id, comment_id) VALUES ($1, $2)",
        [user.id, commentId],
      );
      isLikedAfterToggle = true;
    }

    const likeCountResult = await db.query<{ count: string }>(
      "SELECT COUNT(*) FROM arnnvv_comment_likes WHERE comment_id = $1",
      [commentId],
    );
    const newLikeCount = Number.parseInt(likeCountResult.rows[0].count, 10);

    return {
      success: true,
      message: isLikedAfterToggle ? "Comment liked." : "Comment unliked.",
      isLiked: isLikedAfterToggle,
      newLikeCount: newLikeCount,
    };
  } catch (e) {
    console.error("Error toggling like:", e);
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
    const commentResult = await db.query<{ user_id: number; blog_id: number }>(
      "SELECT user_id, blog_id FROM arnnvv_comments WHERE id = $1",
      [commentId],
    );

    if (commentResult.rowCount === 0) {
      return { success: false, message: "Comment not found." };
    }

    const commentOwnerId = commentResult.rows[0].user_id;
    const blogIdOfComment = commentResult.rows[0].blog_id;

    if (commentOwnerId !== user.id) {
      return {
        success: false,
        message: "You are not authorized to delete this comment.",
      };
    }

    const deleteOp = await db.query(
      "DELETE FROM arnnvv_comments WHERE id = $1",
      [commentId],
    );

    if (deleteOp.rowCount === 0) {
      return {
        success: false,
        message: "Failed to delete comment or comment already deleted.",
      };
    }

    const blogPost = await db.query<{ slug: string }>(
      "SELECT slug FROM arnnvv_blogs WHERE id = $1",
      [blogIdOfComment],
    );
    if (blogPost.rows.length > 0) {
      revalidatePath(`/blogs/${blogPost.rows[0].slug}`);
    } else {
      revalidatePath("/blogs");
    }

    return { success: true, message: "Comment deleted successfully." };
  } catch (e) {
    console.error("Error deleting comment:", e);
    return {
      success: false,
      message:
        "An error occurred while deleting the comment. Please try again.",
    };
  }
}

export async function addProjectAction(
  formData: FormData,
): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return { success: false, message: "Rate limit exceeded." };
  }

  const { user } = await getCurrentSession();
  if (user?.email !== process.env.EMAILTO) {
    return { success: false, message: "Not authorized to add projects." };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const technologiesString = formData.get("technologies") as string;
  const linksJsonString = formData.get("links") as string;

  if (!title || title.trim().length === 0) {
    return { success: false, message: "Project title is required." };
  }
  if (!description || description.trim().length === 0) {
    return { success: false, message: "Project description is required." };
  }

  const technologiesArray = technologiesString
    ? technologiesString
        .split(",")
        .map((tech) => tech.trim())
        .filter((tech) => tech.length > 0)
    : [];

  let parsedLinks: Array<{ link_type: string; url: string }>;
  try {
    parsedLinks = linksJsonString ? JSON.parse(linksJsonString) : [];
    if (
      !Array.isArray(parsedLinks) ||
      !parsedLinks.every(
        (link) =>
          typeof link === "object" &&
          link !== null &&
          typeof link.link_type === "string" &&
          link.link_type.trim() !== "" &&
          typeof link.url === "string" &&
          link.url.trim() !== "",
      )
    ) {
      throw new Error("Invalid links format.");
    }
  } catch (_e) {
    return {
      success: false,
      message:
        "Invalid format for project links. Each link must have a non-empty 'link_type' and 'url'.",
    };
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const projectInsertResult = await client.query<{ id: number }>(
      `INSERT INTO arnnvv_projects (title, description)
       VALUES ($1, $2)
       RETURNING id`,
      [title.trim(), description.trim()],
    );

    if (
      projectInsertResult.rowCount === 0 ||
      !projectInsertResult.rows[0]?.id
    ) {
      throw new Error("Failed to insert project main details.");
    }
    const projectId = projectInsertResult.rows[0].id;

    if (technologiesArray.length > 0) {
      const techValues = technologiesArray
        .map((_, index) => `($1, $${index + 2})`)
        .join(",");
      const techParams = [projectId, ...technologiesArray];
      await client.query(
        `INSERT INTO arnnvv_project_technologies (project_id, technology) VALUES ${techValues}`,
        techParams,
      );
    }

    if (parsedLinks.length > 0) {
      const linkValues = parsedLinks
        .map((_, index) => `($1, $${index * 2 + 2}, $${index * 2 + 3})`)
        .join(",");
      const linkParams: (string | number)[] = [projectId];
      for (const link of parsedLinks) {
        linkParams.push(link.link_type, link.url);
      }
      await client.query(
        `INSERT INTO arnnvv_project_links (project_id, link_type, url) VALUES ${linkValues}`,
        linkParams,
      );
    }

    await client.query("COMMIT");
    revalidatePath("/work");
    return { success: true, message: "Project added successfully!" };
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Error adding project with transaction:", e);
    if (e instanceof DatabaseError && e.code === "23505") {
      return {
        success: false,
        message: "A project with this title already exists.",
      };
    }
    return {
      success: false,
      message: "Error adding project. Please try again.",
    };
  } finally {
    client.release();
  }
}

export async function getProjectsAction(): Promise<ProjectWithDetails[]> {
  try {
    const query = `
      WITH project_techs AS (
        SELECT
          project_id,
          ARRAY_AGG(technology ORDER BY technology) as technologies
        FROM arnnvv_project_technologies
        GROUP BY project_id
      ), project_links_agg AS (
        SELECT
          project_id,
          JSONB_AGG(JSONB_BUILD_OBJECT('link_type', link_type, 'url', url) ORDER BY id) as links_json -- Order by link id for consistency
        FROM arnnvv_project_links
        GROUP BY project_id
      )
      SELECT
        p.id,
        p.title,
        p.description,
        COALESCE(pt.technologies, '{}'::text[]) as technologies,
        COALESCE(pl.links_json, '[]'::jsonb) as links
      FROM arnnvv_projects p
      LEFT JOIN project_techs pt ON p.id = pt.project_id
      LEFT JOIN project_links_agg pl ON p.id = pl.project_id
    `;
    const result = await db.query<ProjectWithDetails>(query);
    return result.rows;
  } catch (e) {
    console.error("Error fetching projects with details:", e);
    return [];
  }
}
