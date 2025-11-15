import { db } from "./db";
import type { User } from "./db/types";

export async function upsertUserFromGoogleProfile(
  googleId: string,
  email: string,
  name: string,
  picture: string,
): Promise<User> {
  try {
    const users = await db`
    INSERT INTO arnnvv_users (google_id, email, name, picture)
    VALUES (${googleId}, ${email}, ${name}, ${picture})
    ON CONFLICT (google_id)
    DO UPDATE SET
      name = EXCLUDED.name,
      picture = EXCLUDED.picture,
      email = EXCLUDED.email
    RETURNING id, google_id, email, name, picture;
  `;
    const user = users[0] as User | undefined;

    if (!user) {
      throw new Error("Database did not return user after upsert operation.");
    }

    return user;
  } catch (error) {
    console.error(`Error upserting user: ${error}`);
    throw new Error("Could not create or update user profile.");
  }
}
