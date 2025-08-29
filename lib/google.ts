import {
  GOOGLE_ACCOUNTS_AUTH_ENDPOINT,
  GOOGLE_REVOKE_ENDPOINT,
  GOOGLE_TOKEN_ENDPOINT,
} from "./constants";
import { CodeChallengeMethod, OAuth2Client } from "./oauth-client";
import type { OAuth2Tokens } from "./oauth-token";

export class Google {
  private client: OAuth2Client;
  public validateIdToken!: (idToken: string, nonce: string) => Promise<object>;

  constructor(clientId: string, clientSecret: string, redirectURI: string) {
    this.client = new OAuth2Client(clientId, clientSecret, redirectURI);
  }

  public async createAuthorizationURL(
    state: string,
    codeVerifier: string,
    nonce: string,
    scopes: string[],
  ): Promise<URL> {
    const url = await this.client.createAuthorizationURLWithPKCE(
      GOOGLE_ACCOUNTS_AUTH_ENDPOINT,
      state,
      CodeChallengeMethod.S256,
      codeVerifier,
      scopes,
    );
    url.searchParams.set("nonce", nonce);
    return url;
  }

  public async validateAuthorizationCode(
    code: string,
    codeVerifier: string,
  ): Promise<OAuth2Tokens> {
    const tokens = await this.client.validateAuthorizationCode(
      GOOGLE_TOKEN_ENDPOINT,
      code,
      codeVerifier,
    );
    return tokens;
  }

  public async refreshAccessToken(refreshToken: string): Promise<OAuth2Tokens> {
    const tokens = await this.client.refreshAccessToken(
      GOOGLE_TOKEN_ENDPOINT,
      refreshToken,
      [],
    );
    return tokens;
  }

  public async revokeToken(token: string): Promise<void> {
    await this.client.revokeToken(GOOGLE_REVOKE_ENDPOINT, token);
  }
}
