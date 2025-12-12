// contents of file
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import authRouter from './controllers/authController.js'
import errorHandler from './middleware/errorHandler.js'

const app = express()

// Common middlewares
app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3010',
    'http://localhost:3020',
    'https://localhost:3000',
    'https://localhost:3010',
    'https://localhost:3020'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}))
app.use(morgan(process.env.LOG_FORMAT || 'combined'))
app.use(compression())
app.use(express.json())

app.get('/', (_req, res) => res.send('api-auth service'))

app.use('/auth', authRouter)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// register error handler (should be after routes)
app.use(errorHandler)

export default app