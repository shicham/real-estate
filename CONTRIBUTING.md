# Contributing to Real Estate Platform

First off, thank you for considering contributing to the Real Estate Platform! It's people like you that make this project better.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## 🎯 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if applicable**
- **Include your environment details** (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List some examples of how it would be used**

### Pull Requests

1. Fork the repository
2. Create a new branch from `develop` (not `main`)
3. Make your changes
4. Test your changes thoroughly
5. Update documentation if needed
6. Submit a pull request

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- npm or pnpm
- Docker (optional)
- MongoDB Atlas account

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/shicham/real-estate.git
   cd real-estate
   ```

2. **Backend Setup**
   ```bash
   cd apis/api-auth
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd front/admin
   pnpm install
   cp .env.example .env
   # Edit .env with your configuration
   pnpm run dev
   ```

4. **Docker Setup (Alternative)**
   ```bash
   # From project root
   docker-compose up -d
   ```

## 📝 Coding Standards

### Backend (Node.js)

- Follow the existing ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Keep functions small and focused
- Use async/await instead of callbacks
- Handle errors properly with try/catch
- Write unit tests for new features

**Example:**
```javascript
/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user object
 */
async function registerUser(userData) {
  try {
    // Implementation
  } catch (error) {
    logger.error('Failed to register user:', error);
    throw error;
  }
}
```

### Frontend (Vue/TypeScript)

- Follow the existing ESLint configuration
- Use TypeScript for type safety
- Use Composition API over Options API
- Keep components small and reusable
- Use Pinia for state management
- Follow Vue.js style guide
- Write descriptive commit messages

**Example:**
```typescript
// Good
<script setup lang="ts">
interface Props {
  user: User
  isLoading: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  submit: [data: FormData]
}>()

// Component logic
</script>
```

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests after the first line

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Example:**
```
feat(auth): add password reset functionality

- Add password reset endpoint
- Create email template for reset link
- Add frontend form for password reset
- Update tests

Closes #123
```

## 🔄 Pull Request Process

1. **Update Documentation**
   - Update README.md if needed
   - Add/update JSDoc comments
   - Update API documentation

2. **Follow the Template**
   - Fill out the pull request template completely
   - Link related issues
   - Provide context for your changes

3. **Ensure CI Passes**
   - All tests must pass
   - Code must be linted
   - Build must succeed

4. **Request Review**
   - Tag relevant reviewers
   - Respond to feedback promptly
   - Make requested changes

5. **Merge Requirements**
   - Approved by at least one maintainer
   - All CI checks passing
   - No merge conflicts
   - Branch is up to date with develop

## 🧪 Testing Guidelines

### Backend Testing

Write tests for:
- All new API endpoints
- Business logic functions
- Utility functions
- Error scenarios

**Example:**
```javascript
describe('User Registration', () => {
  it('should register a new user with valid data', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe'
    };
    
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(userData.email);
  });
});
```

### Frontend Testing

Write tests for:
- Component behavior
- Store actions and getters
- Utility functions
- User interactions

**Running Tests:**
```bash
# Backend
cd apis/api-auth
npm test

# Frontend (when tests are added)
cd front/admin
pnpm test
```

## 📚 Additional Resources

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Vue.js Style Guide](https://vuejs.org/style-guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Conventional Commits](https://www.conventionalcommits.org/)

## ❓ Questions?

Feel free to:
- Open an issue for discussion
- Contact the maintainers
- Check existing documentation

## 🙏 Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!

---

**Happy Coding! 🚀**
