import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'
import AppError from '../lib/AppError'

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'change-this-secret'
const JWT_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES || '1h'

export async function signupService(email: string, password: string) {
  const existing = await User.findOne({ email }).exec()
  if (existing) throw new AppError('User already exists', 400)

  const passwordHash = await bcrypt.hash(password, 10)
  const user = new User({ email, passwordHash })
  await user.save()
  return { id: user._id.toString(), email: user.email }
}

export async function signinService(email: string, password: string) {
  const user = await User.findOne({ email }).exec()
  if (!user) throw new AppError('Invalid credentials', 401)

  const match = await bcrypt.compare(password, user.passwordHash)
  if (!match) throw new AppError('Invalid credentials', 401)

  const token = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  })

  return { token, user: { id: user._id.toString(), email: user.email } }
}
