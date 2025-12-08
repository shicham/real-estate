import { Router, Request, Response, NextFunction } from 'express'
import authService from '../services/authService'
import { signupSchema, signinSchema, formatZodErrors } from '../lib/validation'

export class AuthController {
  public router = Router()

  constructor() {
    this.router.post('/signup', this.signup.bind(this))
    this.router.post('/signin', this.signin.bind(this))
    this.router.post('/refresh', this.refresh.bind(this))
    this.router.post('/logout', this.logout.bind(this))
  }

  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = signupSchema.safeParse(req.body)
      if (!parsed.success) return res.status(400).json({ errors: formatZodErrors(parsed.error) })

      const { email, password } = parsed.data
      const user = await authService.signup(email, password)
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
      const result = await authService.signin(email, password)
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
}

const controller = new AuthController()
export default controller.router
