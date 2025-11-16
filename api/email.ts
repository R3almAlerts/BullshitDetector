// api/email.ts
import express from 'express';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { z } from 'zod';
import { supabase } from '../src/lib/supabase'; // only for user lookup

const router = express.Router();
router.use(express.json());

/* ---------- SMTP ---------- */
const transporter = nodemailer.createTransport({
  host: 'smtp.r3alm.com',
  port: 465,
  secure: true,
  auth: { user: 'no-reply@r3alm.com', pass: 'Z3us!@#$1r3alm' },
});

/* ---------- Schemas ---------- */
const EmailPayload = z.object({
  to: z.string().email(),
  subject: z.string(),
  html: z.string(),
  text: z.string().optional(),
});

/* ---------- Helper: generate 6-digit OTP ---------- */
const generateOtp = () => crypto.randomInt(100000, 999999).toString();

/* ---------- POST /api/email/send ---------- */
router.post('/send', async (req, res) => {
  try {
    const { to, subject, html, text } = EmailPayload.parse(req.body);
    await transporter.sendMail({
      from: '"Bullshit Detector" <no-reply@r3alm.com>',
      to,
      subject,
      html,
      text: text ?? html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
    });
    res.json({ success: true });
  } catch (e) {
    console.error('Email error:', e);
    res.status(500).json({ error: (e as Error).message });
  }
});

/* ---------- POST /api/email/signup ---------- */
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    // 1. Create user in Supabase (no email confirmation)
    const { data: user, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${process.env.CLIENT_URL ?? 'http://localhost:5173'}/auth` },
    });
    if (error) throw error;

    // 2. Generate a one-time token (store in auth.users metadata)
    const token = crypto.randomBytes(32).toString('hex');
    await supabase.auth.admin.updateUserById(user.user!.id, {
      user_metadata: { email_confirm_token: token },
    });

    // 3. Send confirmation email via local API
    await fetch(`${process.env.CLIENT_URL ?? 'http://localhost:5173'}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        ...templates.signupConfirmation(email, token),
      }),
    });

    res.json({ success: true, message: 'Check your email to confirm.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: (e as Error).message });
  }
});

/* ---------- POST /api/email/otp ---------- */
router.post('/otp', async (req, res) => {
  const { email } = req.body;
  if (email !== 'admin@r3alm.com') return res.status(403).json({ error: 'Forbidden' });

  try {
    const otp = generateOtp();

    // Store OTP temporarily in Supabase (auth.users metadata)
    const { data: admin } = await supabase.auth.admin.listUsers();
    const adminUser = admin.users.find(u => u.email === email);
    if (!adminUser) throw new Error('Admin not found');

    await supabase.auth.admin.updateUserById(adminUser.id, {
      user_metadata: { admin_otp: otp, admin_otp_expires: Date.now() + 5 * 60 * 1000 },
    });

    // Send OTP via local API
    await fetch(`${process.env.CLIENT_URL ?? 'http://localhost:5173'}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: email, ...templates.adminOtp(otp) }),
    });

    res.json({ success: true, message: 'OTP sent (demo: 123456)' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: (e as Error).message });
  }
});

export default router;