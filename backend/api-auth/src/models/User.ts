import { Schema, model } from 'mongoose'

export interface IUser {
  email: string
  passwordHash: string
  createdAt?: Date
  // optional fields to track lockout/login attempts in DB (can be used instead of or alongside Redis)
  loginAttempts?: number
  lockUntil?: Date
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date }
})

export const User = model<IUser>('User', UserSchema)
