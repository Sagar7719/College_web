'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './admin.module.css';

export interface AdminMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const adminDrawerNav = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { label: 'Pages (Page Builder)', href: '/admin/pages', icon: '📄' },
  { label: 'Navigation Menu', href: '/admin/navigation', icon: '🧭' },
  { label: 'Footer Links', href: '/admin/footer', icon: '🦶' },
  { label: 'Departments', href: '/admin/departments', icon: '🏛️' },
  { label: 'Courses', href: '/admin/courses', icon: '🎓' },
  { label: 'Faculty Directory', href: '/admin/faculty', icon: '👨‍🏫' },
  { label: 'Notices', href: '/admin/notices', icon: '📌' },
  { label: 'News & Press', href: '/admin/news', icon: '📰' },
  { label: 'Events', href: '/admin/events', icon: '📅' },
  { label: 'Contact Messages', href: '/admin/contact-messages', icon: '✉️' },

  { label: 'Gallery', href: '/admin/gallery', icon: '🖼️' },
  { label: 'Downloads', href: '/admin/downloads', icon: '📥' },
  { label: 'Media Library', href: '/admin/media', icon: '📁' },
  { label: 'Site Settings', href: '/admin/settings', icon: '⚙️' },
];

export const AdminMobileDrawer: React.FC<AdminMobileDrawerProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.drawerOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.sidebar} style={{ display: 'flex', width: '280px', height: '100%', position: 'absolute', right: 0 }} onClick={(e) => e.stopPropagation()}>
        <div className={styles.sidebarHeader} style={{ justifyContent: 'space-between' }}>
          <span>CMS Navigation</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
        </div>
        <div className={styles.sidebarBody}>
          <ul className={styles.sidebarList}>
            {adminDrawerNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ''}`}
                    onClick={onClose}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
