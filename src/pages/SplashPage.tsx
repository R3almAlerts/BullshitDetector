// src/pages/SplashPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button'; // Assume shadcn/ui or Tailwind equiv

export default function SplashPage() {
  const navigate = useNavigate();
  const { signIn, loading, error } = useAuth();

  const handleDemoLogin = async () => {
    try {
      await signIn('admin@r3alm.com', 'admin123'); // Repo demo creds
      navigate('/sentiment', { replace: true });
    } catch (err) {
      console.error('Demo login failed:', err);
      // Fallback: Alert or toast
      alert('Demo login failed. Ensure admin@r3alm.com exists in Supabase with role: admin.');
    }
  };

  const handleSignUp = () => navigate('/auth?mode=signup');

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>
        )}
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
        <p className="text-sm text-gray-500 mt-6">
          Quick start: Use demo to explore sentiment analysis.
        </p>
      </div>
    </div>
  );
}