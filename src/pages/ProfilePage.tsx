// src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Profile {
  email: string;
  mode: 'voter' | 'professional';
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'voter' | 'professional'>('voter');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No row found—common on first login
          console.warn('Profile not found—will create on update:', error.message);
        } else {
          setError('Failed to fetch profile');
          console.error('Profile fetch error:', error);
        }
      } else if (data) {
        setProfile(data);
        setMode(data.mode || 'voter'); // Fallback if null
      }
    } catch (err: any) {
      setError('Network error fetching profile');
      console.error('Profile fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          mode,
          created_at: profile?.created_at || new Date().toISOString(), // Preserve if exists
        }, { onConflict: 'user_id' }); // Fix: Explicit onConflict for unique key (avoids 409 duplicate)

      if (error) {
        setError('Failed to update profile');
        console.error('Profile update error:', error);
      } else {
        setProfile({ ...profile, mode, email: user.email, created_at: profile?.created_at || new Date().toISOString() });
        console.log('Profile updated successfully');
      }
    } catch (err: any) {
      setError('Network error updating profile');
      console.error('Profile update failed:', err);
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
        <p><strong>Email:</strong> {profile?.email || 'Not set'}</p>
        <p><strong>Created:</strong> {profile ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</p>
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
            onClick={updateProfile}
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