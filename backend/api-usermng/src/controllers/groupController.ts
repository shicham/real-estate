import { Router, Request, Response, NextFunction } from 'express'
import groupService from '../services/groupService.js'
import { createGroupSchema, updateGroupSchema, addUsersToGroupSchema, removeUsersFromGroupSchema } from '../lib/validation.js'

export class GroupController {
  public router = Router()

  constructor() {
    this.router.get('/', this.getAllGroups.bind(this))
    this.router.get('/:id', this.getGroupById.bind(this))
    this.router.get('/code/:code', this.getGroupByCode.bind(this))
    this.router.post('/', this.createGroup.bind(this))
    this.router.put('/:id', this.updateGroup.bind(this))
    this.router.delete('/:id', this.deleteGroup.bind(this))
    this.router.post('/:id/users', this.addUsersToGroup.bind(this))
    this.router.delete('/:id/users', this.removeUsersFromGroup.bind(this))
  }

  async getAllGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const groups = await groupService.getAllGroups()
      res.json(groups)
    } catch (err: any) {
      next(err)
    }
  }

  async getGroupById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const group = await groupService.getGroupById(id)
      res.json(group)
    } catch (err: any) {
      next(err)
    }
  }

  async getGroupByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params
      const group = await groupService.getGroupByCode(code)
      res.json(group)
    } catch (err: any) {
      next(err)
    }
  }

  async createGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createGroupSchema.safeParse(req.body)
      if (!parsed.success) return res.status(400).json({ errors: parsed.error.errors })

      const group = await groupService.createGroup(parsed.data)
      res.status(201).json(group)
    } catch (err: any) {
      next(err)
    }
  }

  async updateGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const parsed = updateGroupSchema.safeParse(req.body)
      if (!parsed.success) return res.status(400).json({ errors: parsed.error.errors })

      const group = await groupService.updateGroup(id, parsed.data)
      res.json(group)
    } catch (err: any) {
      next(err)
    }
  }

  async deleteGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const result = await groupService.deleteGroup(id)
      res.json(result)
    } catch (err: any) {
      next(err)
    }
  }

  async addUsersToGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const parsed = addUsersToGroupSchema.safeParse(req.body)
      if (!parsed.success) return res.status(400).json({ errors: parsed.error.errors })

      const group = await groupService.addUsersToGroup(id, parsed.data.userIds)
      res.json(group)
    } catch (err: any) {
      next(err)
    }
  }

  async removeUsersFromGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const parsed = removeUsersFromGroupSchema.safeParse(req.body)
      if (!parsed.success) return res.status(400).json({ errors: parsed.error.errors })

      const group = await groupService.removeUsersFromGroup(id, parsed.data.userIds)
      res.json(group)
    } catch (err: any) {
      next(err)
    }
  }
}

const controller = new GroupController()
export default controller.router