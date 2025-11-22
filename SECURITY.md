# Security Policy

## 🔒 Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## 🚨 Reporting a Vulnerability

We take the security of the Real Estate Platform seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do NOT:

- ❌ Open a public GitHub issue
- ❌ Discuss the vulnerability in public forums
- ❌ Exploit the vulnerability beyond what is necessary to demonstrate it

### Please DO:

1. **Email us directly** at: security@realestate.com (or create a private security advisory on GitHub)
2. **Provide detailed information:**
   - Type of vulnerability
   - Location in the code (file path, line number)
   - Step-by-step instructions to reproduce
   - Proof-of-concept or exploit code (if possible)
   - Potential impact of the vulnerability
   - Suggested fix (if you have one)

### What to expect:

- **Acknowledgment**: We will acknowledge receipt within **48 hours**
- **Assessment**: We will assess the vulnerability within **7 days**
- **Fix**: We will work on a fix and release it as soon as possible
- **Credit**: We will credit you in the security advisory (if you wish)

## 🛡️ Security Measures

### Backend API Security

#### Authentication & Authorization
- ✅ JWT tokens with short expiration (15 minutes)
- ✅ Refresh token rotation
- ✅ Role-based access control (RBAC)
- ✅ Account lockout after 5 failed attempts
- ✅ Password hashing with bcrypt (10 rounds)

#### API Security
- ✅ Rate limiting (100 req/15min general, 5 req/15min auth)
- ✅ CORS with whitelist
- ✅ Helmet.js security headers
- ✅ Input validation with express-validator
- ✅ MongoDB injection protection
- ✅ XSS protection

#### Infrastructure Security
- ✅ Non-root Docker user
- ✅ Minimal Alpine Linux image
- ✅ Environment variables for secrets
- ✅ Health check endpoints
- ✅ Structured logging with Winston

### Frontend Security

- ✅ HTTPS only in production
- ✅ Cookie security flags (httpOnly, secure, sameSite)
- ✅ Content Security Policy
- ✅ Input sanitization
- ✅ XSS protection
- ✅ CSRF protection

## 🔍 Known Vulnerabilities

### Current Status (as of November 2025)

**Backend Dependencies:**
```
4 vulnerabilities (3 moderate, 1 high)

HIGH:
- glob 10.2.0-10.4.5: Command injection via CLI

MODERATE:
- js-yaml <3.14.2 || >=4.0.0 <4.1.1: Prototype pollution
- validator <13.15.20: URL validation bypass
- express-validator: Depends on vulnerable validator
```

**Action Required:** Run `npm audit fix` in `apis/api-auth/` directory

## 🔐 Security Best Practices for Contributors

### Code Review Checklist

Before submitting code, ensure:

- [ ] All user inputs are validated and sanitized
- [ ] No sensitive data in logs or error messages
- [ ] No hardcoded secrets or credentials
- [ ] SQL/NoSQL injection prevention
- [ ] XSS prevention
- [ ] CSRF tokens where applicable
- [ ] Authentication checks on protected routes
- [ ] Authorization checks for role-based access
- [ ] Rate limiting on sensitive endpoints
- [ ] Proper error handling (no stack traces to users)

### Secure Coding Guidelines

#### Password Management
```javascript
// ✅ DO: Use bcrypt with proper rounds
const hashedPassword = await bcrypt.hash(password, 10);

// ❌ DON'T: Use weak hashing algorithms
const hashedPassword = md5(password);
```

#### Input Validation
```javascript
// ✅ DO: Validate and sanitize all inputs
const { body, validationResult } = require('express-validator');

app.post('/api/users', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
});

// ❌ DON'T: Trust user input directly
const user = new User(req.body);
```

#### SQL/NoSQL Injection
```javascript
// ✅ DO: Use parameterized queries
const user = await User.findOne({ email: sanitizedEmail });

// ❌ DON'T: Build queries with string concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

#### Secret Management
```javascript
// ✅ DO: Use environment variables
const secret = process.env.JWT_SECRET;

// ❌ DON'T: Hardcode secrets
const secret = 'my-super-secret-key';
```

#### Error Handling
```javascript
// ✅ DO: Return generic error messages to users
try {
  // ... operation
} catch (error) {
  logger.error('Operation failed:', error);
  return res.status(500).json({ 
    error: 'An error occurred. Please try again.' 
  });
}

// ❌ DON'T: Expose stack traces
catch (error) {
  return res.status(500).json({ error: error.stack });
}
```

## 🚀 Security Update Process

When a security vulnerability is identified:

1. **Triage** - Assess severity and impact
2. **Fix** - Develop and test a patch
3. **Test** - Thoroughly test the fix
4. **Release** - Release a security patch
5. **Notify** - Notify users and publish advisory
6. **Monitor** - Monitor for any issues

### Severity Levels

- **Critical**: Immediate action required (patch within 24 hours)
- **High**: Urgent action needed (patch within 7 days)
- **Medium**: Should be fixed soon (patch within 30 days)
- **Low**: Fix in regular release cycle

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Vue.js Security](https://vuejs.org/guide/best-practices/security.html)

## 🏆 Security Hall of Fame

We recognize and thank security researchers who responsibly disclose vulnerabilities:

<!-- List will be updated as researchers report vulnerabilities -->

---

## 📞 Contact

For security issues: security@realestate.com  
For general issues: Create a GitHub issue

**Last Updated:** November 22, 2025
