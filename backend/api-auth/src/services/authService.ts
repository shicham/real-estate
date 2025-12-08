import bcrypt from 'bcryptjs'
import { User } from '../models/User'
import AppError from '../lib/AppError'
import tokenService from './tokenService'

export class AuthService {
  async signup(email: string, password: string) {
    const existing = await User.findOne({ email }).exec()
    if (existing) throw new AppError('User already exists', 400)

    const passwordHash = await bcrypt.hash(password, 10)
    const user = new User({ email, passwordHash })
    await user.save()
    return { id: user._id.toString(), email: user.email }
  }

  async signin(email: string, password: string) {
    // Check DB lock first
    const user = await User.findOne({ email }).exec()
    const attemptLimit = tokenService.getAttemptLimit()

    if (user && user.lockUntil && user.lockUntil > new Date()) {
      throw new AppError('Account temporarily locked due to repeated failed login attempts', 429)
    }

    // Try Redis attempts counter first (fast), fallback to DB if unavailable
    try {
      const attempts = await tokenService.getLoginAttempts(email)
      if (attempts >= attemptLimit) {
        // mark DB lock as well for consistency
        if (user) {
          const attemptWindow = Number(process.env.LOGIN_ATTEMPT_WINDOW || 15 * 60) * 1000
          await User.findByIdAndUpdate(user._id, { lockUntil: new Date(Date.now() + attemptWindow) }).exec()
        }
        throw new AppError('Too many login attempts. Try again later.', 429)
      }
    } catch (err) {
      // If Redis is not available, continue — DB lock will be checked above and DB counters used below
    }

    if (!user) {
      // increment Redis attempts if possible, otherwise nothing to do in DB
      try { await tokenService.incrementLoginAttempts(email) } catch (_) {}
      throw new AppError('Invalid credentials', 401)
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      // increment both Redis and DB counters
      try { await tokenService.incrementLoginAttempts(email) } catch (_) {}

      const updated = await User.findByIdAndUpdate(user._id, { $inc: { loginAttempts: 1 } }, { new: true }).exec()
      const currentAttempts = updated?.loginAttempts ?? 0
      if (currentAttempts >= attemptLimit) {
        const attemptWindow = Number(process.env.LOGIN_ATTEMPT_WINDOW || 15 * 60) * 1000
        await User.findByIdAndUpdate(user._id, { lockUntil: new Date(Date.now() + attemptWindow) }).exec()
      }

      throw new AppError('Invalid credentials', 401)
    }

    // success: reset attempts in both stores
    try { await tokenService.resetLoginAttempts(email) } catch (_) {}
    await User.findByIdAndUpdate(user._id, { loginAttempts: 0, lockUntil: null }).exec()

    const tokens = await tokenService.generateTokens(user._id.toString(), user.email)
    return { ...tokens, user: { id: user._id.toString(), email: user.email } }
  }

  async refresh(oldRefresh: string) {
    return tokenService.rotateRefreshToken(oldRefresh)
  }

  async logout(refresh: string) {
    return tokenService.revokeRefreshToken(refresh)
  }
}

const authService = new AuthService()
export default authService
