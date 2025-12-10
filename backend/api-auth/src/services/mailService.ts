import nodemailer from 'nodemailer'

type MailOptions = {
  to: string
  subject: string
  html: string
  text?: string
}

class MailService {
  transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: Number(process.env.SMTP_PORT || 587),
      secure: (process.env.SMTP_SECURE === 'true') || false,
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      } : undefined
    })
  }

  async sendMail(opts: MailOptions) {
    const from = process.env.EMAIL_FROM || `no-reply@${process.env.EMAIL_DOMAIN || 'example.com'}`
    await this.transporter.sendMail({ from, to: opts.to, subject: opts.subject, html: opts.html, text: opts.text })
  }

  // sends a verification email with a link to the backend verify endpoint
  async sendVerificationEmail(to: string, token: string, displayName?: string) {
    const backend = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`
    const verifyUrl = `${backend.replace(/\/$/, '')}/auth/verify-email?token=${encodeURIComponent(token)}`
    const frontend = process.env.FRONTEND_URL || ''

    const html = `
      <p>Hi ${displayName || ''},</p>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verifyUrl}">Verify email</a></p>
      ${frontend ? `<p>If the link doesn't work, open your app: <a href="${frontend}">${frontend}</a> and paste the token: <code>${token}</code></p>` : ''}
      <p>If you didn't create an account, you can ignore this email.</p>
    `

    await this.sendMail({ to, subject: 'Verify your email', html })
  }
}

const mailService = new MailService()
export default mailService
