'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import styles from './admin.module.css';

export interface AdminHeaderProps {
  title: string;
  onOpenMobileMenu: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, onOpenMobileMenu }) => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <header className={styles.adminHeader}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onOpenMobileMenu}
          className={styles.mobileMenuBtn}
          aria-label="Toggle admin sidebar drawer"
        >
          ☰
        </button>
        <h1 className={styles.headerTitle}>{title}</h1>
      </div>

      <div className={styles.userControl}>
        {user && (
          <div className={styles.userInfo}>
            <p className={styles.userEmail}>{user.email || 'Administrator'}</p>
            <span className={styles.userRole}>College Administrator</span>
          </div>
        )}
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout 🚪
        </Button>
      </div>
    </header>
  );
};
