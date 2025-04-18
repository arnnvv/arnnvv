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
      message: "Subject is needed",
    };
  }

  try {
    const result = await db.query<{ id: number }>(
      `INSERT INTO arnnvv_blogs (title, description)
       VALUES ($1, $2)
       RETURNING id`,
      [title.trim(), content.trim()],
    );
    if (result.rowCount === 1) {
      const newBlogId = result.rows[0].id;

      return {
        success: true,
        message: `Blog Written ${newBlogId}`,
      };
    }
    throw new Error("Failed to insert blog post.");
  } catch {
    return {
      success: false,
      message: "Error Writing blog",
    };
  }
}
