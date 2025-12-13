import { z } from 'zod'

export const signupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Za-z]/, { message: 'Password must contain letters' })
    .regex(/\d/, { message: 'Password must contain numbers' })
  , preferredLanguage: z.string().min(2).max(10).optional()
  , firstName: z.string().min(1).max(100).optional()
  , lastName: z.string().min(1).max(100).optional()
  , sex: z.enum(['male','female','other']).optional()
  , roles: z.array(z.string()).optional()
  , profiles: z.array(z.string()).optional()
})

export const signinSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' })
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Za-z]/, { message: 'Password must contain letters' })
    .regex(/\d/, { message: 'Password must contain numbers' })
})

export function formatZodErrors(err: z.ZodError) {
  return err.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
}
