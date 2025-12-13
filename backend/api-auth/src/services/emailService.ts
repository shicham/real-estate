import dotenv from 'dotenv'
dotenv.config()
import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer'
import logger from '../lib/logger.js'
import { log } from 'winston'

interface SendEmailOptions {
  to: string
  subject: string
  html?: string
  text?: string
}

class EmailService {
  private readonly transporter: Transporter = nodemailer.createTransport({
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
      logger.info(`verifyConnection SMTP_PORT ${process.env.SMTP_PORT}`)
      logger.info(`verifyConnection SMTP_HOST ${process.env.SMTP_HOST}`)
      logger.info(`verifyConnection SMTP_USER ${process.env.SMTP_USER}`)

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
        from: process.env.FROM_NAME || 'support@viridial.com',
        to,
        subject,
        html,
        text
      }
      const info = await this.transporter.sendMail(mailOptions) as SentMessageInfo
      logger.info(`Email sent to ${to}: ${info.messageId}`)
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

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 Real Estate Platform</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for registering with Real Estate Platform. To complete your registration, please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link in your browser:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>This link will expire in 24 hours for security reasons.</p>
            <p>If you did not create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2025 Real Estate Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Real Estate Platform - Verify Your Email
      
      Thank you for registering with Real Estate Platform. To complete your registration, please verify your email address by visiting this link:
      
      ${verificationUrl}
      
      This link will expire in 24 hours for security reasons.
      
      If you did not create an account, please ignore this email.
    `;

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

  // Email de changement de mot de passe
  async sendPasswordChangeEmail(email: string, displayName?: string) {
    const loginUrl =
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Password Changed</title></head>
<body>
  <h2>Password Changed Successfully</h2>
  <p>Hello ${displayName || 'User'},</p>
  <p>Your password has been successfully changed. If you did not make this change, please contact support immediately.</p>
  <p>You can login with your new password here: <a href="${loginUrl}">${loginUrl}</a></p>
  <p>For security reasons, we recommend not sharing your password with anyone.</p>
</body>
</html>`

    const text = `Password Changed Successfully

Hello ${displayName || 'User'},

Your password has been successfully changed. If you did not make this change, please contact support immediately.

You can login with your new password here: ${loginUrl}

For security reasons, we recommend not sharing your password with anyone.`

    return this.sendEmail(email, 'Password Changed Successfully', html, text)
  }
}

// Création du singleton
const emailService = new EmailService()

// Initialisation async au démarrage
emailService.initialize().catch(error => {
  logger.error('Failed to initialize email service:', error)
})

export default emailService
