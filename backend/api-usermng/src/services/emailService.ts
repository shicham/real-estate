import dotenv from 'dotenv'
dotenv.config()
import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer'
import logger from '../lib/logger.js'
import { log } from 'winston'
import { t } from '../lib/i18n.js'

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
  async sendPasswordResetEmail(email: string, token: string, language: string = 'en') {
    const resetUrl =
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`

    const isRTL = language === 'ar'
    const textAlign = isRTL ? 'right' : 'left'
    const direction = isRTL ? 'rtl' : 'ltr'

    const html = `
      <!DOCTYPE html>
      <html dir="${direction}" lang="${language}">
      <head>
        <meta charset="utf-8">
        <title>${t('passwordResetSubject', language)}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; direction: ${direction}; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; text-align: ${textAlign}; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; text-align: ${textAlign}; }
          .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .url-link { word-break: break-all; text-align: ${textAlign}; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 Real Estate Platform</h1>
          </div>
          <div class="content">
            <h2>${t('passwordResetSubject', language)}</h2>
            <p>${t('passwordResetBody', language)}</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">${t('passwordResetButton', language)}</a>
            </div>
            <p>${t('passwordResetLinkText', language)}</p>
            <p class="url-link"><a href="${resetUrl}">${resetUrl}</a></p>
            <p>${t('passwordResetExpiry', language)}</p>
            <p>${t('passwordResetIgnore', language)}</p>
          </div>
          <div class="footer">
            <p>${t('footerText', language)}</p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      ${t('passwordResetSubject', language)}

      ${t('passwordResetBody', language)}

      ${resetUrl}

      ${t('passwordResetExpiry', language)}

      ${t('passwordResetIgnore', language)}
    `

    return this.sendEmail(email, t('passwordResetSubject', language), html, text)
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
  async sendPasswordChangeEmail(email: string, displayName?: string, language: string = 'en') {
    const loginUrl =
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`

    const isRTL = language === 'ar'
    const textAlign = isRTL ? 'right' : 'left'
    const direction = isRTL ? 'rtl' : 'ltr'

    const html = `<!DOCTYPE html>
<html dir="${direction}" lang="${language}">
<head>
  <meta charset="utf-8">
  <title>${t('passwordChangeSubject', language)}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; direction: ${direction}; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; text-align: ${textAlign}; }
    .header { background: #007bff; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; text-align: ${textAlign}; }
    .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .url-link { word-break: break-all; text-align: ${textAlign}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏠 Real Estate Platform</h1>
    </div>
    <div class="content">
      <h2>${t('passwordChangeSubject', language)}</h2>
      <p>${t('passwordChangeGreeting', language)} ${displayName || 'User'},</p>
      <p>${t('passwordChangeBody', language)}</p>
      <p>${t('passwordChangeLoginText', language)}</p>
      <p class="url-link"><a href="${loginUrl}">${loginUrl}</a></p>
      <p>${t('passwordChangeSecurity', language)}</p>
    </div>
    <div class="footer">
      <p>${t('footerText', language)}</p>
    </div>
  </div>
</body>
</html>`

    const text = `${t('passwordChangeSubject', language)}

${t('passwordChangeGreeting', language)} ${displayName || 'User'},

${t('passwordChangeBody', language)}

${t('passwordChangeLoginText', language)} ${loginUrl}

${t('passwordChangeSecurity', language)}`

    return this.sendEmail(email, t('passwordChangeSubject', language), html, text)
  }
}

// Création du singleton
const emailService = new EmailService()

// Initialisation async au démarrage
emailService.initialize().catch(error => {
  logger.error('Failed to initialize email service:', error)
})

export default emailService
