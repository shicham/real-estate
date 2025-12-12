import mongoose from 'mongoose'
import logger from './logger.js'

export async function connectMongo(uri: string) {
  if (mongoose.connection.readyState === 1) return mongoose
  await mongoose.connect(uri)
  logger.info('Connected to MongoDB')
  return mongoose
}

export { mongoose }
