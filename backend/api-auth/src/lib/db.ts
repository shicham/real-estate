import mongoose from 'mongoose'
import Redis from 'ioredis'
import logger from './logger'

let redisClient: Redis | null = null

export async function connectMongo(uri: string) {
  if (mongoose.connection.readyState === 1) return mongoose
  await mongoose.connect(uri)
  logger.info('Connected to MongoDB')
  return mongoose
}

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
