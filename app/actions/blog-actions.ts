"use server";

import { DatabaseError } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";
import { isUserAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionResult, BlogPost, BlogSummary } from "@/lib/db/types";
import { globalPOSTRateLimit } from "@/lib/request";
import { slugify } from "@/lib/utils";
import { getCurrentSession } from "./auth-actions";

export async function writeBlog(formdata: FormData): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return {
      success: false,
      message: "Rate Limit",
    };
  }

  const { user } = await getCurrentSession();
  if (!isUserAdmin(user)) {
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

  const slug = slugify(title.trim());

  try {
    const result = await db.query<{ id: number; slug: string }>(
      `INSERT INTO arnnvv_blogs (title, slug, description)
       VALUES ($1, $2, $3)
       RETURNING id, slug`,
      [title.trim(), slug, content.trim()],
    );

    const { id: newBlogId, slug: newBlogSlug } = result.rows[0];
    revalidatePath("/blogs");
    revalidatePath(`/blogs/${newBlogSlug}`);
    return {
      success: true,
      message: `Blog Written (ID: ${newBlogId}, Slug: ${newBlogSlug})`,
    };
  } catch (e) {
    console.error(`Error writing blog: ${e}`);
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
    console.error(`Error fetching blog summaries: ${e}`);
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
    console.error(`Error fetching blog post by slug (${slug}): ${e}`);
    return null;
  }
}
