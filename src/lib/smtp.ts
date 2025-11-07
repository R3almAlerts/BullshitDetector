// src/lib/smtp.ts
import { supabase } from './supabase';

interface SMTPConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
}

export async function getSMTPConfig(): Promise<SMTPConfig | null> {
  const { data } = await supabase.from('smtp_config').select('*').single();
  return data || null;
}

export async function saveSMTPConfig(config: SMTPConfig) {
  const { error } = await supabase.from('smtp_config').upsert(config).select();
  if (error) throw error;
}

export async function sendOTP(email: string, code: string) {
  const smtpConfig = await getSMTPConfig();
  if (!smtpConfig) throw new Error('SMTP config not set. Admin must configure in /admin-config.');

  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransporter({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
  });

  await transporter.sendMail({
    from: `"Bullshit Detector" <noreply@bullshitdetector.com>`,
    to: email,
    subject: 'Your OTP Code',
    text: `Your 6-digit OTP code is: ${code}\n\nIt expires in 5 minutes.\n\nIf you didn't request this, ignore this email.`,
  });
}