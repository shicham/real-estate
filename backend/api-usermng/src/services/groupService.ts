import { Group } from '../models/Group.js'
import { User } from '../models/User.js'
import AppError from '../lib/AppError.js'

export class GroupService {
  async getAllGroups() {
    const groups = await Group.find()
      .populate('users', 'email firstName lastName')
      .exec()
    return groups
  }

  async getGroupById(id: string) {
    const group = await Group.findById(id)
      .populate('users', 'email firstName lastName')
      .exec()
    if (!group) throw new AppError('Group not found', 404)
    return group
  }

  async getGroupByCode(code: string) {
    const group = await Group.findOne({ code })
      .populate('users', 'email firstName lastName')
      .exec()
    if (!group) throw new AppError('Group not found', 404)
    return group
  }

  async createGroup(groupData: {
    name: string
    code: string
    description?: string
    userIds?: string[]
  }) {
    const { name, code, description, userIds } = groupData

    // Check if group already exists
    const existing = await Group.findOne({ code }).exec()
    if (existing) throw new AppError('Group already exists', 400)

    // Validate users if provided
    let userObjects: any[] = []
    if (userIds && userIds.length) {
      const users = await User.find({ _id: { $in: userIds } }).select('_id').exec()
      if (users.length !== userIds.length) {
        throw new AppError('Some users not found', 400)
      }
      userObjects = users.map(u => u._id)
    }

    const group = new Group({
      name,
      code,
      description,
      users: userObjects
    })

    await group.save()

    // Update users to include this group
    if (userObjects.length) {
      await User.updateMany(
        { _id: { $in: userObjects } },
        { $addToSet: { groups: group._id } }
      )
    }

    return this.getGroupById(group._id.toString())
  }

  async updateGroup(id: string, groupData: {
    name?: string
    code?: string
    description?: string
  }) {
    const group = await Group.findByIdAndUpdate(id, groupData, { new: true })
      .populate('users', 'email firstName lastName')
      .exec()

    if (!group) throw new AppError('Group not found', 404)
    return group
  }

  async deleteGroup(id: string) {
    const group = await Group.findById(id).exec()
    if (!group) throw new AppError('Group not found', 404)

    // Remove this group from all users
    await User.updateMany(
      { groups: id },
      { $pull: { groups: id } }
    )

    await Group.findByIdAndDelete(id).exec()
    return { message: 'Group deleted successfully' }
  }

  async addUsersToGroup(groupId: string, userIds: string[]) {
    const group = await Group.findById(groupId).exec()
    if (!group) throw new AppError('Group not found', 404)

    // Validate users
    const users = await User.find({ _id: { $in: userIds } }).select('_id').exec()
    if (users.length !== userIds.length) {
      throw new AppError('Some users not found', 400)
    }

    const existingUserIds = group.users?.map(u => u.toString()) || []
    const newUserIds = users
      .map(u => u._id)
      .filter(id => !existingUserIds.includes(id.toString()))

    if (newUserIds.length) {
      group.users = [...(group.users || []), ...newUserIds]
      await group.save()

      // Update users to include this group
      await User.updateMany(
        { _id: { $in: newUserIds } },
        { $addToSet: { groups: groupId } }
      )
    }

    return this.getGroupById(groupId)
  }

  async removeUsersFromGroup(groupId: string, userIds: string[]) {
    const group = await Group.findById(groupId).exec()
    if (!group) throw new AppError('Group not found', 404)

    // Validate users
    const users = await User.find({ _id: { $in: userIds } }).select('_id').exec()
    const userIdsToRemove = users.map(u => u._id)

    group.users = group.users?.filter(u => !userIdsToRemove.some(id => id.equals(u))) || []
    await group.save()

    // Update users to remove this group
    await User.updateMany(
      { _id: { $in: userIdsToRemove } },
      { $pull: { groups: groupId } }
    )

    return this.getGroupById(groupId)
  }
}

const groupService = new GroupService()
export default groupService