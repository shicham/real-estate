import { Request, Response, NextFunction } from 'express'
import AppError from '../lib/AppError'
import logger from '../lib/logger'

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    logger.warn('AppError: %s', err.message)
    return res.status(err.statusCode).json({ error: err.message })
  }

  // Unexpected / programming error
  logger.error('Unhandled error: %o', err)
  return res.status(500).json({ error: 'Internal Server Error' })
}

export default errorHandler
