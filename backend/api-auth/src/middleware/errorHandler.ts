import { Request, Response, NextFunction } from 'express'
import AppError from '../lib/AppError'

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message })
  }

  // Unexpected / programming error
  console.error('Unhandled error:', err)
  return res.status(500).json({ error: 'Internal Server Error' })
}

export default errorHandler
