import { Schema, model, Types } from 'mongoose'

export interface IProfile {
  name: string
  code?: string
  description?: string
  // profiles can reference roles that apply to this profile
  roles?: Types.ObjectId[]
  // optional parent profile for hierarchy
  parent?: Types.ObjectId | null
  subProfiles?: Types.ObjectId[]
  createdAt?: Date
}

const ProfileSchema = new Schema<IProfile>({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  description: { type: String },
  roles: [{ type: Types.ObjectId, ref: 'Role' }],
  parent: { type: Types.ObjectId, ref: 'Profile', default: null },
  subProfiles: [{ type: Types.ObjectId, ref: 'Profile' }],
  createdAt: { type: Date, default: Date.now }
})

export const Profile = model<IProfile>('Profile', ProfileSchema)

export default Profile
