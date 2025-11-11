// Full file: supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createTransport } from 'https://deno.land/x/deno_nodemailer@1.0.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface EmailEvent {
  type: 'signup_confirmation' | 'password_recovery' | 'email_otp' | 'magic_link';
  to: string;
  variables: {
    code?: string;
    token_hash?: string;
    redirect_to?: string;
    [key: string]: any;
  };
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const event: EmailEvent = await req.json();

    // Fetch SMTP config from database
    const { data: config, error: configError } = await supabase
      .from('smtp_config')
      .select('*')
      .single();

    if (configError || !config) {
      console.error('SMTP config error:', configError);
      throw new Error('SMTP configuration not found');
    }

    const transporter = createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        pass: config.password,
      },
    });

    let subject = '';
    let html = '';
    let text = '';

    const baseUrl = Deno.env.get('SUPABASE_URL') || 'http://localhost:54321';

    switch (event.type) {
      case 'signup_confirmation':
        subject = 'Confirm Your Bullshit Detector Account';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Welcome to Bullshit Detector!</h2>
            <p>Click the button below to confirm your email and activate your account:</p>
            <a href="${event.variables.redirect_to}?token=${event.variables.token_hash}" 
               style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Confirm Email
            </a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              If you didn't create an account, ignore this email.
            </p>
          </div>
        `;
        text = `Confirm your account: ${event.variables.redirect_to}?token=${event.variables.token_hash}`;
        break;

      case 'password_recovery':
        subject = 'Reset Your Bullshit Detector Password';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Password Reset Request</h2>
            <p>Click below to set a new password:</p>
            <a href="${event.variables.redirect_to}?token=${event.variables.token_hash}" 
               style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Reset Password
            </a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              This link expires in 1 hour. If you didn't request this, ignore it.
            </p>
          </div>
        `;
        text = `Reset password: ${event.variables.redirect_to}?token=${event.variables.token_hash}`;
        break;

      case 'email_otp':
        subject = 'Your Bullshit Detector Login Code';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Your One-Time Code</h2>
            <p>Use this code to log in:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; margin: 20px 0; color: #7c3aed;">
              ${event.variables.code}
            </div>
            <p>This code expires in 5 minutes.</p>
            <p style="font-size: 12px; color: #666;">
              If you didn't request this, ignore this email.
            </p>
          </div>
        `;
        text = `Your login code: ${event.variables.code}`;
        break;

      case 'magic_link':
        subject = 'Your Magic Login Link';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Log in with one click</h2>
            <p>Click below to sign in instantly:</p>
            <a href="${event.variables.redirect_to}?token=${event.variables.token_hash}" 
               style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Sign In
            </a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              This link expires in 30 minutes.
            </p>
          </div>
        `;
        text = `Sign in: ${event.variables.redirect_to}?token=${event.variables.token_hash}`;
        break;

      default:
        throw new Error(`Unsupported email type: ${event.type}`);
    }

    await transporter.sendMail({
      from: `"Bullshit Detector" <${config.username}>`,
      to: event.to,
      subject,
      html,
      text,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Email send error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});