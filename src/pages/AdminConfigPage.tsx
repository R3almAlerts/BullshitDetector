// src/pages/AdminConfigPage.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SMTPConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
}

export default function AdminConfigPage() {
  const { user } = useAuth();
  if (!user || !user.isAdmin) {
    return <div className="text-center p-8">Access denied.</div>;
  }

  const [config, setConfig] = useState<SMTPConfig>({
    host: '',
    port: 587,
    user: '',
    pass: '',
    secure: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const { data } = await supabase.from('smtp_config').select('*').single();
    if (data) setConfig(data);
  };

  const saveConfig = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.from('smtp_config').upsert(config).select();
      if (error) throw error;
      alert('SMTP config saved!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Admin SMTP Configuration</h1>
      {error && <p className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</p>}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">SMTP Host</label>
            <input
              type="text"
              value={config.host}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
              placeholder="smtp.gmail.com"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Port</label>
            <input
              type="number"
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: Number(e.target.value) })}
              placeholder="587"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="email"
              value={config.user}
              onChange={(e) => setConfig({ ...config, user: e.target.value })}
              placeholder="your-email@gmail.com"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password/App Password</label>
            <input
              type="password"
              value={config.pass}
              onChange={(e) => setConfig({ ...config, pass: e.target.value })}
              placeholder="your-app-password"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
            />
          </div>
        </div>
        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={config.secure}
            onChange={(e) => setConfig({ ...config, secure: e.target.checked })}
            className="mr-2"
          />
          Use SSL/TLS (Recommended)
        </label>
        <button
          onClick={saveConfig}
          disabled={loading}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Config'}
        </button>
      </div>
    </div>
  );
}