# 🏗️ Real Estate Platform - System Architecture

**Version:** 1.0.0  
**Last Updated:** November 22, 2025

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [API Architecture](#api-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Database Schema](#database-schema)
8. [Security Architecture](#security-architecture)
9. [Deployment Architecture](#deployment-architecture)
10. [Technology Stack](#technology-stack)

---

## 🎯 Overview

The Real Estate Platform is a modern, microservices-based web application designed for scalability, security, and maintainability. It follows a three-tier architecture pattern with clear separation between presentation, business logic, and data layers.

### Key Characteristics

- **Architecture Style:** Microservices
- **Pattern:** Three-tier (Presentation, Business Logic, Data)
- **Communication:** REST API (JSON)
- **State Management:** Stateless backend, stateful frontend
- **Deployment:** Containerized (Docker)

---

## 🏛️ High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    Real Estate Platform                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Presentation Layer (Frontend)               │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │    Nuxt 3 Admin Dashboard (Vue.js 3)             │   │  │
│  │  │    - Server-Side Rendering (SSR)                 │   │  │
│  │  │    - Static Site Generation (SSG)                │   │  │
│  │  │    - Client-Side Rendering (CSR)                 │   │  │
│  │  │    Port: 3000 (HTTPS)                            │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  └────────────────────┬────────────────────────────────────┘  │
│                       │ HTTPS/REST API                         │
│                       │ (JSON)                                 │
│  ┌────────────────────▼────────────────────────────────────┐  │
│  │           Business Logic Layer (Backend)                │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │  Authentication API (Node.js/Express)            │   │  │
│  │  │  - JWT Token Management                          │   │  │
│  │  │  - User Management                               │   │  │
│  │  │  - Email Services                                │   │  │
│  │  │  - Analytics & Logging                           │   │  │
│  │  │  Port: 3001                                      │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  │                                                          │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │  Future Microservices:                           │   │  │
│  │  │  - Property Management API                       │   │  │
│  │  │  - User Management API                           │   │  │
│  │  │  - Payment Processing API                        │   │  │
│  │  │  - Notification Service                          │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  └────────────────────┬────────────────────────────────────┘  │
│                       │ MongoDB Wire Protocol                  │
│                       │ Redis Protocol                         │
│  ┌────────────────────▼────────────────────────────────────┐  │
│  │              Data Layer (Persistence)                   │  │
│  │  ┌─────────────────────────┐  ┌──────────────────────┐ │  │
│  │  │  MongoDB Atlas          │  │  Redis Cache         │ │  │
│  │  │  (Cloud Database)       │  │  (In-Memory Store)   │ │  │
│  │  │  - Users Collection     │  │  - Session Cache     │ │  │
│  │  │  - Tokens Collection    │  │  - Rate Limiting     │ │  │
│  │  │  - Logs Collection      │  │  - Analytics Cache   │ │  │
│  │  └─────────────────────────┘  └──────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              External Services                           │  │
│  │  - SMTP (Email Delivery)                                │  │
│  │  - GeoIP (Location Services)                            │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Component Architecture

### Frontend Components

```
┌─────────────────────────────────────────────────────────────┐
│              Nuxt 3 Admin Dashboard                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Layouts    │  │    Pages     │  │  Components  │      │
│  │              │  │              │  │              │      │
│  │ - Default    │  │ - Dashboard  │  │ - UI Library │      │
│  │ - Auth       │  │ - Settings   │  │ - Forms      │      │
│  │ - Error      │  │ - Tasks      │  │ - Tables     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Middleware  │  │    Stores    │  │ Composables  │      │
│  │              │  │              │  │              │      │
│  │ - Auth       │  │ - Auth Store │  │ - useAuth    │      │
│  │ - Role       │  │ - UI Store   │  │ - useAPI     │      │
│  │ - Guest      │  │              │  │ - useI18n    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌───────────────────────────────────────────────────┐      │
│  │              Services Layer                        │      │
│  │  - API Client                                     │      │
│  │  - Auth Service                                   │      │
│  │  - Storage Service                                │      │
│  └───────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Backend Components

```
┌─────────────────────────────────────────────────────────────┐
│           Authentication API (Express.js)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Routes     │  │ Controllers  │  │  Middleware  │      │
│  │              │  │              │  │              │      │
│  │ - /register  │  │ - Auth       │  │ - auth.js    │      │
│  │ - /login     │  │              │  │ - error.js   │      │
│  │ - /logout    │  │              │  │ - rateLimit  │      │
│  │ - /profile   │  │              │  │ - validator  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Models     │  │   Services   │  │   Utilities  │      │
│  │              │  │              │  │              │      │
│  │ - User.js    │  │ - Email      │  │ - Logger     │      │
│  │              │  │ - Cache      │  │ - AppError   │      │
│  │              │  │ - Analytics  │  │ - Validator  │      │
│  │              │  │ - Location   │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌───────────────────────────────────────────────────┐      │
│  │              Configuration                         │      │
│  │  - database.js                                    │      │
│  │  - environment variables (.env)                   │      │
│  └───────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### Authentication Flow

```
┌────────┐                                              ┌────────┐
│        │  1. POST /api/auth/login                    │        │
│        │  { email, password }                        │        │
│        │─────────────────────────────────────────────▶│        │
│        │                                              │        │
│  User  │  2. Validate Credentials                    │  API   │
│        │     Check Account Status                    │        │
│        │     Generate JWT Tokens                     │        │
│        │                                              │        │
│        │  3. Response with tokens                    │        │
│        │◀─────────────────────────────────────────────│        │
│        │  { accessToken, refreshToken, user }        │        │
└────────┘                                              └────────┘
     │                                                       │
     │ 4. Store tokens                                      │
     │    (Cookie + LocalStorage)                           │
     │                                                       │
     │ 5. Subsequent requests                               │
     │    Authorization: Bearer {accessToken}               │
     ├──────────────────────────────────────────────────────▶
     │                                                       │
     │ 6. Validate token                                    │
     │    Check expiration                                  │
     │    Verify signature                                  │
     │                                                       │
     │ 7. Return protected resource                         │
     │◀──────────────────────────────────────────────────────
```

### Token Refresh Flow

```
┌────────┐                                              ┌────────┐
│        │  1. Access token expired                    │        │
│        │     Error 401 Unauthorized                  │        │
│        │◀─────────────────────────────────────────────│        │
│        │                                              │        │
│ Client │  2. POST /api/auth/refresh-token            │  API   │
│        │     { refreshToken }                        │        │
│        │─────────────────────────────────────────────▶│        │
│        │                                              │        │
│        │  3. Validate refresh token                  │        │
│        │     Generate new access token               │        │
│        │                                              │        │
│        │  4. Return new access token                 │        │
│        │◀─────────────────────────────────────────────│        │
│        │     { accessToken }                         │        │
└────────┘                                              └────────┘
```

---

## 🌐 API Architecture

### RESTful API Design

**Base URL:** `http://localhost:3001/api/auth`

**Authentication:** Bearer Token (JWT)

**Response Format:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* Response data */ }
}
```

### API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /register | No | Register new user |
| POST | /login | No | Login user |
| POST | /logout | Yes | Logout current session |
| POST | /logout-all | Yes | Logout all sessions |
| POST | /refresh-token | No | Refresh access token |
| GET | /profile | Yes | Get user profile |
| PUT | /profile | Yes | Update profile |
| POST | /change-password | Yes | Change password |
| POST | /forgot-password | No | Request password reset |
| POST | /reset-password | No | Reset password with token |
| GET | /verify-email/:token | No | Verify email address |
| GET | /health | No | Health check |

### Rate Limiting

```javascript
// General endpoints
100 requests per 15 minutes per IP

// Authentication endpoints
5 requests per 15 minutes per IP
```

### API Versioning

Current: `v1` (implicit in path)  
Future: `/api/v2/auth/...`

---

## 🎨 Frontend Architecture

### Layer Architecture

```
┌─────────────────────────────────────────────────┐
│          Presentation Layer (Pages)              │
│  - index.vue                                     │
│  - settings/*.vue                                │
│  - (auth)/*.vue                                  │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│         Component Layer (Components)             │
│  - UI components (buttons, forms, etc.)         │
│  - Business components (user-card, etc.)        │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│       State Management (Pinia Stores)            │
│  - Auth Store (user, tokens, auth state)        │
│  - UI Store (theme, sidebar, settings)          │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│          Service Layer (Composables)             │
│  - useAuth() - Authentication logic             │
│  - useAPI() - API communication                 │
│  - useI18n() - Internationalization             │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│              API Layer (Fetch/Axios)             │
│  - HTTP client                                  │
│  - Request/Response interceptors                │
│  - Error handling                               │
└─────────────────────────────────────────────────┘
```

### State Management (Pinia)

```typescript
// Auth Store
interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Actions
- login(email, password)
- register(userData)
- logout()
- refreshAccessToken()
- initializeAuth()
```

### Routing Structure

```
/                           # Dashboard (protected)
├── (auth)/
│   ├── login              # Login page (public)
│   ├── register           # Register page (public)
│   └── forgot-password    # Password reset (public)
├── settings/
│   ├── profile            # User profile (protected)
│   ├── account            # Account settings (protected)
│   ├── appearance         # Theme settings (protected)
│   └── notifications      # Notification settings (protected)
├── tasks                  # Tasks page (protected)
├── email                  # Email templates (protected)
└── components/            # Component showcase (protected)
    ├── accordion
    ├── button
    ├── dialog
    └── ... (70+ components)
```

---

## 💾 Database Schema

### User Collection (MongoDB)

```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: Enum['user', 'agent', 'admin'],
  isActive: Boolean,
  isEmailVerified: Boolean,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  loginAttempts: Number,
  lockUntil: Date,
  lastLogin: Date,
  profile: {
    phone: String,
    address: String,
    city: String,
    country: String,
    avatar: String,
    preferences: {
      language: String,
      notifications: {
        email: Boolean,
        sms: Boolean
      }
    }
  },
  refreshTokens: [{
    token: String,
    expiresAt: Date,
    device: String,
    ip: String,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
// Unique indexes
{ email: 1 } (unique)

// Query optimization indexes
{ role: 1 }
{ isActive: 1 }
{ isEmailVerified: 1 }
{ 'refreshTokens.token': 1 }

// Compound indexes
{ email: 1, isActive: 1 }
```

---

## 🔐 Security Architecture

### Multi-Layer Security

```
┌─────────────────────────────────────────────────┐
│         Layer 1: Network Security                │
│  - HTTPS/TLS encryption                         │
│  - CORS policies                                │
│  - Rate limiting                                │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│      Layer 2: Application Security               │
│  - Helmet.js security headers                   │
│  - Input validation (express-validator)         │
│  - XSS protection                               │
│  - SQL/NoSQL injection prevention               │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│      Layer 3: Authentication Security            │
│  - JWT tokens (access + refresh)                │
│  - Password hashing (bcrypt)                    │
│  - Account lockout mechanism                    │
│  - Email verification                           │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│      Layer 4: Data Security                      │
│  - MongoDB authentication                       │
│  - Environment variable secrets                 │
│  - Encrypted connections                        │
│  - Audit logging                                │
└─────────────────────────────────────────────────┘
```

### JWT Token Structure

**Access Token:**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "user_id",
    "email": "user@example.com",
    "role": "user",
    "iat": 1234567890,
    "exp": 1234568790
  }
}
```

**Expiration:**
- Access Token: 15 minutes
- Refresh Token: 7 days

---

## 🚀 Deployment Architecture

### Docker Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Docker Compose Stack                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────┐    ┌──────────────────┐          │
│  │  Frontend        │    │  Backend API     │          │
│  │  (Nuxt 3)        │    │  (Node.js)       │          │
│  │  Port: 3000      │◀───│  Port: 3001      │          │
│  │  Image: custom   │    │  Image: custom   │          │
│  └──────────────────┘    └────────┬─────────┘          │
│                                    │                     │
│                          ┌─────────▼─────────┐          │
│                          │  MongoDB          │          │
│                          │  Port: 27017      │          │
│                          │  Image: mongo:6.0 │          │
│                          └───────────────────┘          │
│                                    │                     │
│                          ┌─────────▼─────────┐          │
│                          │  Redis            │          │
│                          │  Port: 6379       │          │
│                          │  Image: redis:7   │          │
│                          └───────────────────┘          │
│                                                           │
│  Network: realestate-network (bridge)                   │
│  Volumes: mongodb_data, redis_data                      │
└─────────────────────────────────────────────────────────┘
```

### Production Deployment

```
┌─────────────────────────────────────────────────────────┐
│              Load Balancer / CDN                         │
│              (CloudFlare, AWS ALB, etc.)                 │
└────────────────────┬────────────────────────────────────┘
                     │
      ┌──────────────┴──────────────┐
      │                              │
┌─────▼─────┐                  ┌────▼──────┐
│ Frontend  │                  │ Backend   │
│ Instance  │                  │ API       │
│ (SSR/SSG) │                  │ Cluster   │
│           │                  │           │
│ Vercel/   │                  │ AWS ECS/  │
│ Netlify   │                  │ K8s Pods  │
└───────────┘                  └─────┬─────┘
                                     │
                          ┌──────────▼──────────┐
                          │  MongoDB Atlas      │
                          │  (Cloud Database)   │
                          │  M10+ Cluster       │
                          └─────────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │  Redis Cloud        │
                          │  (Managed Cache)    │
                          └─────────────────────┘
```

### Scaling Strategy

**Horizontal Scaling:**
- Multiple backend API instances
- Load balancer distribution
- Stateless application design

**Vertical Scaling:**
- Increase container resources (CPU/RAM)
- MongoDB Atlas tier upgrade
- Redis instance upgrade

**Caching Strategy:**
- Redis for session management
- API response caching
- CDN for static assets

---

## 🛠️ Technology Stack

### Backend Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js 18+ | JavaScript runtime |
| Framework | Express 4.21 | Web framework |
| Database | MongoDB 6.0 | Document database |
| ODM | Mongoose 8.8 | Object modeling |
| Cache | Redis 5.8 | In-memory cache |
| Auth | JWT 9.0 | Token authentication |
| Security | Helmet 8.0 | Security headers |
| Validation | express-validator 7.2 | Input validation |
| Logging | Winston 3.15 | Structured logging |
| Testing | Jest 30.2 | Unit testing |

### Frontend Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Nuxt 3.4 | Meta-framework |
| UI Library | Vue 3.5 | Reactive UI |
| State | Pinia 0.5 | State management |
| Styling | TailwindCSS 4.1 | Utility CSS |
| Components | Shadcn-vue 2.3 | UI components |
| Forms | Vee-Validate 4.15 | Form validation |
| Types | TypeScript 5.9 | Type safety |
| i18n | @nuxtjs/i18n 10.2 | Internationalization |

---

## 📊 Performance Considerations

### Backend Optimization

- **Connection Pooling**: MongoDB connection pool (10 connections)
- **Compression**: gzip compression for responses
- **Rate Limiting**: Prevent abuse and DDoS
- **Caching**: Redis for frequently accessed data
- **Async Operations**: Non-blocking I/O

### Frontend Optimization

- **Code Splitting**: Automatic with Nuxt 3
- **Lazy Loading**: Components and routes
- **SSR/SSG**: Improved initial load time
- **Tree Shaking**: Remove unused code
- **Asset Optimization**: Image optimization, minification

---

## 🔮 Future Enhancements

### Planned Microservices

1. **Property Management Service**
   - CRUD operations for properties
   - Image upload and management
   - Search and filtering

2. **User Management Service**
   - Advanced user profiles
   - Social features
   - User ratings and reviews

3. **Payment Service**
   - Payment processing
   - Subscription management
   - Invoice generation

4. **Notification Service**
   - Email notifications
   - Push notifications
   - SMS notifications

### Planned Features

- Real-time updates (WebSockets)
- Advanced search with Elasticsearch
- Machine learning recommendations
- Mobile application (React Native)
- Admin analytics dashboard
- Multi-tenant support

---

## 📞 Contact & Support

For architecture questions or suggestions:
- Create a GitHub issue
- Contact the development team
- Refer to individual component documentation

---

**Last Updated:** November 22, 2025  
**Version:** 1.0.0
