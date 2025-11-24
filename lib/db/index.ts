import { neon } from "@neondatabase/serverless";

import { appConfig } from "../config";

export const db = neon(appConfig.database.connectionString);
