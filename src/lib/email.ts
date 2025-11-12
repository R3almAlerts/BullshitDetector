// Full file: src/lib/email.ts
export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  const response = await fetch('/api/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to send email');
  }
};

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
};