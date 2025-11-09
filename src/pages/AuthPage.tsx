// src/pages/AuthPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ADMIN_EMAIL = 'admin@bullshitdetector.com';

function generateOTP(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentOTP, setCurrentOTP] = useState('');
  const [otpExpiry, setOtpExpiry] = useState<NodeJS.Timeout | null>(null);

  const { login, isValidUser } = useAuth();
  const navigate = useNavigate();

  const generateNewOTP = () => {
    const newOTP = generateOTP();
    setCurrentOTP(newOTP);
    // Simulate 30-second expiry: regenerate after timeout
    if (otpExpiry) clearTimeout(otpExpiry);
    setOtpExpiry(setTimeout(() => {
      setError('OTP expired. Please generate a new one.');
      setCurrentOTP('');
    }, 30000));
  };

  const handleEmailSubmit = () => {
    if (email !== ADMIN_EMAIL) {
      setError('Invalid admin email. Contact support.');
      return;
    }
    setStep('otp');
    setError('');
    generateNewOTP(); // Generate OTP on entering OTP step
  };

  const handleRegenerateOTP = () => {
    setError('');
    generateNewOTP();
  };

  const handleOTPSubmit = async () => {
    if (otp !== currentOTP) {
      setError('Invalid OTP. Check the code above and try again.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, otp);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (otpExpiry) clearTimeout(otpExpiry);
    };
  }, [otpExpiry]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        {error && <p className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">{error}</p>}
        {step === 'email' ? (
          <>
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
            <button
              onClick={handleEmailSubmit}
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
            >
              Next
            </button>
          </>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Your 8-digit OTP: <strong>{currentOTP || 'Generate to see'}</strong></p>
              <p className="text-xs text-gray-500">This code expires in 30 seconds.</p>
              {!currentOTP && (
                <button
                  onClick={generateNewOTP}
                  className="text-purple-600 hover:underline text-xs mt-1"
                >
                  Generate OTP
                </button>
              )}
              {currentOTP && (
                <button
                  onClick={handleRegenerateOTP}
                  className="text-purple-600 hover:underline text-xs mt-1"
                >
                  Regenerate
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Enter 8-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={8}
              className="w-full mb-4 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
            <button
              onClick={handleOTPSubmit}
              disabled={loading || otp.length < 8 || !currentOTP}
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <button
              onClick={() => setStep('email')}
              className="w-full mt-2 text-sm text-purple-600 hover:underline"
            >
              Change Email
            </button>
          </>
        )}
      </div>
    </div>
  );
}