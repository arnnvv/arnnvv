"use server";

import { DatabaseError } from "@neondatabase/serverless";
import { cacheTag, revalidatePath, revalidateTag } from "next/cache";
import { cache } from "react";
import { isUserAdmin } from "@/lib/auth";
import { BLOGS_PER_PAGE } from "@/lib/constants";
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

    const newBlog = result.rows[0];
    if (!newBlog) {
      return {
        success: false,
        message: "Database did not return new blog post after insertion.",
      };
    }

    const { id: newBlogId, slug: newBlogSlug } = newBlog;
    revalidatePath("/blogs");
    revalidatePath(`/blogs/${newBlogSlug}`);
    revalidateTag("blogs", "max");

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

export const getBlogSummaries = cache(
  async (page = 1): Promise<BlogSummary[]> => {
    "use cache";
    cacheTag("blogs");

    const limit = BLOGS_PER_PAGE;
    const offset = (page - 1) * limit;

    try {
      const result = await db.query<BlogSummary>(
        `SELECT id, title, slug, created_at, updated_at
         FROM arnnvv_blogs
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      );
      return result.rows;
    } catch (e) {
      console.error(`Error fetching blog summaries for page ${page}: ${e}`);
      return [];
    }
  },
);

export const getBlogCount = cache(async (): Promise<number> => {
  "use cache";
  cacheTag("blogs");

  try {
    const result = await db.query<{ count: string }>(
      "SELECT COUNT(*) FROM arnnvv_blogs",
    );
    const blogCount = result.rows[0];
    if (!blogCount) {
      return 0;
    }
    return Number.parseInt(blogCount.count, 10);
  } catch (e) {
    console.error(`Error fetching blog count: ${e}`);
    return 0;
  }
});

export const getBlogPostBySlug = cache(
  async (slug: string): Promise<BlogPost | null> => {
    "use cache";
    cacheTag("blogs");

    try {
      const result = await db.query<BlogPost>(
        `SELECT id, title, slug, description, created_at, updated_at
         FROM arnnvv_blogs
         WHERE slug = $1
         LIMIT 1`,
        [slug],
      );
      if (result.rowCount === 0 || !result.rows[0]) {
        return null;
      }
      return result.rows[0];
    } catch (e) {
      console.error(`Error fetching blog post by slug (${slug}): ${e}`);
      return null;
    }
  },
);

export async function editBlog(formData: FormData): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return { success: false, message: "Rate limit exceeded." };
  }

  const { user } = await getCurrentSession();
  if (!isUserAdmin(user)) {
    return { success: false, message: "Not authorized." };
  }

  const blogId = Number(formData.get("blogId"));
  const title = formData.get("title") as string;
  const content = formData.get("description") as string;

  if (Number.isNaN(blogId)) {
    return { success: false, message: "Invalid Blog ID." };
  }
  if (!title || title.trim().length === 0) {
    return { success: false, message: "Title is required." };
  }
  if (!content || content.trim().length === 0) {
    return { success: false, message: "Content is required." };
  }

  const newSlug = slugify(title.trim());

  try {
    const oldBlogResult = await db.query<{ slug: string }>(
      `SELECT slug FROM arnnvv_blogs WHERE id = $1`,
      [blogId],
    );
    const oldSlug = oldBlogResult.rows[0]?.slug;

    if (!oldSlug) {
      return { success: false, message: "Blog to edit not found." };
    }

    await db.query(
      `UPDATE arnnvv_blogs SET title = $1, slug = $2, description = $3, updated_at = now() WHERE id = $4`,
      [title.trim(), newSlug, content.trim(), blogId],
    );

    if (oldSlug !== newSlug) {
      revalidatePath(`/blogs/${oldSlug}`);
    }
    revalidatePath(`/blogs/${newSlug}`);
    revalidatePath("/blogs", "layout");
    revalidateTag("blogs", "max");

    return { success: true, message: "Blog updated successfully!" };
  } catch (e) {
    console.error(`Error editing blog: ${e}`);
    if (e instanceof DatabaseError && e.code === "23505") {
      return {
        success: false,
        message:
          "A blog with a similar title already exists. Please try a different title.",
      };
    }
    return {
      success: false,
      message: "Error updating blog. Please try again.",
    };
  }
}

export const getAllBlogSummariesForEditing = cache(
  async (): Promise<{ id: number; title: string }[]> => {
    const { user } = await getCurrentSession();
    if (!isUserAdmin(user)) return [];
    const result = await db.query<{ id: number; title: string }>(
      `SELECT id, title FROM arnnvv_blogs ORDER BY created_at DESC`,
    );
    return result.rows;
  },
);

export async function getBlogForEditing(
  blogId: number,
): Promise<BlogPost | null> {
  "use server";
  const { user } = await getCurrentSession();
  if (!isUserAdmin(user)) return null;
  const result = await db.query<BlogPost>(
    `SELECT id, title, slug, description, created_at, updated_at FROM arnnvv_blogs WHERE id = $1`,
    [blogId],
  );
  return result.rows[0] ?? null;
}
