
import express from 'express'
import dotenv from 'dotenv'
import { connectMongo } from './lib/mongo'
import { connectRedis } from './lib/redis'
import authRouter from './controllers/authController'
import errorHandler from './middleware/errorHandler'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import logger from './lib/logger'

dotenv.config()

const app = express()

// Common middlewares
app.use(helmet())
app.use(cors())
app.use(morgan(process.env.LOG_FORMAT || 'combined'))
app.use(compression())
app.use(express.json())

app.get('/', (_req, res) => res.send('api-auth service'))

app.use('/auth', authRouter)

app.get('/health', (_req, res) => {
	res.json({ status: 'ok' })
})

async function start() {
	const PORT = process.env.PORT || 3001
	const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/real_estate_auth'
	const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`

	try {
		await connectMongo(mongoUri)
		connectRedis(redisUrl)
		app.listen(PORT, () => logger.info(`api-auth running on ${PORT}`))
	} catch (err) {
		logger.error('Failed to start services: %o', err)
		process.exit(1)
	}
}

start()

// register error handler (should be after routes)
app.use(errorHandler)
