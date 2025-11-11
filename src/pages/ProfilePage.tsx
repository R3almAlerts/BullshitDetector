// Full file: src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'voter' | 'professional'>('voter');
  const [error, setError] = useState('');
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setMode(user.profile?.mode || 'voter');
    setLoading(false);
  }, [user, navigate]);

  const handleUpdate = async () => {
    setError('');
    try {
      await updateProfile({ mode });
      alert('Profile updated!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      {error && <p className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</p>}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Account Info</h2>
        <p><strong>Email:</strong> {user?.email || 'Not set'}</p>
        <p><strong>Role:</strong> {user?.profile?.role || 'User'}</p>
        <p><strong>Created:</strong> {user?.profile ? new Date(user.profile.created_at).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Mode:</strong> {mode}</p>
        <div className="mt-4">
          <label className="flex items-center mb-2">
            <input
              type="radio"
              value="voter"
              checked={mode === 'voter'}
              onChange={(e) => setMode(e.target.value as 'voter' | 'professional')}
              className="mr-2"
            />
            Voter Mode
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="professional"
              checked={mode === 'professional'}
              onChange={(e) => setMode(e.target.value as 'voter' | 'professional')}
              className="mr-2"
            />
            Professional Mode
          </label>
          <button
            onClick={handleUpdate}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Update Profile
          </button>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}