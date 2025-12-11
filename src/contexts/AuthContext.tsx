import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser } from '../types';
import { getCurrentUser, signOut as authSignOut } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isStaff: boolean;
  isClient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await loadUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      await authSignOut();
      setUser(null);
      // Force page reload to clear all state
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if signOut fails, clear local state and reload
      setUser(null);
      window.location.reload();
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  // Role checks
  const isAdmin = user?.profile?.role === 'admin';
  const isStaff = user?.profile?.role === 'staff';
  const isClient = user?.profile?.role === 'client';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signOut,
      refreshUser,
      isAdmin,
      isStaff,
      isClient
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
