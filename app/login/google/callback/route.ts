import { cookies } from "next/headers";
import { google } from "@/lib/oauth";
import {
  createUser,
  getUserFromGoogleId,
  updateUserIfNeeded,
} from "@/lib/user";
import { createSession, generateSessionToken } from "@/lib/auth";
import { setSessionTokenCookie } from "@/lib/session";
import { ObjectParser } from "@/lib/parser";
import type { OAuth2Tokens } from "@/lib/oauth-token";
import { globalGETRateLimit } from "@/lib/request";
import { getCurrentSession } from "@/app/actions";

export async function GET(request: Request): Promise<Response> {
  if (!(await globalGETRateLimit())) {
    return new Response("Too many requests", {
      status: 429,
    });
  }
  const { session } = await getCurrentSession();
  if (session !== null) {
    return new Response("Already logged in", {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const c = await cookies();
  const storedState = c.get("google_oauth_state")?.value ?? null;
  const codeVerifier = c.get("google_code_verifier")?.value ?? null;
  const nonce = c.get("google_oauth_nonce")?.value ?? null;

  c.delete("google_oauth_state");
  c.delete("google_code_verifier");
  c.delete("google_oauth_nonce");

  if (
    !code ||
    !state ||
    !storedState ||
    !codeVerifier ||
    !nonce ||
    state !== storedState
  ) {
    return new Response("Invalid request. Please try again.", {
      status: 400,
    });
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  } catch (e) {
    console.error("Failed to validate authorization code:", e);
    return new Response("Authentication failed. Please try again.", {
      status: 400,
    });
  }

  let claims: object;
  try {
    claims = await google.validateIdToken(tokens.idToken(), nonce);
  } catch (e) {
    console.error("ID Token validation failed:", e);
    return new Response("Invalid ID Token. Please try again.", { status: 401 });
  }

  const claimsParser = new ObjectParser(claims);

  const googleId = claimsParser.getString("sub");
  const name = claimsParser.getString("name");
  const picture = claimsParser.getString("picture");
  const email = claimsParser.getString("email");

  let userId: number;
  const existingUser = await getUserFromGoogleId(googleId);

  if (existingUser) {
    userId = existingUser.id;
    if (existingUser.name !== name || existingUser.picture !== picture) {
      await updateUserIfNeeded(userId, {
        name,
        picture,
      });
    }
  } else {
    const newUser = await createUser(googleId, email, name, picture);
    userId = newUser.id;
  }

  const sessionToken = generateSessionToken();
  const newSession = await createSession(sessionToken, userId);
  setSessionTokenCookie(sessionToken, newSession.expires_at);

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
    },
  });
}
