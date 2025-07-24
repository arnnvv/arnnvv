import { cookies } from "next/headers";
import {
  generateState,
  generateCodeVerifier,
  generateNonce,
  google,
} from "@/lib/oauth";

export async function GET(): Promise<Response> {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const nonce = generateNonce();

  const url = await google.createAuthorizationURL(state, codeVerifier, nonce, [
    "openid",
    "profile",
    "email",
  ]);

  const cookieOptions = {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    sameSite: "lax" as const,
  };

  const c = await cookies();
  c.set("google_oauth_state", state, cookieOptions);
  c.set("google_code_verifier", codeVerifier, cookieOptions);
  c.set("google_oauth_nonce", nonce, cookieOptions);

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
    },
  });
}
