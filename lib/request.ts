import { headers } from "next/headers";
import { limitGetRequests, limitPostRequests } from "./rate-limit";

export async function globalGETRateLimit(): Promise<boolean> {
  const clientIP = (await headers()).get("X-Forwarded-For") ?? "127.0.0.1";
  return limitGetRequests(clientIP);
}

export async function globalPOSTRateLimit(): Promise<boolean> {
  const clientIP = (await headers()).get("X-Forwarded-For") ?? "127.0.0.1";
  return limitPostRequests(clientIP);
}
