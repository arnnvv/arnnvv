import { encodeBase64urlNoPadding } from "./encoding";
import { Google } from "./google";
import { validateIdToken } from "./token";

export function generateState(): string {
  const randomValues = new Uint8Array(32);
  crypto.getRandomValues(randomValues);
  return encodeBase64urlNoPadding(randomValues);
}

export function generateCodeVerifier(): string {
  const randomValues = new Uint8Array(32);
  crypto.getRandomValues(randomValues);
  return encodeBase64urlNoPadding(randomValues);
}

export function generateNonce(): string {
  const randomValues = new Uint8Array(32);
  crypto.getRandomValues(randomValues);
  return encodeBase64urlNoPadding(randomValues);
}

const getOAuthCredentials = (): {
  clientId: string;
  clientSecret: string;
  redirectURL: string;
} => {
  const clientIdEnv = process.env.GOOGLE_CLIENT_ID;
  const clientSecretEnv = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUrlEnv = process.env.GOOGLE_REDIRECT_URL;

  if (!clientIdEnv) throw new Error("GOOGLE_CLIENT_ID missing");
  if (!clientSecretEnv) throw new Error("GOOGLE_CLIENT_SECRET missing");
  if (!redirectUrlEnv) throw new Error("GOOGLE_REDIRECT_URL missing");

  return {
    clientId: clientIdEnv,
    clientSecret: clientSecretEnv,
    redirectURL: redirectUrlEnv,
  };
};

async function validateGoogleIdToken(
  idToken: string,
  nonce: string,
): Promise<object> {
  const { clientId } = getOAuthCredentials();
  return validateIdToken(idToken, clientId, nonce);
}

export const google = new Google(
  getOAuthCredentials().clientId,
  getOAuthCredentials().clientSecret,
  getOAuthCredentials().redirectURL,
);

google.validateIdToken = validateGoogleIdToken;
