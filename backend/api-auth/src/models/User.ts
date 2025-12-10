import { Schema, model, Types } from 'mongoose'

export interface IUser {
  email: string
  passwordHash: string
  firstName?: string
  lastName?: string
  sex?: 'male' | 'female' | 'other'
  createdAt?: Date
  // optional fields to track lockout/login attempts in DB (can be used instead of or alongside Redis)
  loginAttempts?: number
  lockUntil?: Date
  preferredLanguage?: string
  lastLogin?: Date
  // associations to Role and Profile documents
  roles?: Types.ObjectId[]
  profiles?: Types.ObjectId[]
  // last login client IP
  lastLoginIP?: string
  // last login geo information (country, region, city, lat/lon)
  lastLoginGeo?: {
    ip?: string
    country?: string
    region?: string
    city?: string
    ll?: number[]
  }
  isEmailVerified?: boolean
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  preferredLanguage: { type: String, default: 'en' },
  firstName: { type: String },
  lastName: { type: String },
  sex: { type: String, enum: ['male','female','other'], default: null },
  lastLogin: { type: Date, default: null },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
  profiles: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
  lastLoginIP: { type: String, default: null },
  lastLoginGeo: {
    ip: { type: String },
    country: { type: String },
    region: { type: String },
    city: { type: String },
    ll: { type: [Number] }
  }
  , isEmailVerified: { type: Boolean, default: false }
})

export const User = model<IUser>('User', UserSchema)
