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
  }),

  otpEmail: (otp, purpose) => {
    const purposeText = purpose === 'verify' ? 'verifying your account' : 'logging in';
    return {
      subject: 'Your PeerLearn OTP Code',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">PeerLearn</h1>
          </div>
          <h2 style="color: #1e293b; text-align: center; margin-bottom: 10px;">Security Code</h2>
          <p style="color: #64748b; text-align: center; margin-bottom: 24px;">Use the code below for ${purposeText}. For your security, please do not share this code.</p>
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-family: monospace; font-size: 40px; font-weight: 700; color: #1e293b; letter-spacing: 5px;">${otp}</span>
          </div>
          <p style="color: #94a3b8; text-align: center; font-size: 14px; margin: 0;">This code will expire in 10 minutes.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #94a3b8; text-align: center; font-size: 12px; margin: 0;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `
    };
  },

  passwordResetLink: (resetLink) => ({
    subject: 'Reset Your Password - PeerLearn',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>We received a request to reset your password. Click the button below to proceed.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Reset My Password
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px; word-break: break-all;">${resetLink}</p>
        <p style="font-size: 12px; color: #777;">This link expires in 1 hour.</p>
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

    // For development, if no EMAIL_USER is provided, we use a fail-safe or Ethereal
    if (!process.env.EMAIL_USER) {
      console.warn('⚠️ EMAIL_USER not configured. Emails will NOT be sent.');
      return {
        sendMail: async (options) => {
          console.log('\x1b[36m%s\x1b[0m', '📧 [REALISTIC SIMULATION] :: Email routing to: ' + options.to);
          console.log('\x1b[2m%s\x1b[0m', '   Subject: ' + options.subject);
          return { messageId: 'simulated-' + Date.now() };
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
   * Send OTP email
   * @param {string} email - Recipient email
   * @param {string} otp - 6-digit code
   * @param {string} purpose - 'login' or 'verify'
   */
  async sendOTPEmail(email, otp, purpose) {
    try {
      const { subject, html } = templates.otpEmail(otp, purpose);

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject,
        html
      });

      console.log(`✅ OTP email (${purpose}) sent to ${email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending OTP email:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   * @param {string} email - Recipient email
   * @param {string} resetLink - Link to reset UI
   */
  async sendPasswordResetEmail(email, resetLink) {
    try {
      const { subject, html } = templates.passwordResetLink(resetLink);

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject,
        html
      });

      console.log(`✅ Password reset email sent to ${email}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
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
