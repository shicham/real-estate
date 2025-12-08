import express from 'express'
import dotenv from 'dotenv'
import { connectMongo, connectRedis } from './lib/db'
import authRouter from './controllers/authController'

dotenv.config()

const app = express()
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
		app.listen(PORT, () => console.log(`api-auth running on ${PORT}`))
	} catch (err) {
		console.error('Failed to start services', err)
		process.exit(1)
	}
}

start()
