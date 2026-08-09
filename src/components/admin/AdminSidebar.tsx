'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
      { label: 'Pages (Page Builder)', href: '/admin/pages', icon: '📄' },
      { label: 'Navigation Menu', href: '/admin/navigation', icon: '🧭' },
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
      { label: 'Announcements Ticker', href: '/admin/announcements', icon: '📢' },
      { label: 'News & Press', href: '/admin/news', icon: '📰' },
      { label: 'Campus Events', href: '/admin/events', icon: '📅' },
    ],
  },
  {
    label: 'Media & Documents',
    items: [
      { label: 'Photo Gallery Albums', href: '/admin/gallery', icon: '🖼️' },
      { label: 'Document Downloads', href: '/admin/downloads', icon: '📥' },
      { label: 'Media Library', href: '/admin/media', icon: '📁' },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { label: 'Site Settings & Branding', href: '/admin/settings', icon: '⚙️' },
      { label: 'Maintenance Mode', href: '/admin/maintenance', icon: '🔧' },
      { label: 'Admin Setup Wizard', href: '/admin/setup', icon: '🚀' },
    ],
  },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <span style={{ fontSize: '1.5rem' }}>🎓</span>
        <div>
          <span className={styles.sidebarTitle}>College CMS</span>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Admin Panel</p>
        </div>
      </div>

      <div className={styles.sidebarBody}>
        {adminNavGroups.map((group, idx) => (
          <div key={idx} className={styles.navGroup}>
            <div className={styles.navGroupLabel}>{group.label}</div>
            <ul className={styles.sidebarList}>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ''}`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
};
