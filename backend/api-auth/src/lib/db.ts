import mongoose from 'mongoose'
import Redis from 'ioredis'

let redisClient: Redis | null = null

export async function connectMongo(uri: string) {
  if (mongoose.connection.readyState === 1) return mongoose
  await mongoose.connect(uri)
  return mongoose
}

export function connectRedis(url: string) {
  if (redisClient) return redisClient
  redisClient = new Redis(url)
  redisClient.on('error', (err) => console.error('Redis error', err))
  return redisClient
}

export function getRedis() {
  if (!redisClient) throw new Error('Redis client not initialized')
  return redisClient
}
