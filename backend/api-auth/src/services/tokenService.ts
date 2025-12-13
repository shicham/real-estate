import jwt, { type SignOptions, type JwtPayload } from 'jsonwebtoken'
import AppError from '../lib/AppError.js'
import { connectRedis, getRedis } from '../lib/redis.js'
import logger from '../lib/logger.js'

class TokenService {
    readonly accessSecret: string
    readonly refreshSecret: string
    readonly accessExpires: string
    readonly refreshExpires: string
    readonly attemptLimit: number
    readonly attemptWindow: number

    constructor() {
        this.accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'change-this-secret'
        this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret'
        this.accessExpires = process.env.JWT_ACCESS_EXPIRES || '15m'
        this.refreshExpires = process.env.JWT_REFRESH_EXPIRES || '7d'
        this.attemptLimit = Number(process.env.LOGIN_ATTEMPT_LIMIT || 5)
        this.attemptWindow = Number(process.env.LOGIN_ATTEMPT_WINDOW || 15 * 60)
    }

    // email verification secret and expiry
    readonly emailSecret = process.env.JWT_EMAIL_SECRET || 'change-this-email-secret'
    readonly emailExpires = process.env.JWT_EMAIL_EXPIRES || '1d'

    private parseExpiryToSeconds(value: string): number {
        if (!value) return 0
        const m = value.match(/^(\d+)([smhd])$/)
        if (!m) {
            const n = Number(value)
            return Number.isFinite(n) ? n : 0
        }
        const num = Number(m[1])
        const unit = m[2]
        switch (unit) {
            case 's':
                return num
            case 'm':
                return num * 60
            case 'h':
                return num * 60 * 60
            case 'd':
                return num * 60 * 60 * 24
            default:
                return num
        }
    }

    // Accept string|number|undefined and cast to jwt.SignOptions to satisfy TypeScript
    private createJwtold(payload: object, secret: jwt.Secret, expiresIn: string | number | undefined) {
        const opts = { expiresIn } as unknown as jwt.SignOptions
        const token = jwt.sign(payload as jwt.JwtPayload | string, secret, opts)
        return token
    }
    private createJwt(payload: object, secret: jwt.Secret, expiresIn?: string | number) {
        try {
            if (!secret || (typeof secret === 'string' && secret.trim() === '')) {
                const msg = 'JWT secret is empty or undefined'
                logger.error(msg, { payload, expiresIn })
                throw new Error(msg)
            }

             const opts = { expiresIn } as unknown as jwt.SignOptions

            // Si le secret est une string, on force l'algorithme HMAC par défaut (HS256) pour éviter ambiguïtés
            if (typeof secret === 'string') {
                opts.algorithm = opts.algorithm || 'HS256'
            }

            const token = jwt.sign(payload as jwt.JwtPayload | string, secret as jwt.Secret, opts)

            if (!token || typeof token !== 'string') {
                const msg = 'jwt.sign did not return a token'
                logger.error(msg, { payload, expiresIn })
                throw new Error(msg)
            }

            return token
        } catch (err) {
            logger.error('Failed to sign JWT', err)
            throw err
        }
    }
    private async ensureRedis() {
        try {
            const redis = getRedis()
            return redis
        } catch (err) {
            await connectRedis(process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`)
            return getRedis()
        }
    }

    async generateTokens(userId: string, email?: string, preferredLanguage?: string) {
        const access = this.createJwt({ sub: userId, email, preferredLanguage }, this.accessSecret, this.accessExpires)
        const refresh = this.createJwt({ sub: userId, email, preferredLanguage }, this.refreshSecret, this.refreshExpires)

        const redis = await this.ensureRedis()
        const secs = this.parseExpiryToSeconds(this.refreshExpires)
        const key = `refresh:${refresh}`
        await redis.set(key, userId, 'EX', secs)

        return { token: access, refreshToken: refresh }
    }

    async rotateRefreshToken(oldRefresh: string) {
        const redis = await this.ensureRedis()
        const keyOld = `refresh:${oldRefresh}`
        const userId = await redis.get(keyOld)
        if (!userId) throw new AppError('Invalid refresh token', 401)

        try {
            jwt.verify(oldRefresh, this.refreshSecret)
        } catch (err) {
            await redis.del(keyOld)
            throw new AppError('Invalid refresh token', 401)
        }

        const payload = jwt.decode(oldRefresh) as any
        const email = payload?.email
        const preferredLanguage = payload?.preferredLanguage
        const tokens = await this.generateTokens(userId, email, preferredLanguage)

        await redis.del(keyOld)
        return tokens
    }

    async revokeRefreshToken(refresh: string) {
        const redis = await this.ensureRedis()
        const key = `refresh:${refresh}`
        await redis.del(key)
    }

    async validateRefreshToken(refresh: string) {
        const redis = await this.ensureRedis()
        const key = `refresh:${refresh}`
        const userId = await redis.get(key)
        if (!userId) throw new AppError('Invalid refresh token', 401)
        try {
            const payload = jwt.verify(refresh, this.refreshSecret) as any
            return { userId, payload }
        } catch (err) {
            await redis.del(key)
            throw new AppError('Invalid refresh token', 401)
        }
    }

    async incrementLoginAttempts(email: string) {
        const redis = await this.ensureRedis()
        const key = `loginAttempts:${email}`
        const attempts = await redis.incr(key)
        if (attempts === 1) {
            await redis.expire(key, this.attemptWindow)
        }
        return attempts
    }

    async resetLoginAttempts(email: string) {
        const redis = await this.ensureRedis()
        const key = `loginAttempts:${email}`
        await redis.del(key)
    }

    async getLoginAttempts(email: string) {
        const redis = await this.ensureRedis()
        const key = `loginAttempts:${email}`
        const val = await redis.get(key)
        return val ? Number(val) : 0
    }

    getAttemptLimit() {
        return this.attemptLimit
    }

    generateEmailToken(userId: string, email?: string) {
        return this.createJwt({ sub: userId, email }, this.emailSecret, this.emailExpires)
    }

    validateEmailToken(token: string) {
        try {
            const payload = jwt.verify(token, this.emailSecret) as any
            return payload
        } catch (err) {
            throw new AppError('Invalid or expired email verification token', 401)
        }
    }
}

const tokenService = new TokenService()
export default tokenService