import { appConfig } from "./config";
import { redis } from "./redis";

async function checkRateLimit(
  key: string,
  limit: number,
  windowInSeconds: number,
): Promise<boolean> {
  try {
    const now = Date.now();
    const windowStart = now - windowInSeconds * 1000;

    const pipeline = redis.multi();

    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zadd(key, { score: now, member: now.toString() });
    pipeline.zcard(key);
    pipeline.expire(key, windowInSeconds);

    const results = await pipeline.exec();

    if (!results || typeof results[2] !== "number") {
      console.error("Rate limiter failed to get a valid response from Redis.", {
        key,
      });
      return true;
    }

    const currentCount = results[2] as number;

    return currentCount <= limit;
  } catch (error) {
    console.error("Rate limiter has failed catastrophically.", {
      error,
      key,
    });
    return true;
  }
}

export function limitGetRequests(ip: string) {
  return checkRateLimit(
    `ratelimit_get:${ip}`,
    appConfig.rateLimits.get.limit,
    appConfig.rateLimits.get.window,
  );
}

export function limitPostRequests(ip: string) {
  return checkRateLimit(
    `ratelimit_post:${ip}`,
    appConfig.rateLimits.post.limit,
    appConfig.rateLimits.post.window,
  );
}
