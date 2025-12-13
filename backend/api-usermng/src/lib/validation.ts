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

export const requestPasswordResetSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' })
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: 'Token is required' }),
  newPassword: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Za-z]/, { message: 'Password must contain letters' })
    .regex(/\d/, { message: 'Password must contain numbers' })
})

export const createUserSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  sex: z.enum(['male', 'female', 'other']).optional(),
  preferredLanguage: z.string().min(2).max(10).optional(),
  roleCodes: z.array(z.string()).optional(),
  profileCodes: z.array(z.string()).optional(),
  groupCodes: z.array(z.string()).optional(),
  sendPasswordReset: z.boolean().optional().default(true)
})

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  sex: z.enum(['male', 'female', 'other']).optional(),
  preferredLanguage: z.string().min(2).max(10).optional(),
  roleCodes: z.array(z.string()).optional(),
  profileCodes: z.array(z.string()).optional(),
  groupCodes: z.array(z.string()).optional()
})

export const addUserToGroupsSchema = z.object({
  groupCodes: z.array(z.string()).min(1, { message: 'At least one group code is required' })
})

export const removeUserFromGroupsSchema = z.object({
  groupCodes: z.array(z.string()).min(1, { message: 'At least one group code is required' })
})

export const addRolesToUserSchema = z.object({
  roleCodes: z.array(z.string()).min(1, { message: 'At least one role code is required' })
})

export const removeRolesFromUserSchema = z.object({
  roleCodes: z.array(z.string()).min(1, { message: 'At least one role code is required' })
})

export const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(50),
  description: z.string().optional(),
  userIds: z.array(z.string()).optional()
})

export const updateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z.string().min(1).max(50).optional(),
  description: z.string().optional()
})

export const addUsersToGroupSchema = z.object({
  userIds: z.array(z.string()).min(1, { message: 'At least one user ID is required' })
})

export const removeUsersFromGroupSchema = z.object({
  userIds: z.array(z.string()).min(1, { message: 'At least one user ID is required' })
})

export const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(50),
  description: z.string().optional()
})

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z.string().min(1).max(50).optional(),
  description: z.string().optional()
})

export const createProfileSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(50),
  description: z.string().optional()
})

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z.string().min(1).max(50).optional(),
  description: z.string().optional()
})

export function formatZodErrors(err: z.ZodError) {
  return err.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
}
