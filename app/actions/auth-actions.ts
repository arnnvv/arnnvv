"use server";

import { cookies } from "next/headers";
import { cache } from "react";
import {
  invalidateSession,
  type SessionValidationResult,
  validateSessionToken,
} from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { globalPOSTRateLimit } from "@/lib/request";
import { deleteSessionTokenCookie } from "@/lib/session";
import type { ActionResult } from "@/type";

export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult> => {
    const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value ?? null;
    if (token === null) {
      return {
        session: null,
        user: null,
      };
    }
    return validateSessionToken(token);
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
    console.error(`Error signing out: ${e}`);
    return {
      success: false,
      message: "Error Logging Out",
    };
  }
};
