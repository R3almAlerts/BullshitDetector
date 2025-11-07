// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  isAdmin: boolean;
  mode: 'voter' | 'professional';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  generateOTP: () => Promise<string>;
  validateOTP: (otp: string) => Promise<boolean>;
  isValidUser: (email: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Internal admin config (in production, move to env or db)
const ADMIN_EMAIL = 'admin@bullshitdetector.com';
const ADMIN_OTP_SECRET = 'JBSWY3DPEHPK3PXP'; // Base32 secret for TOTP (generate with otpauth)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('auth-session');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
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

  const isValidUser = (email: string) => email === ADMIN_EMAIL;

  const generateOTP = async (): Promise<string> => {
    try {
      const { OTPAuth } = await import('otpauth');
      const totp = new OTPAuth({
        issuer: 'BullshitDetector',
        label: 'Admin 2FA',
        type: 'totp',
        digits: 8,
        secret: ADMIN_OTP_SECRET,
        algorithm: 'SHA256',
      });
      return totp.generate();
    } catch (error) {
      console.error('OTP Generation failed:', error);
      throw new Error('OTP generation unavailable. Check otpauth installation.');
    }
  };

  const validateOTP = async (otp: string): Promise<boolean> => {
    try {
      const { OTPAuth } = await import('otpauth');
      const totp = new OTPAuth({
        issuer: 'BullshitDetector',
        label: 'Admin 2FA',
        type: 'totp',
        digits: 8,
        secret: ADMIN_OTP_SECRET,
        algorithm: 'SHA256',
      });
      return totp.validate({ token: otp }) !== null;
    } catch (error) {
      console.error('OTP Validation failed:', error);
      throw new Error('OTP validation unavailable. Check otpauth installation.');
    }
  };

  const login = async (email: string, otp: string): Promise<void> => {
    if (!isValidUser(email)) {
      throw new Error('Invalid admin email.');
    }

    const isValid = await validateOTP(otp);
    if (!isValid) {
      throw new Error('Invalid 2FA code.');
    }

    const userData: User = {
      email,
      isAdmin: true,
      mode: 'voter', // Default; update via config
    };

    saveSession(userData);
  };

  const logout = async (): Promise<void> => {
    clearSession();
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      generateOTP,
      validateOTP,
      isValidUser,
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