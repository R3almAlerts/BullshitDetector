// src/pages/AuthPage.tsx (only the changed parts are shown)
import { sendEmail, templates } from '../lib/email';

// ---------- SIGN-UP ----------
const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(''); setLoading(true);
  try {
    const res = await fetch('/api/email/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Signup failed');

    setInfo(data.message ?? 'Check your email to confirm.');
    setMode('login');
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

// ---------- SEND OTP ----------
const handleSendOTP = async (e: React.FormEvent) => {
  e.preventDefault();
  if (email !== ADMIN_EMAIL) return setError('Only admin@r3alm.com can log in here.');

  setLoading(true); setError(''); setInfo('');
  try {
    const res = await fetch('/api/email/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to send OTP');

    setMode('otp');
    setInfo(data.message ?? 'Check your email (demo code: 123456).');
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};