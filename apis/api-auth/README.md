# 🔐 Real Estate Platform - Authentication API

A robust, production-ready authentication microservice built with Node.js, Express, and MongoDB.

## 🚀 Features

### 🔑 Authentication & Authorization
- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (user, agent, admin)
- **Password hashing** with bcrypt (configurable rounds)
- **Account lockout** after failed login attempts
- **Session management** with multiple device support

### 📧 Email Features
- **Email verification** for new accounts
- **Password reset** with secure tokens
- **Welcome emails** for verified users
- **HTML email templates** with responsive design

### 🛡️ Security Features
- **Rate limiting** for authentication endpoints
- **CORS protection** with configurable origins
- **Helmet.js** for security headers
- **Input validation** with express-validator
- **SQL injection protection** with Mongoose
- **XSS protection** built-in

### 📊 Monitoring & Logging
- **Winston logging** with file rotation
- **Health check endpoints**
- **Error handling** with detailed logging
- **Request logging** with Morgan

### 🐳 DevOps Ready
- **Docker support** with multi-stage builds
- **Docker Compose** for local development
- **Environment-based configuration**
- **Health checks** for container orchestration

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas (serveur distant configuré)
- Docker (optionnel, pour le déploiement)

### Local Development

```bash
# Clone the repositorys
git clone <repository-url>
cd apis/api-auth

# Install dependencies
npm install

# Configuration environment (déjà configuré avec MongoDB Atlas)
# Le fichier .env contient la configuration MongoDB Atlas
# Vérifiez les paramètres si nécessaire

# Start the development server
npm run dev

# Or start production server
npm start
```

### Docker Development

```bash
# Build the Docker image
npm run docker:build
# Ou manuellement: docker build -t realestate/api-auth .

# Run the authentication service (avec MongoDB Atlas)
npm run docker:run
# Ou manuellement: docker run -d --name api-auth -p 3001:3001 --env-file .env realestate/api-auth

# View logs
npm run docker:logs
# Ou manuellement: docker logs -f api-auth

# Stop service
npm run docker:stop
# Ou manuellement: docker stop api-auth && docker rm api-auth
```

### Production Deployment

```bash
# Build production image
docker build -t realestate/api-auth:latest .

# Run production container with external MongoDB
docker run -d \
  --name api-auth-prod \
  -p 3001:3001 \
  --env-file .env.production \
  --restart unless-stopped \
  realestate/api-auth:latest

# Or with custom environment variables
docker run -d \
  --name api-auth-prod \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://your-mongodb-host:27017/realestate_auth \
  -e JWT_ACCESS_SECRET=your-access-secret \
  -e JWT_REFRESH_SECRET=your-refresh-secret \
  --restart unless-stopped \
  realestate/api-auth:latest
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `3001` | No |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` | Yes |
| `JWT_ACCESS_SECRET` | JWT access token secret | - | Yes |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | - | Yes |
| `JWT_ACCESS_EXPIRES` | Access token expiration | `15m` | No |
| `JWT_REFRESH_EXPIRES` | Refresh token expiration | `7d` | No |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` | No |
| `SMTP_HOST` | Email SMTP host | - | For email features |
| `SMTP_PORT` | Email SMTP port | `587` | For email features |
| `SMTP_USER` | Email SMTP username | - | For email features |
| `SMTP_PASS` | Email SMTP password | - | For email features |

### JWT Configuration

```env
# Secrets déjà configurés (minimum 32 caractères)
JWT_ACCESS_SECRET=supersecure32characterslongaccesstokenkey2024!@#$
JWT_REFRESH_SECRET=supersecure32characterslongrefreshtoken2024!@#$

# Token expiration times
JWT_ACCESS_EXPIRES=15m    # Short-lived access tokens
JWT_REFRESH_EXPIRES=7d    # Longer-lived refresh tokens
```

### MongoDB Atlas Configuration

```env
# Configuration MongoDB Atlas (déjà configurée)
MONGODB_URI=mongodb+srv://admin:password@cluster0.ggulxu5.mongodb.net/realestate_auth?retryWrites=true&w=majority&appName=Cluster0
MONGODB_USERNAME=admin
MONGODB_PASSWORD=fRRx3Isw64xWJUPx
MONGODB_DATABASE=realestate_auth
```

### Email Configuration

```env
# Configuration email désactivée pour le développement
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=noreply@realestate.local

# Pour activer l'email en production, configurez ces paramètres:
# SMTP_HOST=smtp.gmail.com
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
```

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api/auth
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "rememberMe": false
}
```

#### Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer your-access-token
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "profile": {
    "phone": "+1234567890",
    "address": "123 Main St"
  }
}
```

#### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "NewPass123!"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Logout All Devices
```http
POST /api/auth/logout-all
Authorization: Bearer your-access-token
```

#### Verify Email
```http
GET /api/auth/verify-email/:token
```

### Response Format

#### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if any)
  ]
}
```

