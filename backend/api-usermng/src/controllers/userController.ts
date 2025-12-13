import { Router, Request, Response, NextFunction } from 'express'
import userService from '../services/userService.js'
import { createUserSchema, updateUserSchema, addUserToGroupsSchema, removeUserFromGroupsSchema, addRolesToUserSchema, removeRolesFromUserSchema } from '../lib/validation.js'

export class UserController {
  public router = Router()

  constructor() {
    this.router.get('/', this.getAllUsers.bind(this))
    this.router.get('/:id', this.getUserById.bind(this))
    this.router.post('/', this.createUser.bind(this))
    this.router.put('/:id', this.updateUser.bind(this))
    this.router.delete('/:id', this.deleteUser.bind(this))
    this.router.post('/:id/groups', this.addUserToGroups.bind(this))
    this.router.delete('/:id/groups', this.removeUserFromGroups.bind(this))
    this.router.post('/:id/roles', this.addRolesToUser.bind(this))
    this.router.delete('/:id/roles', this.removeRolesFromUser.bind(this))
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers()
      res.json(users)
    } catch (err: any) {
      next(err)
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const user = await userService.getUserById(id)
      res.json(user)
    } catch (err: any) {
      next(err)
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createUserSchema.safeParse(req.body)
      if (!parsed.success) return res.status(400).json({ errors: parsed.error.errors })

      const user = await userService.createUser(parsed.data)
      res.status(201).json(user)
    } catch (err: any) {
      next(err)
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const parsed = updateUserSchema.safeParse(req.body)
      if (!parsed.success) return res.status(400).json({ errors: parsed.error.errors })

      const user = await userService.updateUser(id, parsed.data)
      res.json(user)
    } catch (err: any) {
      next(err)
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const result = await userService.deleteUser(id)
      res.json(result)
    } catch (err: any) {
      next(err)
    }
  }

  async addUserToGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const parsed = addUserToGroupsSchema.safeParse(req.body)
      if (!parsed.success) return res.status(400).json({ errors: parsed.error.errors })

      const user = await userService.addUserToGroups(id, parsed.data.groupCodes)
      res.json(user)
    } catch (err: any) {
      next(err)
    }
  }

  async removeUserFromGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const parsed = removeUserFromGroupsSchema.safeParse(req.body)
      if (!parsed.success) return res.status(400).json({ errors: parsed.error.errors })

      const user = await userService.removeUserFromGroups(id, parsed.data.groupCodes)
      res.json(user)
    } catch (err: any) {
      next(err)
    }
  }

  async addRolesToUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const parsed = addRolesToUserSchema.safeParse(req.body)
      if (!parsed.success) return res.status(400).json({ errors: parsed.error.errors })

      const user = await userService.addRolesToUser(id, parsed.data.roleCodes)
      res.json(user)
    } catch (err: any) {
      next(err)
    }
  }

  async removeRolesFromUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const parsed = removeRolesFromUserSchema.safeParse(req.body)
      if (!parsed.success) return res.status(400).json({ errors: parsed.error.errors })

      const user = await userService.removeRolesFromUser(id, parsed.data.roleCodes)
      res.json(user)
    } catch (err: any) {
      next(err)
    }
  }
}

const controller = new UserController()
export default controller.router