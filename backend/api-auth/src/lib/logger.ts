import fs from 'fs'
import path from 'path'
import winston from 'winston'

const LOG_PATH = process.env.LOG_PATH || 'logs/api-auth.log'
const LOG_LEVEL = process.env.LOG_LEVEL || 'info'

// Ensure log directory exists
const logDir = path.dirname(LOG_PATH)
try {
  fs.mkdirSync(logDir, { recursive: true })
} catch (err) {
  // ignore directory creation errors; winston will fail later if needed
}

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: LOG_PATH })
  ],
  exitOnError: false
})

// also log to console in non-production for convenience
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }))
}

export default {logger}
