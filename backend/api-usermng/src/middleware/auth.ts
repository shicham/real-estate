import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import tokenService from '../services/tokenService.js'
import AppError from '../lib/AppError.js'

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email?: string
        preferredLanguage?: string
        roles?: string[]
        profiles?: string[]
      }
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, tokenService.accessSecret) as any

    if (!decoded || !decoded.sub) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Attach user info to request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      preferredLanguage: decoded.preferredLanguage,
      roles: decoded.roles,
      profiles: decoded.profiles
    }

    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' })
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    return res.status(500).json({ error: 'Authentication error' })
  }
}

export const requireRole = (requiredRoles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const userRoles = req.user.roles || []
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]

    const hasRequiredRole = roles.some(role => userRoles.includes(role))

    if (!hasRequiredRole) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: roles,
        userRoles: userRoles
      })
    }

    next()
  }
}

export const requireAdmin = requireRole('admin')
export const requireModerator = requireRole(['admin', 'moderator'])