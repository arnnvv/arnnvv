import { headers } from "next/headers";
import { IP_HEADERS } from "./constants";

export async function getClientIp(): Promise<string | null> {
  const requestHeaders = await headers();
  for (const header of IP_HEADERS) {
    const value = requestHeaders.get(header);
    if (value) {
      if (header === "x-forwarded-for") {
        return value.split(",")[0]?.trim() || null;
      }
      return value.trim();
    }
  }
  return null;
}
