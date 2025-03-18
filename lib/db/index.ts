import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export const getDB = (): string =>
  process.env.DATABASE_URL ??
  ((): never => {
    throw new Error("Missing DATABASE_URL");
  })();

export const pool = new Pool({ connectionString: getDB(), ssl: true });
export const db = drizzle(pool, { schema });
