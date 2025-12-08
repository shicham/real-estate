import Redis from 'ioredis'
import logger from './logger'

let redisClient: Redis | null = null

export function connectRedis(url: string) {
  if (redisClient) return redisClient
  redisClient = new Redis(url)
  redisClient.on('error', (err) => logger.error('Redis error: %o', err))
  redisClient.on('connect', () => logger.info('Connected to Redis'))
  return redisClient
}

export function getRedis() {
  if (!redisClient) throw new Error('Redis client not initialized')
  return redisClient
}

export { Redis }
