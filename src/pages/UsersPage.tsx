// Full file: src/pages/UsersPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth, useProtected } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Edit, Trash2, Loader2 } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  role: 'admin' | 'editor' | 'user';
  mode: 'voter' | 'professional';
  created_at: string;
}

export default function UsersPage() {
  useProtected(); // Ensure logged in
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return <div className="text-center py-8 text-red-600">Access denied. Admin only.</div>;
  }

  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const updateRole = async (userId: string, newRole: Profile['role']) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('user_id', userId);
    if (error) {
      setError(error.message);
    } else {
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
      setEditingId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Delete user and profile? Irreversible.')) return;
    try {
      await supabase.rpc('delete_user', { user_id: userId });
      setUsers(prev => prev.filter(u => u.user_id !== userId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          Loading users...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Refresh
        </button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {user.email}
                </td>
                <td className="px-6 py-4">
                  {editingId === user.id ? (
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user.user_id, e.target.value as Profile['role'])}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="user">User</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' : user.role === 'editor' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  )}
                  {editingId !== user.id && (
                    <button onClick={() => setEditingId(user.id)} aria-label="Edit role">
                      <Edit className="h-4 w-4 ml-2 text-gray-500" />
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.mode}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDelete(user.user_id)}
                    className="text-red-600 hover:text-red-900 mr-3"
                    aria-label="Delete user"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">No users found.</div>
        )}
      </div>
    </div>
  );
}