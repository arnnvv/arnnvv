import { limitGetRequests, limitPostRequests } from "./rate-limit";
import { getClientIp } from "./ip";

export async function globalGETRateLimit(): Promise<boolean> {
  const clientIP = await getClientIp();
  if (clientIP === null) return true;
  return limitGetRequests(clientIP);
}

export async function globalPOSTRateLimit(): Promise<boolean> {
  const clientIP = await getClientIp();
  if (clientIP === null) return true;
  return limitPostRequests(clientIP);
}
