import { limitGetRequests, limitPostRequests } from "./rate-limit";
import { getClientIp } from "./ip";

export async function globalGETRateLimit(): Promise<boolean> {
  const clientIP = (await getClientIp()) ?? "127.0.0.1";
  return limitGetRequests(clientIP);
}

export async function globalPOSTRateLimit(): Promise<boolean> {
  const clientIP = (await getClientIp()) ?? "127.0.0.1";
  return limitPostRequests(clientIP);
}
