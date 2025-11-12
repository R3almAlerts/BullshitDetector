// Full file: api/email.ts
import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import { z } from 'zod';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }));
app.use(express.json());

const SMTP_CONFIG = {
  host: 'smtp.r3alm.com',
  port: 465,
  secure: true,
  auth: {
    user: 'no-reply@r3alm.com',
    pass: 'Z3us!@#$1r3alm',
  },
};

const transporter = nodemailer.createTransporter(SMTP_CONFIG);

const EmailSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  html: z.string(),
  text: z.string().optional(),
});

app.post('/send', async (req, res) => {
  try {
    const { to, subject, html, text } = EmailSchema.parse(req.body);

    await transporter.sendMail({
      from: `"Bullshit Detector" <no-reply@r3alm.com>`,
      to,
      subject,
      html,
      text: text ?? html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

export default app;