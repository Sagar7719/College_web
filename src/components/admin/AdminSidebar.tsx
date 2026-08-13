'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './admin.module.css';

interface NavGroup {
  label: string;
  items: { label: string; href: string; icon: string }[];
}

const adminNavGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', href: '/admin/dashboard', icon: '📊' }],
  },
  {
    label: 'Website Builder',
    items: [
      { label: 'Pages (CMS Pages)', href: '/admin/pages', icon: '📄' },
      { label: 'Navigation Menu', href: '/admin/navigation', icon: '🧭' },
      { label: 'Footer Links', href: '/admin/footer', icon: '🦶' },
      { label: 'SEO Settings', href: '/admin/seo', icon: '🔎' },
    ],
  },
  {
    label: 'Academics',
    items: [
      { label: 'Departments', href: '/admin/departments', icon: '🏛️' },
      { label: 'Courses & Programs', href: '/admin/courses', icon: '🎓' },
      { label: 'Faculty Directory', href: '/admin/faculty', icon: '👨‍🏫' },
    ],
  },
  {
    label: 'Notices & Content',
    items: [
      { label: 'Notices & Circulars', href: '/admin/notices', icon: '📌' },
      { label: 'News & Press', href: '/admin/news', icon: '📰' },
      { label: 'Campus Events', href: '/admin/events', icon: '📅' },
      { label: 'Contact Messages', href: '/admin/contact-messages', icon: '✉️' },
    ],
  },
  {
    label: 'Media & Documents',
    items: [
      { label: 'Photo Gallery', href: '/admin/gallery', icon: '🖼️' },
      { label: 'Document Downloads', href: '/admin/downloads', icon: '📥' },
      { label: 'Media Library', href: '/admin/media', icon: '📁' },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { label: 'Site Settings & Branding', href: '/admin/settings', icon: '⚙️' },
      { label: 'Admin Setup Wizard', href: '/admin/setup', icon: '🚀' },
    ],
  },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'A';

  return (
    <aside className={styles.sidebar}>
      {/* Executive Branding Header */}
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarBrandBadge}>🎓</div>
        <div>
          <span className={styles.sidebarTitle}>College CMS</span>
          <span className={styles.sidebarSubTitle}>Enterprise Console</span>
        </div>
      </div>

      {/* Navigation Body */}
      <div className={styles.sidebarBody}>
        {adminNavGroups.map((group, idx) => (
          <div key={idx} className={styles.navGroup}>
            <div className={styles.navGroupLabel}>{group.label}</div>
            <ul className={styles.sidebarList}>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href} className={styles.sidebarListItem}>
                    <Link
                      href={item.href}
                      className={`${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ''}`}
                    >
                      <span className={styles.sidebarLinkIcon}>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* User Status Footer */}
      <div className={styles.sidebarFooter}>
        <div className={styles.sidebarUserAvatar}>{userInitial}</div>
        <div className={styles.sidebarUserInfo}>
          <div className={styles.sidebarUserName}>{user?.email || 'Administrator'}</div>
          <div className={styles.sidebarUserStatus}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80' }}></span>
            Active Session
          </div>
        </div>
      </div>
    </aside>
  );
};
