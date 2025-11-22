const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async initialize() {
    await this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info('📧 SMTP server connection verified');
    } catch (error) {
      logger.error('SMTP server connection failed:', error);
    }
  }

  async sendEmail(to, subject, html, text) {

    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@realestate.com',
        to,
        subject,
        html,
        text
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}:`, info.messageId);
      return info;
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;
    
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

    return await this.sendEmail(email, 'Verify Your Email Address', html, text);
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .warning { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 Real Estate Platform</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password. If you made this request, click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <div class="warning">
              <strong>Important:</strong> This link will expire in 10 minutes for security reasons.
            </div>
            <p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>© 2025 Real Estate Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Real Estate Platform - Password Reset Request
      
      We received a request to reset your password. If you made this request, visit this link to reset your password:
      
      ${resetUrl}
      
      This link will expire in 10 minutes for security reasons.
      
      If you did not request a password reset, please ignore this email and your password will remain unchanged.
    `;

    return await this.sendEmail(email, 'Reset Your Password', html, text);
  }

  async sendWelcomeEmail(email, firstName) {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Real Estate Platform</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .features { list-style: none; padding: 0; }
          .features li { padding: 8px 0; }
          .features li:before { content: "✓ "; color: #28a745; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 Welcome to Real Estate Platform!</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName}!</h2>
            <p>Welcome to Real Estate Platform! Your account has been successfully created and verified.</p>
            
            <h3>What you can do now:</h3>
            <ul class="features">
              <li>Search and browse property listings</li>
              <li>Save your favorite properties</li>
              <li>Contact property agents directly</li>
              <li>Set up property alerts</li>
              <li>Manage your profile and preferences</li>
            </ul>
            
            <a href="${loginUrl}" class="button">Start Exploring Properties</a>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          </div>
          <div class="footer">
            <p>© 2025 Real Estate Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to Real Estate Platform!
      
      Hello ${firstName}!
      
      Welcome to Real Estate Platform! Your account has been successfully created and verified.
      
      What you can do now:
      • Search and browse property listings
      • Save your favorite properties
      • Contact property agents directly
      • Set up property alerts
      • Manage your profile and preferences
      
      Start exploring: ${loginUrl}
      
      If you have any questions or need assistance, please don't hesitate to contact our support team.
    `;

    return await this.sendEmail(email, 'Welcome to Real Estate Platform!', html, text);
  }
}

const emailService = new EmailService();
// Initialiser le service de manière asynchrone
emailService.initialize().catch(error => {
  logger.error('Failed to initialize email service:', error);
});

module.exports = emailService;