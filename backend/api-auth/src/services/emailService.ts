import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer'
import logger from '../lib/logger.js'

interface SendEmailOptions {
  to: string
  subject: string
  html?: string
  text?: string
}

class EmailService {
  private transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  // Initialise le service et vérifie la connexion SMTP
  async initialize(): Promise<void> {
    await this.verifyConnection()
  }

  // Vérifie la connexion SMTP
  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify!() // nodemailer TS issue, on assure que verify existe
      logger.info('📧 SMTP server connection verified')
    } catch (error) {
      logger.error('SMTP server connection failed:', error)
    }
  }

  // Envoie un email générique
  async sendEmail(
    to: string,
    subject: string,
    html?: string,
    text?: string
  ): Promise<SentMessageInfo> {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@realestate.com',
        to,
        subject,
        html,
        text
      }

      const info = await this.transporter.sendMail(mailOptions) as SentMessageInfo
      logger.info(`Email sent successfully to ${to}:`, info.messageId)
      return info
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error)
      throw error
    }
  }

  // Email de vérification d'adresse
  async sendVerificationEmail(email: string, token: string, displayName?: string) {
    const verificationUrl =
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Verify Your Email</title></head>
<body>
  <h2>Verify Your Email Address</h2>
  <p>Please click the link below:</p>
  <a href="${verificationUrl}">${verificationUrl}</a>
</body>
</html>`

    const text = `Verify Your Email\n\n${verificationUrl}\n\nThis link expires in 24 hours.`

    return this.sendEmail(email, 'Verify Your Email Address', html, text)
  }

  // Email de réinitialisation de mot de passe
  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl =
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Reset Password</title></head>
<body>
  <h2>Password Reset</h2>
  <a href="${resetUrl}">${resetUrl}</a>
</body>
</html>`

    const text = `Reset your password:\n\n${resetUrl}\n\nThis link expires in 10 minutes.`

    return this.sendEmail(email, 'Reset Your Password', html, text)
  }

  // Email de bienvenue
  async sendWelcomeEmail(email: string, firstName: string) {
    const loginUrl =
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Welcome</title></head>
<body>
  <h2>Hello ${firstName}!</h2>
  <p>Welcome to Real Estate Platform.</p>
  <a href="${loginUrl}">${loginUrl}</a>
</body>
</html>`

    const text = `Welcome ${firstName}!\n\nLogin here: ${loginUrl}`

    return this.sendEmail(email, 'Welcome to Real Estate Platform!', html, text)
  }
}

// Création du singleton
const emailService = new EmailService()

// Initialisation async au démarrage
emailService.initialize().catch(error => {
  logger.error('Failed to initialize email service:', error)
})

export default emailService
