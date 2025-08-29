import { appConfig } from "./config";
import { redis } from "./redis";

const COUNTER_SCRIPT = `
  local current_key = KEYS[1]
  local previous_key = KEYS[2]
  local limit = tonumber(ARGV[1])
  local window_millis = tonumber(ARGV[2])
  local now_millis = tonumber(ARGV[3])

  local previous_count = tonumber(redis.call('GET', previous_key)) or 0

  local current_count = redis.call('INCR', current_key)

  if current_count == 1 then
    redis.call('PEXPIRE', current_key, window_millis * 2)
  end

  local time_in_window = now_millis % window_millis
  local weight = (window_millis - time_in_window) / window_millis
  local weighted_previous_count = math.floor(previous_count * weight)

  local estimated_count = (current_count - 1) + weighted_previous_count

  if estimated_count < limit then
    return 1
  else
    redis.call('DECR', current_key)
    return 0
  end
`;

async function sWindowCounter(
  key: string,
  limit: number,
  windowInSeconds: number,
): Promise<boolean> {
  const now = Date.now();
  const windowMillis = windowInSeconds * 1000;
  const currentWindow = Math.floor(now / windowMillis);

  const currentKey = `${key}:${currentWindow}`;
  const previousKey = `${key}:${currentWindow - 1}`;

  const result = await redis.eval(
    COUNTER_SCRIPT,
    [currentKey, previousKey],
    [limit, windowMillis, now],
  );

  return result === 1;
}

export function limitGetRequests(ip: string) {
  return sWindowCounter(
    `ratelimit_get:${ip}`,
    appConfig.rateLimits.get.limit,
    appConfig.rateLimits.get.window,
  );
}

export function limitPostRequests(ip: string) {
  return sWindowCounter(
    `ratelimit_post:${ip}`,
    appConfig.rateLimits.post.limit,
    appConfig.rateLimits.post.window,
  );
}
