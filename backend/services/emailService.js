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

  tutorApproved: (userName) => ({
    subject: 'Application Approved - Welcome to Aura Mentors!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #4f46e5; border-radius: 12px;">
        <h2 style="color: #4f46e5;">Congratulations, ${userName}!</h2>
        <p>We are pleased to inform you that your tutor application for <strong>Aura Luminous</strong> has been approved.</p>
        <p>You now have access to your Tutor Workspace where you can:</p>
        <ul>
          <li>Create and manage scholarly materials</li>
          <li>Set your availability for peer tutoring</li>
          <li>Respond to student inquiries in the Q&A Forum</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/tutor-dashboard" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Access Tutor Workspace
          </a>
        </div>
        <p style="font-size: 14px; color: #64748b;">Welcome to the team!</p>
      </div>
    `
  }),

  tutorRejected: (userName, reason) => ({
    subject: 'Update on Your Tutor Application',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ef4444; border-radius: 12px;">
        <h2 style="color: #1e293b;">Hello ${userName},</h2>
        <p>Thank you for your interest in joining the Aura Luminous mentor network.</p>
        <p>After a careful review of your profile, we are unable to approve your application at this time.</p>
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #991b1b; font-weight: bold;">Reason for Decision:</p>
          <p style="margin: 5px 0 0 0; color: #b91c1c;">${reason || 'Information provided does not meet our current scholastic verification standards.'}</p>
        </div>
        <p>You may update your profile and apply again in the future.</p>
      </div>
    `
  }),

  childActivityAlert: (parentName, childName, activityType, details) => ({
    subject: `Alert: New Activity for ${childName} on Aura`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Aura Platform</h1>
        </div>
        <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 15px;">Hello ${parentName},</h2>
        <p style="font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 20px;">
          We are notifying you about a new update regarding <strong>${childName}</strong>'s learning activity:
        </p>
        <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <p style="margin: 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px;">Activity Type</p>
          <p style="margin: 0; font-size: 16px; font-weight: 700; color: #1e293b;">${activityType}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;">
          <p style="margin: 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px;">Details</p>
          <p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.5;">${details}</p>
        </div>
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/parent" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
            View Parent Dashboard
          </a>
        </div>
        <p style="margin-top: 30px; font-size: 13px; color: #94a3b8; text-align: center;">
          This is an automated notification based on your account settings.
        </p>
      </div>
    `
  })
};

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  createTransporter() {
    const hasAuth = !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS;
    const emailConfig = process.env.EMAIL_HOST
      ? {
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT) || 587,
          secure: false,
          auth: hasAuth ? { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } : undefined
        }
      : {
          service: 'gmail',
          auth: hasAuth ? { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } : undefined
        };

    if (!process.env.EMAIL_USER) {
      console.warn('⚠️ EMAIL_USER not configured. Emails will NOT be sent.');
      return {
        sendMail: async (options) => {
          console.log('\x1b[36m%s\x1b[0m', '📧 [SIMULATED] :: Sending email to: ' + options.to);
          console.log('\x1b[2m%s\x1b[0m', '   Subject: ' + options.subject);
          return { messageId: 'simulated-' + Date.now() };
        }
      };
    }

    return nodemailer.createTransport(emailConfig);
  }

  async sendEmailVerification(email, token, baseUrl) {
    const verificationLink = `${baseUrl}/verify-email/${token}`;
    const { subject, html } = templates.emailVerification(verificationLink);
    return this.send(email, subject, html);
  }

  async sendPasswordResetLink(email, token, baseUrl) {
    const resetLink = `${baseUrl}/reset-password/${token}`;
    const { subject, html } = templates.passwordReset(resetLink);
    return this.send(email, subject, html);
  }

  async sendOTPEmail(email, otp, purpose) {
    const { subject, html } = templates.otpEmail(otp, purpose);
    return this.send(email, subject, html);
  }

  async sendWelcomeEmail(email, userName) {
    const { subject, html } = templates.welcomeEmail(userName);
    return this.send(email, subject, html);
  }

  async sendTutorApprovedEmail(email, userName) {
    const { subject, html } = templates.tutorApproved(userName);
    return this.send(email, subject, html);
  }

  async sendTutorRejectedEmail(email, userName, reason) {
    const { subject, html } = templates.tutorRejected(userName, reason);
    return this.send(email, subject, html);
  }

  async sendChildActivityAlert(email, parentName, childName, activityType, details) {
    const { subject, html } = templates.childActivityAlert(parentName, childName, activityType, details);
    return this.send(email, subject, html);
  }

  async send(to, subject, html) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        html
      });
      console.log(`✅ Email sent successfully to ${to}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
