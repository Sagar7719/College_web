'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { Menu, ExternalLink, LogOut, ShieldCheck } from 'lucide-react';
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
          <Menu size={20} />
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
        <Link href="/" target="_blank" className={styles.publicViewBtn} title="View Live Public Website" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span>View Website</span>
          <ExternalLink size={14} />
        </Link>

        {user && (
          <div className={styles.userInfo}>
            <p className={styles.userEmail}>{user.email || 'Administrator'}</p>
            <span className={styles.userRole} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={12} />
              Super Admin
            </span>
          </div>
        )}
        <Button variant="outline" size="sm" onClick={handleLogout} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <LogOut size={14} />
          Logout
        </Button>
      </div>
    </header>
  );
};
