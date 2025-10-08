import { getClientIp } from "./ip";
import { limitGetRequests, limitPostRequests } from "./rate-limit";

export async function globalGETRateLimit(): Promise<boolean> {
  const clientIP = await getClientIp();
  if (clientIP === null || clientIP === "127.0.0.1" || clientIP === "::1") {
    return true;
  }
  return limitGetRequests(clientIP);
}

export async function globalPOSTRateLimit(): Promise<boolean> {
  const clientIP = await getClientIp();
  if (clientIP === null || clientIP === "127.0.0.1" || clientIP === "::1") {
    return true;
  }
  return limitPostRequests(clientIP);
}
