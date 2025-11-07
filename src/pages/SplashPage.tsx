// src/pages/SplashPage.tsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SplashPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentOTP, setCurrentOTP] = useState('');

  const { login, generateOTP, isValidUser } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async () => {
    if (email && isValidUser(email)) {
      setStep('otp');
      setError('');
      try {
        const otpCode = await generateOTP();
        setCurrentOTP(otpCode);
      } catch (err) {
        setError('OTP generation failed. Try again.');
      }
    } else {
      setError('Invalid admin email. Contact support.');
    }
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Bullshit Detector</h1>
          <p className="text-gray-600 dark:text-gray-400">Validate claims with AI-powered precision</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <button
              onClick={handleEmailSubmit}
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
            >
              Next
            </button>
          </>
        ) : (
          <>
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">Your 8-digit OTP: <strong>{currentOTP}</strong></p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Expires in 30 seconds. Generate new if needed.</p>
            </div>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={8}
              placeholder="Enter 8-digit OTP"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <button
              onClick={handleOTPSubmit}
              disabled={loading || otp.length < 8}
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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