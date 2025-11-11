// Full file: supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createTransport } from 'https://deno.land/x/deno_nodemailer@1.0.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface EmailEvent {
  type: string;
  to: string;
  variables: {
    code?: string;
    token?: string;
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
      throw new Error('Failed to fetch SMTP config');
    }

    const transporter = createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    let subject = '';
    let html = '';

    switch (event.type) {
      case 'email_otp':
        subject = 'Your OTP Code for Bullshit Detector';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Your OTP Code</h2>
            <p>Use this code to log in:</p>
            <h1 style="font-size: 32px; letter-spacing: 4px;">${event.variables.code}</h1>
            <p>This code expires in 5 minutes.</p>
            <p>If you didn't request this, ignore this email.</p>
          </div>
        `;
        break;
      // Add other auth email types as needed, e.g., 'signup', 'magiclink'
      default:
        throw new Error(`Unsupported email type: ${event.type}`);
    }

    await transporter.sendMail({
      from: config.user,
      to: event.to,
      subject,
      html,
    });

    return new Response('Email sent', { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
});