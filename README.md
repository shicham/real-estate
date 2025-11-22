# 🏢 Real Estate Platform

A modern, full-stack real estate management platform built with Node.js, Express, MongoDB, Nuxt 3, and Vue.js.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Nuxt](https://img.shields.io/badge/Nuxt-3-00DC82.svg)](https://nuxt.com/)

## 📋 Overview

This platform provides a comprehensive solution for real estate management, featuring:

- 🔐 **Secure Authentication API** with JWT tokens
- 🎨 **Modern Admin Dashboard** with 70+ pages
- 🌍 **Multi-language Support** (EN, FR, AR)
- 🐳 **Docker Ready** for easy deployment
- ☁️ **Cloud-Native** with MongoDB Atlas

## 🏗️ Project Structure

```
real-estate/
├── apis/
│   └── api-auth/          # Authentication Microservice (Node.js/Express)
│       ├── src/           # Source code
│       ├── test/          # Test suites
│       └── Dockerfile     # Docker configuration
│
└── front/
    └── admin/             # Admin Dashboard (Nuxt 3/Vue.js)
        ├── app/           # Application code
        ├── components/    # Vue components
        └── pages/         # Application pages
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm or pnpm
- MongoDB Atlas account (for backend)
- Docker (optional)

### Backend Setup

```bash
# Navigate to backend
cd apis/api-auth

# Install dependencies
npm install

# Configure environment (copy and edit .env)
cp .env.example .env

# Start development server
npm run dev

# Backend runs on http://localhost:3001
```

### Frontend Setup

```bash
# Navigate to frontend
cd front/admin

# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Frontend runs on https://localhost:3000
```

### Docker Setup

```bash
# Backend with Docker
cd apis/api-auth
npm run docker:build
npm run docker:run

# Check health
curl http://localhost:3001/health
```

## 🔑 Key Features

### Backend API (Port 3001)
- ✅ JWT Authentication (access + refresh tokens)
- ✅ Role-based access control (user, agent, admin)
- ✅ Email verification
- ✅ Password reset
- ✅ Rate limiting & security
- ✅ MongoDB Atlas integration
- ✅ Winston logging
- ✅ Docker support

### Frontend Dashboard (Port 3000)
- ✅ Modern responsive UI
- ✅ 70+ component pages
- ✅ Dark/Light mode
- ✅ Multi-language (EN/FR/AR)
- ✅ Pinia state management
- ✅ TailwindCSS 4
- ✅ TypeScript
- ✅ Shadcn-vue components

## 📚 Documentation

- **[Complete Project Analysis](./PROJECT_ANALYSIS.md)** - Comprehensive analysis and recommendations
- **[Backend API README](./apis/api-auth/README.md)** - Authentication API documentation
- **[Frontend Admin README](./front/admin/README.md)** - Dashboard documentation

## 🔧 Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express 4.21
- **Database:** MongoDB Atlas (Mongoose 8.8)
- **Authentication:** JWT 9.0
- **Security:** Helmet, CORS, Rate Limiting
- **Email:** Nodemailer 7.0
- **Logging:** Winston 3.15
- **Cache:** Redis 5.8
- **Testing:** Jest 30.2

### Frontend
- **Framework:** Nuxt 3.4.1
- **UI Library:** Vue 3.5
- **State:** Pinia 0.5
- **Components:** Shadcn-vue 2.3
- **Styling:** TailwindCSS 4.1
- **Forms:** Vee-Validate + Zod
- **i18n:** @nuxtjs/i18n 10.2
- **Icons:** Lucide Vue
- **TypeScript:** 5.9

## 🛡️ Security

The platform implements multiple security layers:

- JWT token authentication with refresh tokens
- Password hashing with bcrypt
- Account lockout after failed attempts
- Rate limiting on API endpoints
- CORS protection
- Helmet.js security headers
- Input validation
- MongoDB injection protection
- XSS protection

## 🧪 Testing

```bash
# Backend tests
cd apis/api-auth
npm test

# Run with coverage
npm test -- --coverage
```

## 📦 Deployment

### Production Build

```bash
# Backend
cd apis/api-auth
npm run docker:build
npm run docker:run

# Frontend
cd front/admin
pnpm run build
pnpm run preview
```

### Environment Variables

Create `.env` files based on `.env.example` templates:

**Backend (.env):**
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=your_mongodb_atlas_uri
JWT_ACCESS_SECRET=your_access_secret_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_32_chars
```

**Frontend (.env):**
```env
NUXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Development Team

## 🙏 Acknowledgments

- [Nuxt.js](https://nuxt.com/) - Vue framework
- [Shadcn-vue](https://shadcn-vue.com/) - UI components
- [Express](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting section in component READMEs

## 🗺️ Roadmap

- [x] Authentication API (Completed)
- [x] Admin Dashboard UI (Completed)
- [ ] Property Management Microservice
- [ ] User Management Features
- [ ] Payment Integration
- [ ] Mobile Application
- [ ] Real-time Notifications
- [ ] Advanced Analytics

---

**Status:** ✅ Backend Production Ready | ⚠️ Frontend in Development

For detailed analysis and recommendations, see [PROJECT_ANALYSIS.md](./PROJECT_ANALYSIS.md)
