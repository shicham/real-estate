export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    // Maintains proper stack trace for where our error was thrown (only on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export default AppError
