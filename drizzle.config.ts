import { getDB } from "@/lib/db";
import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: getDB(),
  },
  tablesFilter: ["arnnvv_"],
  out: "./lib/db/migrations/",
} satisfies Config;
