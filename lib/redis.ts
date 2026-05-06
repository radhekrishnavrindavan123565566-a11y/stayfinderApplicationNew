import Redis from 'ioredis';

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
};

// Create Redis client instance
let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis(redisConfig);

    redis.on('error', (err) => {
      console.error('[Redis] Connection error:', err);
    });

    redis.on('connect', () => {
      console.log('[Redis] Connected successfully');
    });
  }

  return redis;
}

// Graceful shutdown
export async function closeRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