### Health Check
```http
GET /health

Response:
{
  "status": "OK",
  "service": "Authentication API",
  "version": "1.0.0",
  "timestamp": "2025-10-09T10:30:00.000Z",
  "environment": "development",
  "uptime": 3600
}
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
The test suite covers:
- User registration and validation
- Login and authentication
- JWT token management
- Password reset flow
- Profile management
- Error handling

## 🚀 Deployment

### Environment Setup

1. **Development**
   ```bash
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/realestate_auth_dev
   ```

2. **Staging**
   ```bash
   NODE_ENV=staging
   MONGODB_URI=mongodb://staging-db:27017/realestate_auth_staging
   ```

3. **Production**
   ```bash
   NODE_ENV=production
   MONGODB_URI=mongodb://prod-cluster:27017/realestate_auth_prod
   ```

### Docker Deployment

```bash
# Development with local MongoDB
docker build -t realestate/api-auth:dev .
docker run -d --name mongodb -p 27017:27017 mongo:6.0
docker run -d \
  --name api-auth-dev \
  -p 3001:3001 \
  --link mongodb:mongodb \
  -e MONGODB_URI=mongodb://mongodb:27017/realestate_auth_dev \
  realestate/api-auth:dev

# Production with external MongoDB
docker build -t realestate/api-auth:prod .
docker run -d \
  --name api-auth-prod \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://your-mongodb-cluster:27017/realestate_auth_prod \
  realestate/api-auth:prod
```

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-auth
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-auth
  template:
    metadata:
      labels:
        app: api-auth
    spec:
      containers:
      - name: api-auth
        image: realestate/api-auth:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: auth-secrets
              key: mongodb-uri
```

## 📈 Performance

### Optimization Features
- **Connection pooling** for MongoDB
- **Compression middleware** for responses
- **Rate limiting** to prevent abuse
- **Efficient password hashing** with configurable rounds
- **JWT token optimization** with minimal payload

### Monitoring
- **Winston logging** with structured logs
- **Health check endpoints** for load balancers
- **Error tracking** with stack traces
- **Performance metrics** via middleware

## 🔒 Security Best Practices

### Authentication Security
- **Strong password requirements** (configurable)
- **Account lockout** after failed attempts
- **JWT token rotation** with refresh tokens
- **Secure token storage** recommendations

### API Security
- **Rate limiting** on sensitive endpoints
- **CORS protection** with whitelist
- **Input validation** and sanitization
- **SQL injection prevention**
- **XSS protection** headers

### Infrastructure Security
- **Non-root Docker user**
- **Minimal Docker image** (Alpine Linux)
- **Security headers** with Helmet.js
- **Environment variable** for secrets

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```bash
# Check MongoDB status
mongod --version
sudo systemctl status mongod

# Check connection string
MONGODB_URI=mongodb://localhost:27017/realestate_auth
```

#### 2. Email Not Sending
```bash
# Check SMTP configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Use app password, not regular password
```

#### 3. JWT Token Issues
```bash
# Ensure secrets are properly set and match between services
JWT_ACCESS_SECRET=minimum-32-character-secret
JWT_REFRESH_SECRET=different-32-character-secret
```

#### 4. Rate Limiting Issues
```bash
# Adjust rate limits in production
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # Requests per window
```

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug
NODE_ENV=development

# View detailed logs
npm run docker:logs
# Ou: docker logs -f api-auth
```

## ✅ Statut Actuel du Projet

### 🎯 **Configuration Validée**
- ✅ **MongoDB Atlas** : Connecté et opérationnel
- ✅ **Variables d'environnement** : Configurées dans `.env`
- ✅ **JWT Secrets** : Sécurisés (32+ caractères)
- ✅ **Docker** : Image construite et testée
- ✅ **API** : Fonctionnelle et testée

### 🧪 **Tests Effectués**
- ✅ **Build Docker** : `realestate/api-auth:latest` (274MB)
- ✅ **Health Check** : `http://localhost:3001/health` ✅
- ✅ **Inscription utilisateur** : API `/api/auth/register` ✅
- ✅ **Génération JWT** : Access & Refresh tokens ✅
- ✅ **Base de données** : MongoDB Atlas connecté ✅

### 🚀 **Prêt pour**
- ✅ Développement local (`npm run dev`)
- ✅ Déploiement Docker (`npm run docker:build && npm run docker:run`)
- ✅ Tests d'intégration
- ✅ Mise en production

### 📊 **Métriques**
- **Taille image Docker** : 274MB
- **Temps de build** : ~18 secondes
- **Ports exposés** : 3001
- **Health checks** : Activés

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

### Code Style
- Use ESLint configuration
- Follow Prettier formatting
- Write meaningful commit messages
- Add JSDoc comments for functions

### Testing Guidelines
- Write unit tests for new features
- Maintain test coverage above 80%
- Test error conditions
- Use descriptive test names

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section

---

**Real Estate Platform** - Authentication Microservice v1.0.0

---

## 🎯 Quick Start

```bash
# 1. Installation
npm install

# 2. Développement local
npm run dev

# 3. Test Docker
npm run docker:build
npm run docker:run

# 4. Vérification
curl http://localhost:3001/health
```

## 📈 Statut : OPÉRATIONNEL ✅
- **MongoDB Atlas** : Connecté
- **Docker** : Testé et validé  
- **API** : Fonctionnelle
- **Sécurité** : JWT configuré


# Supprimer l'ancienne image
docker rmi realestate/api-auth:latest

# Reconstruire
docker build -t realestate/api-auth:latest .

# Voir les images Docker
docker images | grep realestate

# Voir l'historique d'une image
docker history realestate/api-auth:latest

# Nettoyer les images inutilisées
docker image prune -f

# Nettoyer tout (attention!)
docker system prune -a