// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, withTimeout } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  role: 'admin' | 'editor' | 'user' | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: 'admin' | 'editor' | 'user') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'editor' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Init session
    withTimeout(supabase.auth.getSession(), 5000).then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((err) => {
      console.error('Auth init failed:', err);
      setError(err.message);
      setLoading(false);
    });

    // Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setError(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const userRole = (user.user_metadata?.role as 'admin' | 'editor' | 'user') ?? 'user';
      setRole(userRole);
    } else {
      setRole(null);
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        10000
      );
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: 'admin' | 'editor' | 'user' = 'user') => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await withTimeout(
        supabase.auth.signUp({
          email,
          password,
          options: { data: { role } },
        }),
        10000
      );
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await withTimeout(supabase.auth.signOut(), 5000);
      setUser(null);
      setRole(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({ user, role, loading, error, signIn, signUp, signOut }),
    [user, role, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
};

// New: Protected hook for admin routes
export const useProtected = () => {
  const { role, loading } = useAuth();
  if (loading) return { protected: true, isAdmin: false }; // Show loader
  if (role !== 'admin') throw new Error('Admin access required');
  return { protected: true, isAdmin: true };
};