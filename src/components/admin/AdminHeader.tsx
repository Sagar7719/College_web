'use client';

import React from 'react';
import Link from 'next/link';
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
        <div>
          <h1 className={styles.headerTitle}>{title}</h1>
          <div className={styles.breadcrumbPath}>
            <span>CMS Admin</span>
            <span>/</span>
            <span style={{ color: '#C85A32', fontWeight: 600 }}>{title}</span>
          </div>
        </div>
      </div>

      <div className={styles.userControl}>
        {/* Direct Link to View Public Website */}
        <Link href="/" target="_blank" className={styles.publicViewBtn} title="View Live Public Website">
          <span>View Website</span>
          <span style={{ fontSize: '0.875rem' }}>↗</span>
        </Link>

        {user && (
          <div className={styles.userInfo}>
            <p className={styles.userEmail}>{user.email || 'Administrator'}</p>
            <span className={styles.userRole}>Super Admin</span>
          </div>
        )}
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout 🚪
        </Button>
      </div>
    </header>
  );
};
