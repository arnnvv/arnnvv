import { Redis } from "@upstash/redis";
import { appConfig } from "./config";

export const redis = new Redis({
  url: appConfig.redis.url,
  token: appConfig.redis.token,
});
