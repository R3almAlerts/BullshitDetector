// Full file: src/lib/email.ts
import { createTransport } from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const SMTP_CONFIG = {
  host: 'smtp.r3alm.com',
  port: 465,
  secure: true,
  auth: {
    user: 'no-reply@r3alm.com',
    pass: 'Z3us!@#$1r3alm',
  },
};

let transporter: ReturnType<typeof createTransport> | null = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransport(SMTP_CONFIG);
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }: SendEmailOptions): Promise<void> => {
  const from = `"Bullshit Detector" <no-reply@r3alm.com>`;

  try {
    await getTransporter().sendMail({
      from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error(`Email send failed: ${(error as Error).message}`);
  }
};

// Template helpers
export const templates = {
  signupConfirmation: (redirectUrl: string, token: string) => ({
    subject: 'Confirm Your Bullshit Detector Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Welcome to Bullshit Detector!</h2>
        <p>Click the button below to confirm your email and activate your account:</p>
        <a href="${redirectUrl}?token=${token}" 
           style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Confirm Email
        </a>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          If you didn't create an account, ignore this email.
        </p>
      </div>
    `,
  }),

  passwordRecovery: (redirectUrl: string, token: string) => ({
    subject: 'Reset Your Bullshit Detector Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>Click below to set a new password:</p>
        <a href="${redirectUrl}?token=${token}" 
           style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Reset Password
        </a>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          This link expires in 1 hour. If you didn't request this, ignore it.
        </p>
      </div>
    `,
  }),

  emailOtp: (code: string) => ({
    subject: 'Your Bullshit Detector Login Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Your One-Time Code</h2>
        <p>Use this code to log in:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; margin: 20px 0; color: #7c3aed;">
          ${code}
        </div>
        <p>This code expires in 5 minutes.</p>
        <p style="font-size: 12px; color: #666;">
          If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  }),

  magicLink: (redirectUrl: string, token: string) => ({
    subject: 'Your Magic Login Link',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Log in with one click</h2>
        <p>Click below to sign in instantly:</p>
        <a href="${redirectUrl}?token=${token}" 
           style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Sign In
        </a>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          This link expires in 30 minutes.
        </p>
      </div>
    `,
  }),
};