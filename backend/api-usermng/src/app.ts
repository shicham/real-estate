import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import { connectMongo } from './lib/db.js'
import errorHandler from './middleware/errorHandler.js'
import { authenticateToken, requireAdmin } from './middleware/auth.js'

// Import controllers
import userController from './controllers/userController.js'
import roleController from './controllers/roleController.js'
import profileController from './controllers/profileController.js'
import groupController from './controllers/groupController.js'

const app = express()

// Connect to MongoDB
connectMongo(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-usermng')

// Middleware
app.use(helmet())
app.use(compression())
app.use(cors())
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/', (_req, res) => res.send('api-usermng service'))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-usermng', timestamp: new Date().toISOString() })
})

// API Routes (all protected with authentication)
app.use('/api/users', authenticateToken, userController)
app.use('/api/roles', authenticateToken, requireAdmin, roleController)
app.use('/api/profiles', authenticateToken, requireAdmin, profileController)
app.use('/api/groups', authenticateToken, groupController)

// Error handling middleware (must be last)
app.use(errorHandler)

export default app