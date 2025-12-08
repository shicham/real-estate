import { Router } from 'express'
import { signupService, signinService } from '../services/authService'
import { signupSchema, signinSchema, formatZodErrors } from '../lib/validation'

const router = Router()

router.post('/signup', async (req, res) => {
  try {
    const parsed = signupSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ errors: formatZodErrors(parsed.error) })
    }

    const { email, password } = parsed.data
    const user = await signupService(email, password)
    res.status(201).json(user)
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'signup failed' })
  }
})

router.post('/signin', async (req, res) => {
  try {
    const parsed = signinSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ errors: formatZodErrors(parsed.error) })
    }

    const { email, password } = parsed.data
    const result = await signinService(email, password)
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'signin failed' })
  }
})

export default router
