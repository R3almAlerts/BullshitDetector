// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  isAdmin: boolean;
  mode: 'voter' | 'professional';
}

interface OTP {
  code: string;
  expires: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  logout: () => Promise<void>;
  isValidUser: (email: string, password: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo super admin (hardcoded for quick access; in prod, use Supabase users table)
const SUPER_ADMIN_EMAIL = 'super@r3alm.com';
const SUPER_ADMIN_PASSWORD = 'superpass123';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOTP] = useState<OTP | null>(null);

  useEffect(() => {
    // Load session from localStorage
    const saved = localStorage.getItem('auth-session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      } catch {}
    }
    setLoading(false);
  }, []);

  const saveSession = (userData: User) => {
    localStorage.setItem('auth-session', JSON.stringify(userData));
    setUser(userData);
  };

  const clearSession = () => {
    localStorage.removeItem('auth-session');
    setUser(null);
  };

  const isValidUser = (email: string, password: string): boolean => {
    return email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD;
  };

  const login = async (email: string, password: string): Promise<void> => {
    if (isValidUser(email, password)) {
      // Super admin — Bypass OTP entirely
      const userData: User = {
        id: 'super-admin-id',
        email,
        isAdmin: true,
        mode: 'professional',
      };
      saveSession(userData);
      return;
    }

    // Regular user — verify with Supabase, then send OTP
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (!data.session?.user) throw new Error('Invalid credentials');

    // Generate and send OTP (store in session for 5 min)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const otpObj: OTP = {
      code: otpCode,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    };
    setOTP(otpObj);

    // Save OTP to Supabase (for email sending; see smtp.ts for example)
    await supabase.from('otp_codes').insert({
      user_id: data.session.user.id,
      code: otpCode,
      expires_at: otpObj.expires,
    });

    // Send email (integrate with SMTP from AdminConfig)
    await sendOTP(email, otpCode); // Function defined in smtp.ts

    // Set temp session (await OTP verification)
    saveSession({
      id: data.session.user.id,
      email,
      isAdmin: false,
      mode: 'voter',
    });
  };

  const verifyOTP = async (otp: string): Promise<void> => {
    if (!otp || otp.length !== 6) throw new Error('Invalid OTP format');

    const currentOTP = otp;
    if (!currentOTP || Date.now() > currentOTP.expires) {
      throw new Error('OTP expired. Please login again.');
    }

    if (currentOTP.code !== otp) {
      throw new Error('Invalid OTP code.');
    }

    // Clear OTP
    setOTP(null);

    // Update user as verified
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const userData: User = {
        id: user.id,
        email: user.email || '',
        isAdmin: false,
        mode: 'voter',
      };
      saveSession(userData);
    }
  };

  const logout = async (): Promise<void> => {
    clearSession();
    await supabase.auth.signOut();
  };

  const sendOTP = async (email: string, code: string) => {
    // Fetch SMTP config from Supabase
    const { data: smtpConfig } = await supabase.from('smtp_config').select('*').single();
    if (!smtpConfig) throw new Error('SMTP config not set. Admin must configure in /admin-config.');

    // Dynamic import nodemailer to avoid bundling issues
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
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
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      verifyOTP,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};