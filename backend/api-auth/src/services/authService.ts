import bcrypt from 'bcryptjs'
import logger from '../lib/logger.js'
import { User } from '../models/User.js'
import { Role } from '../models/Role.js'
import { Profile } from '../models/Profile.js'
import AppError from '../lib/AppError.js'
import tokenService from './tokenService.js'
import geoService from './geoService.js'
import emailService from './emailService.js'

export class AuthService {
    async signup(
        email: string,
        password: string,
        preferredLanguage?: string,
        firstName?: string,
        lastName?: string,
        sex?: 'male' | 'female' | 'other',
        roleCodes?: string[],
        profileCodes?: string[]
    ) {
        logger.info('Signup attempt for email:', email)
        const existing = await User.findOne({ email }).exec()
        if (existing) throw new AppError('User already exists', 400)

        const passwordHash = await bcrypt.hash(password, 10)
        // resolve roles by code to ObjectIds
        let roleIds: any[] = []
        if (roleCodes && roleCodes.length) {
            const found = await Role.find({ code: { $in: roleCodes } }).select('_id code').exec()
            const foundCodes = found.map(f => (f as any).code)
            const missing = roleCodes.filter(c => !foundCodes.includes(c))
            if (missing.length) throw new AppError(`Roles not found: ${missing.join(', ')}`, 400)
            roleIds = found.map(f => f._id)
        }

        // resolve profiles by code to ObjectIds
        let profileIds: any[] = []
        if (profileCodes && profileCodes.length) {
            const foundP = await Profile.find({ code: { $in: profileCodes } }).select('_id code').exec()
            const foundPCodes = foundP.map(f => (f as any).code)
            const missingP = profileCodes.filter(c => !foundPCodes.includes(c))
            if (missingP.length) throw new AppError(`Profiles not found: ${missingP.join(', ')}`, 400)
            profileIds = foundP.map(f => f._id)
        }

        const user = new User({
            email,
            passwordHash,
            preferredLanguage,
            firstName,
            lastName,
            sex,
            roles: roleIds,
            profiles: profileIds
        })
        await user.save()
        // send verification email (best effort)
        try {
            const vtoken = tokenService.generateEmailToken(user._id.toString(), user.email)
            await emailService.sendVerificationEmail(user.email, vtoken, `${user.firstName || ''} ${user.lastName || ''}`.trim())
        } catch (err) {
            // don't block signup if email sending fails
        }
        // return created user with codes for convenience
        const returnRoles = roleCodes || []
        const returnProfiles = profileCodes || []
        return {
            id: user._id.toString(),
            email: user.email,
            preferredLanguage: user.preferredLanguage,
            firstName: user.firstName,
            lastName: user.lastName,
            sex: user.sex,
            roles: returnRoles,
            profiles: returnProfiles
        }
    }

