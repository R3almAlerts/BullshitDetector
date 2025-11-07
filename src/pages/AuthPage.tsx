// src/pages/AuthPage.tsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ADMIN_EMAIL = 'admin@bullshitdetector.com';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, generateOTP, isValidUser } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = () => {
    if (email !== ADMIN_EMAIL) {
      setError('Invalid admin email. Contact support.');
      return;
    }
    setStep('otp');
    setError('');
  };

  const handleOTPSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await login(email, otp);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentOTP = generateOTP();

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
              <p className="text-sm text-gray-600 mb-2">Your 8-digit OTP: <strong>{currentOTP}</strong></p>
              <p className="text-xs text-gray-500">This code expires in 30 seconds. Generate new if needed.</p>
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
              disabled={loading || otp.length < 8}
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