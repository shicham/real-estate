import { Router } from 'express'
import { signupService, signinService } from '../services/authService'

const router = Router()

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })
    const user = await signupService(email, password)
    res.status(201).json(user)
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'signup failed' })
  }
})

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })
    const result = await signinService(email, password)
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'signin failed' })
  }
})

export default router
