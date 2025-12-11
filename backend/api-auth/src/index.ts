// modified version of the original index.ts: now only starts the server (app is in src/app.ts)
import dotenv from 'dotenv'
dotenv.config()

import logger from './lib/logger'
import { connectMongo } from './lib/mongo'
import { connectRedis } from './lib/redis'
import app from './app'

async function start() {
  const PORT = process.env.PORT || 3001
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/real_estate_auth'
  const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`

  try {
    await connectMongo(mongoUri)
    connectRedis(redisUrl)
    app.listen(PORT, () => logger.info(`api-auth running on ${PORT}`))
  } catch (err) {
    logger.error('Failed to start services: %o', err)
    process.exit(1)
  }
}

// Don't start the server when running tests
if (process.env.NODE_ENV !== 'test') {
  start()
}

export { start }