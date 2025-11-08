// src/pages/SplashPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button'; // Assume shadcn/ui or Tailwind equiv; fallback to <button>

export default function SplashPage() {
  const navigate = useNavigate();
  const { signIn, loading, error: authError } = useAuth(); // Use context error for fallback
  const [demoError, setDemoError] = useState<string | null>(null); // Specific demo error state
  const [retryCount, setRetryCount] = useState(0); // For retry UX

  const handleDemoLogin = async () => {
    setDemoError(null);
    try {
      await signIn('admin@r3alm.com', 'admin123'); // Repo demo creds
      navigate('/sentiment', { replace: true });
    } catch (err: any) {
      const msg = err.message || 'Unknown error';
      console.error('Demo login failed:', err); // Log for dev
      setDemoError(msg.includes('Invalid login') ? 'Invalid credentials—check password hash in Supabase.' :
                    msg.includes('confirm') ? 'Email not confirmed—disable in Auth Settings.' :
                    msg.includes('network') ? 'Network issue—check connection.' :
                    `Login failed: ${msg}. Ensure admin@r3alm.com exists with role: 'admin'.`);
      setRetryCount(prev => prev + 1);
    }
  };

  const handleRetry = () => {
    setDemoError(null);
    handleDemoLogin();
  };

  const handleSignUp = () => navigate('/auth?mode=signup');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="text-center max-w-md w-full">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Bullshit Detector
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Detect spin and nonsense with AI precision.
        </p>
        <div className="space-y-4">
          <Button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 font-semibold rounded-lg transition"
            aria-label="Login as demo admin for quick access"
          >
            {loading ? 'Logging in...' : 'Demo Admin Login (admin@r3alm.com)'}
          </Button>
          <Button
            variant="outline"
            onClick={handleSignUp}
            className="w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 py-3 font-semibold rounded-lg transition"
          >
            Sign Up / Login
          </Button>
        </div>
        {demoError && (
          <div 
            role="alert" 
            aria-live="polite"
            className="mt-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm"
          >
            <div className="font-medium mb-1">{demoError}</div>
            {retryCount < 3 && (
              <button
                onClick={handleRetry}
                className="text-red-600 hover:underline text-xs font-medium"
                aria-label="Retry demo login"
              >
                Retry ({3 - retryCount} attempts left)
              </button>
            )}
            {retryCount >= 3 && <div className="text-xs mt-1">Contact support or check console.</div>}
          </div>
        )}
        {authError && !demoError && ( // Fallback for general auth errors
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{authError}</div>
        )}
        <p className="text-sm text-gray-500 mt-6">
          Quick start: Use demo to explore sentiment analysis.
        </p>
      </div>
    </div>
  );
}