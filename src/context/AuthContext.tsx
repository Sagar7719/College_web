'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuthChanges, loginAdminUser, logoutAdminUser } from '@/lib/firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isLoggingInRef = useRef<boolean>(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      // Prevent onAuthStateChanged from prematurely setting user state before server session cookie is established
      if (isLoggingInRef.current) {
        return;
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    isLoggingInRef.current = true;
    setLoading(true);
    try {
      const loggedUser = await loginAdminUser(email, pass);
      const idToken = await loggedUser.getIdToken();

      // Post ID token to server session endpoint
      const sessionRes = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      // Strict failure handling: if session cookie creation fails, sign out user immediately
      if (!sessionRes.ok) {
        await logoutAdminUser();
        setUser(null);
        setLoading(false);
        throw new Error('Unable to establish a secure server session. Please try again.');
      }

      setUser(loggedUser);
      setLoading(false);
      return loggedUser;
    } catch (error) {
      setUser(null);
      setLoading(false);
      throw error;
    } finally {
      isLoggingInRef.current = false;
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/session', { method: 'DELETE' });
      if (!res.ok) {
        console.warn(`[AuthContext Logout] Server session clearing returned status ${res.status}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[AuthContext Logout] Server session clearing network error: ${message}`);
    } finally {
      try {
        await logoutAdminUser();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[AuthContext Logout] Client logout error: ${message}`);
      }
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
