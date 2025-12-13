import { Router, Request, Response, NextFunction } from 'express'
import profileService from '../services/profileService.js'
import { createProfileSchema, updateProfileSchema } from '../lib/validation.js'

export class ProfileController {
  public router = Router()

  constructor() {
    this.router.get('/', this.getAllProfiles.bind(this))
    this.router.get('/:id', this.getProfileById.bind(this))
    this.router.get('/code/:code', this.getProfileByCode.bind(this))
    this.router.post('/', this.createProfile.bind(this))
    this.router.put('/:id', this.updateProfile.bind(this))
    this.router.delete('/:id', this.deleteProfile.bind(this))
  }

  async getAllProfiles(req: Request, res: Response, next: NextFunction) {
    try {
      const profiles = await profileService.getAllProfiles()
      res.json(profiles)
    } catch (err: any) {
      next(err)
    }
  }

  async getProfileById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const profile = await profileService.getProfileById(id)
      res.json(profile)
    } catch (err: any) {
      next(err)
    }
  }

  async getProfileByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params
      const profile = await profileService.getProfileByCode(code)
      res.json(profile)
    } catch (err: any) {
      next(err)
    }
  }

  async createProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createProfileSchema.safeParse(req.body)
      if (!parsed.success) return res.status(400).json({ errors: parsed.error.errors })

      const profile = await profileService.createProfile(parsed.data)
      res.status(201).json(profile)
    } catch (err: any) {
      next(err)
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const parsed = updateProfileSchema.safeParse(req.body)
      if (!parsed.success) return res.status(400).json({ errors: parsed.error.errors })

      const profile = await profileService.updateProfile(id, parsed.data)
      res.json(profile)
    } catch (err: any) {
      next(err)
    }
  }

  async deleteProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const result = await profileService.deleteProfile(id)
      res.json(result)
    } catch (err: any) {
      next(err)
    }
  }
}

const controller = new ProfileController()
export default controller.router