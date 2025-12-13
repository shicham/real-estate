import { User } from '../models/User.js'
import { Role } from '../models/Role.js'
import { Profile } from '../models/Profile.js'
import { Group } from '../models/Group.js'
import AppError from '../lib/AppError.js'
import tokenService from './tokenService.js'
import emailService from './emailService.js'

export class UserService {
  async getAllUsers() {
    const users = await User.find()
      .populate('roles', 'code name')
      .populate('profiles', 'code name')
      .populate('groups', 'code name')
      .exec()
    return users
  }

  async getUserById(id: string) {
    const user = await User.findById(id)
      .populate('roles', 'code name')
      .populate('profiles', 'code name')
      .populate('groups', 'code name')
      .exec()
    if (!user) throw new AppError('User not found', 404)
    return user
  }

  async createUser(userData: {
    email: string
    firstName?: string
    lastName?: string
    sex?: 'male' | 'female' | 'other'
    preferredLanguage?: string
    roleCodes?: string[]
    profileCodes?: string[]
    groupCodes?: string[]
    sendPasswordReset?: boolean
  }) {
    const { email, roleCodes, profileCodes, groupCodes, ...userFields } = userData

    // Check if user already exists
    const existing = await User.findOne({ email }).exec()
    if (existing) throw new AppError('User already exists', 400)

    // Resolve roles by code to ObjectIds
    let roleIds: any[] = []
    if (roleCodes && roleCodes.length) {
      const found = await Role.find({ code: { $in: roleCodes } }).select('_id code').exec()
      const foundCodes = found.map(f => (f as any).code)
      const missing = roleCodes.filter(c => !foundCodes.includes(c))
      if (missing.length) throw new AppError(`Roles not found: ${missing.join(', ')}`, 400)
      roleIds = found.map(f => f._id)
    }

    // Resolve profiles by code to ObjectIds
    let profileIds: any[] = []
    if (profileCodes && profileCodes.length) {
      const foundP = await Profile.find({ code: { $in: profileCodes } }).select('_id code').exec()
      const foundPCodes = foundP.map(f => (f as any).code)
      const missingP = profileCodes.filter(c => !foundPCodes.includes(c))
      if (missingP.length) throw new AppError(`Profiles not found: ${missingP.join(', ')}`, 400)
      profileIds = foundP.map(f => f._id)
    }

    // Resolve groups by code to ObjectIds
    let groupIds: any[] = []
    if (groupCodes && groupCodes.length) {
      const foundG = await Group.find({ code: { $in: groupCodes } }).select('_id code').exec()
      const foundGCodes = foundG.map(f => (f as any).code)
      const missingG = groupCodes.filter(c => !foundGCodes.includes(c))
      if (missingG.length) throw new AppError(`Groups not found: ${missingG.join(', ')}`, 400)
      groupIds = foundG.map(f => f._id)
    }

    const user = new User({
      email,
      ...userFields,
      roles: roleIds,
      profiles: profileIds,
      groups: groupIds,
      isEmailVerified: true
    })

    await user.save()

    // Send password reset email if requested (default: true)
    if (userData.sendPasswordReset !== false) {
      try {
        const resetToken = tokenService.generatePasswordResetToken(user._id.toString(), user.email)
        await emailService.sendPasswordResetEmail(user.email, resetToken, user.preferredLanguage || 'en')
      } catch (err) {
        // Don't fail user creation if email sending fails
        console.warn('Failed to send password reset email:', err)
      }
    }

    return this.getUserById(user._id.toString())
  }

