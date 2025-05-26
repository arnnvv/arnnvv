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
import type { BlogSummary, BlogPost } from "@/lib/db/types";
import { DatabaseError } from "pg";

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
