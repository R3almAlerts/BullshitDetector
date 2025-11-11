// Full file: src/pages/AuthPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

const ADMIN_EMAIL = 'admin@bullshitdetector.com';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const navigate = useNavigate();

  // Auto-fill admin email for convenience
  useEffect(() => {
    setEmail(ADMIN_EMAIL);
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email !== ADMIN_EMAIL) {
      setError('Only admin@bullshitdetector.com can log in here.');
      return;
    }

    setLoading(true);
    setError('');
    setInfo('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) throw error;

      setStep('otp');
      setInfo('Check your email for the 6-digit OTP. It expires in 5 minutes.');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) throw error;
      if (data.session) {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Login</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Secure OTP-based authentication
          </p>
        </div>

        {/* Info Message */}
        {info && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-300">{info}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Email Step */}
        {step === 'email' && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="admin@bullshitdetector.com"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Only <strong>{ADMIN_EMAIL}</strong> is authorized.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || email !== ADMIN_EMAIL}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </button>
          </form>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter 6-Digit OTP
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                className="w-full text-center text-2xl tracking-widest px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono"
                placeholder="000000"
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                Check your email. Code expires in 5 minutes.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtp('');
                  setError('');
                  setInfo('');
                }}
                className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="flex-1 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>© 2025 Bullshit Detector. Admin access only.</p>
        </div>
      </div>
    </div>
  );
}