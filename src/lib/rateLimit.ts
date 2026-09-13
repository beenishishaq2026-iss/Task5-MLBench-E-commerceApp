import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const limiters = {
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '60 s'),
    prefix: 'ratelimit:auth',
  }),
  checkout: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '60 s'),
    prefix: 'ratelimit:checkout',
  }),
};

export async function checkRateLimit(key: string, type: keyof typeof limiters) {
  const { success, remaining } = await limiters[type].limit(key);
  return { success, remaining };
}