  async updateUser(id: string, userData: {
    firstName?: string
    lastName?: string
    sex?: 'male' | 'female' | 'other'
    preferredLanguage?: string
    roleCodes?: string[]
    profileCodes?: string[]
    groupCodes?: string[]
  }) {
    const { roleCodes, profileCodes, groupCodes, ...updateFields } = userData
    const updatePayload: any = { ...updateFields }

    // Resolve roles by code to ObjectIds
    if (roleCodes !== undefined) {
      let roleIds: any[] = []
      if (roleCodes && roleCodes.length) {
        const found = await Role.find({ code: { $in: roleCodes } }).select('_id code').exec()
        const foundCodes = found.map(f => (f as any).code)
        const missing = roleCodes.filter(c => !foundCodes.includes(c))
        if (missing.length) throw new AppError(`Roles not found: ${missing.join(', ')}`, 400)
        roleIds = found.map(f => f._id)
      }
      updatePayload.roles = roleIds
    }

    // Resolve profiles by code to ObjectIds
    if (profileCodes !== undefined) {
      let profileIds: any[] = []
      if (profileCodes && profileCodes.length) {
        const foundP = await Profile.find({ code: { $in: profileCodes } }).select('_id code').exec()
        const foundPCodes = foundP.map(f => (f as any).code)
        const missingP = profileCodes.filter(c => !foundPCodes.includes(c))
        if (missingP.length) throw new AppError(`Profiles not found: ${missingP.join(', ')}`, 400)
        profileIds = foundP.map(f => f._id)
      }
      updatePayload.profiles = profileIds
    }

    // Resolve groups by code to ObjectIds
    if (groupCodes !== undefined) {
      let groupIds: any[] = []
      if (groupCodes && groupCodes.length) {
        const foundG = await Group.find({ code: { $in: groupCodes } }).select('_id code').exec()
        const foundGCodes = foundG.map(f => (f as any).code)
        const missingG = groupCodes.filter(c => !foundGCodes.includes(c))
        if (missingG.length) throw new AppError(`Groups not found: ${missingG.join(', ')}`, 400)
        groupIds = foundG.map(f => f._id)
      }
      updatePayload.groups = groupIds
    }

    const user = await User.findByIdAndUpdate(id, updateFields, { new: true })
      .populate('roles', 'code name')
      .populate('profiles', 'code name')
      .populate('groups', 'code name')
      .exec()

    if (!user) throw new AppError('User not found', 404)
    return user
  }

  async deleteUser(id: string) {
    const user = await User.findByIdAndDelete(id).exec()
    if (!user) throw new AppError('User not found', 404)
    return { message: 'User deleted successfully' }
  }

  async addUserToGroups(userId: string, groupCodes: string[]) {
    const user = await User.findById(userId).exec()
    if (!user) throw new AppError('User not found', 404)

    const groups = await Group.find({ code: { $in: groupCodes } }).select('_id').exec()
    const groupIds = groups.map(g => g._id)

    const existingGroupIds = user.groups?.map(g => g.toString()) || []
    const newGroupIds = groupIds.filter(id => !existingGroupIds.includes(id.toString()))

    if (newGroupIds.length) {
      user.groups = [...(user.groups || []), ...newGroupIds]
      await user.save()

      // Update groups to include this user
      await Group.updateMany(
        { _id: { $in: newGroupIds } },
        { $addToSet: { users: userId } }
      )
    }

    return this.getUserById(userId)
  }

  async removeUserFromGroups(userId: string, groupCodes: string[]) {
    const user = await User.findById(userId).exec()
    if (!user) throw new AppError('User not found', 404)

    const groups = await Group.find({ code: { $in: groupCodes } }).select('_id').exec()
    const groupIdsToRemove = groups.map(g => g._id)

    user.groups = user.groups?.filter(g => !groupIdsToRemove.some(id => id.equals(g))) || []
    await user.save()

    // Update groups to remove this user
    await Group.updateMany(
      { _id: { $in: groupIdsToRemove } },
      { $pull: { users: userId } }
    )

    return this.getUserById(userId)
  }

  async addRolesToUser(userId: string, roleCodes: string[]) {
    const user = await User.findById(userId).exec()
    if (!user) throw new AppError('User not found', 404)

    const roles = await Role.find({ code: { $in: roleCodes } }).select('_id').exec()
    const roleIds = roles.map(r => r._id)

    const existingRoleIds = user.roles?.map(r => r.toString()) || []
    const newRoleIds = roleIds.filter(id => !existingRoleIds.includes(id.toString()))

    if (newRoleIds.length) {
      user.roles = [...(user.roles || []), ...newRoleIds]
      await user.save()
    }

    return this.getUserById(userId)
  }

  async removeRolesFromUser(userId: string, roleCodes: string[]) {
    const user = await User.findById(userId).exec()
    if (!user) throw new AppError('User not found', 404)

    const roles = await Role.find({ code: { $in: roleCodes } }).select('_id').exec()
    const roleIdsToRemove = roles.map(r => r._id)

    user.roles = user.roles?.filter(r => !roleIdsToRemove.some(id => id.equals(r))) || []
    await user.save()

    return this.getUserById(userId)
  }
}

const userService = new UserService()
export default userService