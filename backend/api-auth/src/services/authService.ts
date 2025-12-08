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
    const attempts = await tokenService.getLoginAttempts(email)
    const limit = tokenService.getAttemptLimit()
    if (attempts >= limit) {
      throw new AppError('Too many login attempts. Try again later.', 429)
    }

    const user = await User.findOne({ email }).exec()
    if (!user) {
      await tokenService.incrementLoginAttempts(email)
      throw new AppError('Invalid credentials', 401)
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      await tokenService.incrementLoginAttempts(email)
      throw new AppError('Invalid credentials', 401)
    }

    await tokenService.resetLoginAttempts(email)
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
