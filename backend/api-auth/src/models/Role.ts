import { Schema, model, Types } from 'mongoose'

export interface IRole {
  name: string
  code?: string
  description?: string
  // optional parent role for simple hierarchy
  parent?: Types.ObjectId | null
  // optional direct children references
  subRoles?: Types.ObjectId[]
  createdAt?: Date
}

const RoleSchema = new Schema<IRole>({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  description: { type: String },
  parent: { type: Types.ObjectId, ref: 'Role', default: null },
  subRoles: [{ type: Types.ObjectId, ref: 'Role' }],
  createdAt: { type: Date, default: Date.now }
})

export const Role = model<IRole>('Role', RoleSchema)

export default Role
