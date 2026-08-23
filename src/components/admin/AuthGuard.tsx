'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth state resolved and no user or not admin, redirect to login page
    if (!loading && (!user || !isAdmin) && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, isAdmin, loading, pathname, router]);

  // Allow login page render without redirect loop
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Show clean admin loading state while checking session
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-light)',
          padding: '2rem',
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '1rem' }}>🔒</div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Verifying Administrator Session...</h3>
          <Skeleton height="1.25rem" width="80%" style={{ margin: '0 auto 0.5rem' }} />
          <Skeleton height="1rem" width="60%" style={{ margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
};
