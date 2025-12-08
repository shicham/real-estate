import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User, IUser } from '../models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'

export async function signupService(email: string, password: string) {
  const existing = await User.findOne({ email }).exec()
  if (existing) throw new Error('User already exists')

  const passwordHash = await bcrypt.hash(password, 10)
  const user = new User({ email, passwordHash })
  await user.save()
  return { id: user._id.toString(), email: user.email }
}

export async function signinService(email: string, password: string) {
  const user = await User.findOne({ email }).exec()
  if (!user) throw new Error('Invalid credentials')

  const match = await bcrypt.compare(password, user.passwordHash)
  if (!match) throw new Error('Invalid credentials')

  const token = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  })

  return { token, user: { id: user._id.toString(), email: user.email } }
}
