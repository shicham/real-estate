import { Router, Request, Response, NextFunction } from 'express'
import roleService from '../services/roleService.js'
import { createRoleSchema, updateRoleSchema } from '../lib/validation.js'

export class RoleController {
  public router = Router()

  constructor() {
    this.router.get('/', this.getAllRoles.bind(this))
    this.router.get('/:id', this.getRoleById.bind(this))
    this.router.get('/code/:code', this.getRoleByCode.bind(this))
    this.router.post('/', this.createRole.bind(this))
    this.router.put('/:id', this.updateRole.bind(this))
    this.router.delete('/:id', this.deleteRole.bind(this))
  }

  async getAllRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await roleService.getAllRoles()
      res.json(roles)
    } catch (err: any) {
      next(err)
    }
  }

  async getRoleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const role = await roleService.getRoleById(id)
      res.json(role)
    } catch (err: any) {
      next(err)
    }
  }

  async getRoleByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params
      const role = await roleService.getRoleByCode(code)
      res.json(role)
    } catch (err: any) {
      next(err)
    }
  }

  async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createRoleSchema.safeParse(req.body)
      if (!parsed.success) return res.status(400).json({ errors: parsed.error.errors })

      const role = await roleService.createRole(parsed.data)
      res.status(201).json(role)
    } catch (err: any) {
      next(err)
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const parsed = updateRoleSchema.safeParse(req.body)
      if (!parsed.success) return res.status(400).json({ errors: parsed.error.errors })

      const role = await roleService.updateRole(id, parsed.data)
      res.json(role)
    } catch (err: any) {
      next(err)
    }
  }

  async deleteRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const result = await roleService.deleteRole(id)
      res.json(result)
    } catch (err: any) {
      next(err)
    }
  }
}

const controller = new RoleController()
export default controller.router