import RateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";

export default class RateLimiterConfig {
  #client;
  #redisURI;
  #maxRequests;
  #windowMs;

  constructor(limiterConfig) {
    this.#client = limiterConfig.client;
    this.#redisURI = limiterConfig.redisURI;
    this.#maxRequests = limiterConfig.maxRequests;
    this.#windowMs = limiterConfig.windowMs;
  }

  get redisStoreLimiter() {
    return new RateLimit({
      store: new RedisStore({
        ...(this.#client
          ? { client: this.#client }
          : { redisURI: this.#redisURI })
      }),
      max: this.#maxRequests,
      windowMs: this.#windowMs
    });
  }
}
