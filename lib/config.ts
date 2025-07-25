function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`FATAL: Environment variable ${key} is not set.`);
  }
  return value;
}

export const appConfig = {
  google: {
    clientId: getEnvVar("GOOGLE_CLIENT_ID"),
    clientSecret: getEnvVar("GOOGLE_CLIENT_SECRET"),
    redirectUrl: getEnvVar("GOOGLE_REDIRECT_URL"),
  },
  database: {
    connectionString: getEnvVar("DATABASE_URL"),
  },
  auth: {
    adminEmails: getEnvVar("ADMIN_EMAILS")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean),
  },
  smtp: {
    host: getEnvVar("SMTP_HOST"),
    port: Number(getEnvVar("SMTP_PORT")),
    user: getEnvVar("EMAIL"),
    pass: getEnvVar("EMAIL_PASS"),
    to: getEnvVar("EMAILTO"),
  },
};
