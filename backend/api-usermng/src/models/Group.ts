import { Schema, model, Types } from 'mongoose'

export interface IGroup {
  name: string
  code: string
  description?: string
  users?: Types.ObjectId[]
  createdAt?: Date
  updatedAt?: Date
}

const GroupSchema = new Schema<IGroup>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String },
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

GroupSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export const Group = model<IGroup>('Group', GroupSchema)