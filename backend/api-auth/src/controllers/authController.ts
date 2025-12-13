import { Router, Request, Response, NextFunction } from 'express'
import authService from '../services/authService.js'
import { signupSchema, signinSchema, changePasswordSchema, formatZodErrors } from '../lib/validation.js'

export class AuthController {
  public router = Router()

  constructor() {
    this.router.post('/signup', this.signup.bind(this))
    this.router.post('/signin', this.signin.bind(this))
    this.router.post('/refresh', this.refresh.bind(this))
    this.router.post('/logout', this.logout.bind(this))
    this.router.post('/change-password', this.changePassword.bind(this))
    this.router.get('/verify-email', this.verifyEmail.bind(this))
  }

  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = signupSchema.safeParse(req.body)
      if (!parsed.success) return res.status(400).json({ errors: formatZodErrors(parsed.error) })

      const { email, password, preferredLanguage, firstName, lastName, sex, roles, profiles } = parsed.data
      const user = await authService.signup(email, password, preferredLanguage, firstName, lastName, sex, roles, profiles)
      res.status(201).json(user)
    } catch (err: any) {
      next(err)
    }
  }

  async signin(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = signinSchema.safeParse(req.body)
      if (!parsed.success) return res.status(400).json({ errors: formatZodErrors(parsed.error) })

      const { email, password } = parsed.data
      // determine client IP (support X-Forwarded-For)
      const xf = req.headers['x-forwarded-for']
      const ip = typeof xf === 'string' && xf.length ? xf.split(',')[0].trim() : req.ip
      const result = await authService.signin(email, password, ip as string)
      res.json(result)
    } catch (err: any) {
      next(err)
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body
      if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' })
      const newTokens = await authService.refresh(refreshToken)
      res.json(newTokens)
    } catch (err: any) {
      next(err)
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body
      if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' })
      await authService.logout(refreshToken)
      res.status(204).send()
    } catch (err: any) {
      next(err)
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = changePasswordSchema.safeParse(req.body)
      if (!parsed.success) return res.status(400).json({ errors: formatZodErrors(parsed.error) })

      const { userId, currentPassword, newPassword } = req.body
      if (!userId) return res.status(400).json({ error: 'userId required' })

      const result = await authService.changePassword(userId, currentPassword, newPassword)
      res.json(result)
    } catch (err: any) {
      next(err)
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const token = (req.query.token as string) || req.body?.token
      if (!token) return res.status(400).json({ error: 'token required' })
      const result = await authService.verifyEmail(token)
      res.json(result)
    } catch (err: any) {
      next(err)
    }
  }
}

const controller = new AuthController()
export default controller.router
