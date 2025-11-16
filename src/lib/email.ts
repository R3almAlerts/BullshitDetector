// src/lib/email.ts
export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Calls the local Express API (`/api/email/send`) to send an email.
 */
export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  const res = await fetch('/api/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Failed to send email');
  }
};

export const templates = {
  /** Confirmation email after a successful sign-up */
  signupConfirmation: (email: string, token: string) => ({
    subject: 'Confirm Your Bullshit Detector Account',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
        <h2>Welcome to Bullshit Detector!</h2>
        <p>Click the link below to verify your email address:</p>
        <a href="${window.location.origin}/auth/confirm?token=${token}&email=${encodeURIComponent(email)}"
           style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Verify Email
        </a>
        <p style="margin-top:20px;font-size:12px;color:#666;">
          If you didn’t sign up, you can safely ignore this email.
        </p>
      </div>
    `,
  }),

  /** OTP email for admin login */
  adminOtp: (code: string) => ({
    subject: 'Your Bullshit Detector Login Code',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
        <h2>One-Time Login Code</h2>
        <p>Use the code below to sign in:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;margin:20px 0;color:#7c3aed;">
          ${code}
        </div>
        <p>This code expires in 5 minutes.</p>
      </div>
    `,
  }),
};