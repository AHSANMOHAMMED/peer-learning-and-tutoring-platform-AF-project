const nodemailer = require('nodemailer');

// Email templates
const templates = {
  emailVerification: (verificationLink) => ({
    subject: 'Verify Your Email - PeerLearn',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to PeerLearn!</h2>
        <p>Please verify your email to get started.</p>
        <p style="margin: 20px 0;">
          <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p>Or copy this link: <code>${verificationLink}</code></p>
        <p style="font-size: 12px; color: #666;">This link expires in 24 hours.</p>
      </div>
    `
  }),

  passwordReset: (resetLink) => ({
    subject: 'Reset Your Password - PeerLearn',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Click the link below to proceed.</p>
        <p style="margin: 20px 0;">
          <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>Or copy this link: <code>${resetLink}</code></p>
        <p style="font-size: 12px; color: #666;">This link expires in 10 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `
  }),

  passwordResetCode: (code) => ({
    subject: 'Your Password Reset Code - PeerLearn',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Code</h2>
        <p>Your password reset code is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">
          ${code}
        </p>
        <p style="font-size: 12px; color: #666;">This code expires in 10 minutes.</p>
      </div>
    `
  }),

  welcomeEmail: (userName) => ({
    subject: 'Welcome to PeerLearn - Start Learning Today!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome, ${userName}!</h2>
        <p>Your account has been successfully created on PeerLearn.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse qualified tutors</li>
          <li>Book peer tutoring sessions</li>
          <li>Share your knowledge</li>
          <li>Connect with other learners</li>
        </ul>
        <p>Get started by completing your profile and finding a tutor!</p>
      </div>
    `
  })
};

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  createTransporter() {
    // Using SMTP or Gmail with app-specific password (or your email service)
    const hasAuth = !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS;

    // If a specific SMTP host is provided (e.g. smtp.gmail.com), use host/port,
    // otherwise fall back to Nodemailer's "service" shortcut (e.g. 'gmail')
    const emailConfig = process.env.EMAIL_HOST
      ? {
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT) || 587,
          secure: false,
          auth: hasAuth
            ? {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
              }
            : undefined
        }
      : {
          service: 'gmail',
          auth: hasAuth
            ? {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
              }
            : undefined
        };

    // For development/testing, use test account
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
      return {
        sendMail: async (options) => {
          console.log('📧 Email would be sent:', options);
          return { messageId: 'test-id' };
        }
      };
    }

    return nodemailer.createTransport(emailConfig);
  }

  /**
   * Send email verification
   * @param {string} email - Recipient email
   * @param {string} token - Verification token
   * @param {string} baseUrl - Base URL for verification link
   */
  async sendEmailVerification(email, token, baseUrl) {
    try {
      const verificationLink = `${baseUrl}/verify-email/${token}`;
      const { subject, html } = templates.emailVerification(verificationLink);

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject,
        html
      });

      console.log(`✅ Verification email sent to ${email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending verification email:', error);
      throw error;
    }
  }

  /**
   * Send password reset link
   * @param {string} email - Recipient email
   * @param {string} token - Reset token
   * @param {string} baseUrl - Base URL for reset link
   */
  async sendPasswordResetLink(email, token, baseUrl) {
    try {
      const resetLink = `${baseUrl}/reset-password/${token}`;
      const { subject, html } = templates.passwordReset(resetLink);

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject,
        html
      });

      console.log(`✅ Reset link email sent to ${email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending reset email:', error);
      throw error;
    }
  }

  /**
   * Send password reset code
   * @param {string} email - Recipient email
   * @param {string} code - Reset code
   */
  async sendPasswordResetCode(email, code) {
    try {
      const { subject, html } = templates.passwordResetCode(code);

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject,
        html
      });

      console.log(`✅ Reset code email sent to ${email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending reset code email:', error);
      throw error;
    }
  }

  /**
   * Send welcome email
   * @param {string} email - Recipient email
   * @param {string} userName - User's name
   */
  async sendWelcomeEmail(email, userName) {
    try {
      const { subject, html } = templates.welcomeEmail(userName);

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject,
        html
      });

      console.log(`✅ Welcome email sent to ${email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      throw error;
    }
  }

  /**
   * Send notification email
   * @param {string} email - Recipient email
   * @param {string} subject - Email subject
   * @param {string} html - Email HTML content
   */
  async sendCustomEmail(email, subject, html) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject,
        html
      });

      console.log(`✅ Email sent to ${email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending custom email:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new EmailService();