    async signin(email: string, password: string, ip?: string) {
        // Check DB lock first
        const user = await User.findOne({ email }).exec()
        const attemptLimit = tokenService.getAttemptLimit()

        if (user && user.lockUntil && user.lockUntil > new Date()) {
            throw new AppError('Account temporarily locked due to repeated failed login attempts', 429)
        }

        // Try Redis attempts counter first (fast), fallback to DB if unavailable
        try {
            const attempts = await tokenService.getLoginAttempts(email)
            if (attempts >= attemptLimit) {
                // mark DB lock as well for consistency
                if (user) {
                    const attemptWindow = Number(process.env.LOGIN_ATTEMPT_WINDOW || 15 * 60) * 1000
                    await User.findByIdAndUpdate(user._id, { lockUntil: new Date(Date.now() + attemptWindow) }).exec()
                }
                throw new AppError('Too many login attempts. Try again later.', 429)
            }
        } catch (err) {
            // If Redis is not available, continue — DB lock will be checked above and DB counters used below
        }

        if (!user) {
            // increment Redis attempts if possible, otherwise nothing to do in DB
            try { await tokenService.incrementLoginAttempts(email) } catch (_) { }
            throw new AppError('Invalid credentials', 401)
        }

        const match = await bcrypt.compare(password, user.passwordHash)
        if (!match) {
            // increment both Redis and DB counters
            try { await tokenService.incrementLoginAttempts(email) } catch (_) { }

            const updated = await User.findByIdAndUpdate(user._id, { $inc: { loginAttempts: 1 } }, { new: true }).exec()
            const currentAttempts = updated?.loginAttempts ?? 0
            if (currentAttempts >= attemptLimit) {
                const attemptWindow = Number(process.env.LOGIN_ATTEMPT_WINDOW || 15 * 60) * 1000
                await User.findByIdAndUpdate(user._id, { lockUntil: new Date(Date.now() + attemptWindow) }).exec()
            }

            throw new AppError('Invalid credentials', 401)
        }

        // enforce email verification before issuing tokens unless overridden by env
        const allowUnverified = (process.env.ALLOW_UNVERIFIED_LOGIN === 'true')
        if (!allowUnverified && user.isEmailVerified === false) {
            throw new AppError('Email address not verified. Please verify your email before signing in.', 403)
        }

        // success: reset attempts in both stores
        try { await tokenService.resetLoginAttempts(email) } catch (_) { }

        // lookup geo information for IP if provided
        let geo = null
        try {
            geo = geoService.lookup(ip)
        } catch (_) { geo = null }

        // set lastLogin, lastLoginIP and lastLoginGeo and clear lock counters in DB
        const updatePayload: any = { loginAttempts: 0, lockUntil: null, lastLogin: new Date() }
        if (ip) updatePayload.lastLoginIP = ip
        if (geo) updatePayload.lastLoginGeo = geo

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            updatePayload,
            { new: true }
        ).exec()

        // populate roles and profiles to return codes/names
        const populatedUser = await User.findById(updatedUser?._id ?? user._id)
            .populate({ path: 'roles', select: 'code name' })
            .populate({ path: 'profiles', select: 'code name' })
            .exec()

        const tokens = await tokenService.generateTokens(
            user._id.toString(),
            user.email,
            populatedUser?.preferredLanguage
        )

        const rolesOut = (populatedUser?.roles || []).map((r: any) => ({ id: r._id?.toString?.() ?? r.toString(), code: r.code, name: r.name }))
        const profilesOut = (populatedUser?.profiles || []).map((p: any) => ({ id: p._id?.toString?.() ?? p.toString(), code: p.code, name: p.name }))

        return {
            ...tokens,
            // convenience top-level fields for clients
            lastLogin: populatedUser?.lastLogin,
            lastLoginIP: populatedUser?.lastLoginIP,
            firstName: populatedUser?.firstName,
            lastName: populatedUser?.lastName,
            sex: populatedUser?.sex,
            roles: rolesOut,
            profiles: profilesOut,
            user: {
                id: populatedUser?._id.toString() ?? user._id.toString(),
                email: populatedUser?.email ?? user.email,
                preferredLanguage: populatedUser?.preferredLanguage,
                firstName: populatedUser?.firstName,
                lastName: populatedUser?.lastName,
                sex: populatedUser?.sex,
                lastLogin: populatedUser?.lastLogin,
                lastLoginIP: populatedUser?.lastLoginIP,
                lastLoginGeo: populatedUser?.lastLoginGeo,
                roles: rolesOut,
                profiles: profilesOut
            }
        }
    }

    async refresh(oldRefresh: string) {
        return tokenService.rotateRefreshToken(oldRefresh)
    }

    async logout(refresh: string) {
        return tokenService.revokeRefreshToken(refresh)
    }

    async verifyEmail(token: string) {
        const payload = tokenService.validateEmailToken(token) as any
        const userId = payload?.sub
        if (!userId) throw new AppError('Invalid token payload', 400)
        const user = await User.findByIdAndUpdate(userId, { isEmailVerified: true }, { new: true }).exec()
        if (!user) throw new AppError('User not found', 404)
        return { ok: true, id: user._id.toString(), email: user.email, isEmailVerified: user.isEmailVerified }
    }
}

const authService = new AuthService()
export default authService
