import { appConfig } from "./config";
import { encodeBase64urlNoPadding } from "./encoding";
import { Google } from "./google";
import { validateIdToken as internalValidateIdToken } from "./token";

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

async function validateGoogleIdToken(
  idToken: string,
  nonce: string,
): Promise<object> {
  return internalValidateIdToken(idToken, appConfig.google.clientId, nonce);
}

export const google = new Google(
  appConfig.google.clientId,
  appConfig.google.clientSecret,
  appConfig.google.redirectUrl,
);

google.validateIdToken = validateGoogleIdToken;
