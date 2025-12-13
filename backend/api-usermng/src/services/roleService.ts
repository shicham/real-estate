import { Role } from '../models/Role.js'
import AppError from '../lib/AppError.js'

export class RoleService {
  async getAllRoles() {
    const roles = await Role.find().exec()
    return roles
  }

  async getRoleById(id: string) {
    const role = await Role.findById(id).exec()
    if (!role) throw new AppError('Role not found', 404)
    return role
  }

  async getRoleByCode(code: string) {
    const role = await Role.findOne({ code }).exec()
    if (!role) throw new AppError('Role not found', 404)
    return role
  }

  async createRole(roleData: {
    name: string
    code: string
    description?: string
  }) {
    const { name, code, description } = roleData

    // Check if role already exists
    const existing = await Role.findOne({ code }).exec()
    if (existing) throw new AppError('Role already exists', 400)

    const role = new Role({
      name,
      code,
      description
    })

    await role.save()
    return role
  }

  async updateRole(id: string, roleData: {
    name?: string
    code?: string
    description?: string
  }) {
    const role = await Role.findByIdAndUpdate(id, roleData, { new: true }).exec()
    if (!role) throw new AppError('Role not found', 404)
    return role
  }

  async deleteRole(id: string) {
    const role = await Role.findByIdAndDelete(id).exec()
    if (!role) throw new AppError('Role not found', 404)
    return { message: 'Role deleted successfully' }
  }
}

const roleService = new RoleService()
export default roleService