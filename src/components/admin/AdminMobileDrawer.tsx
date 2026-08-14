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
  { label: '📊 Dashboard', href: '/admin/dashboard' },
  { label: '🏠 Home Page', href: '/admin/homepage' },
  { label: '📖 About Overview & Legacy', href: '/admin/about-page' },
  { label: "📖 Principal's Desk", href: '/admin/about-page/principal' },
  { label: '📖 Governing Body & Council', href: '/admin/about-page/governing-body' },
  { label: '📖 IQAC Cell & NAAC', href: '/admin/about-page/iqac' },
  { label: '🎓 Courses & Programs', href: '/admin/courses' },
  { label: '🎓 Departments & HODs', href: '/admin/departments' },
  { label: '🎓 Faculty Directory', href: '/admin/faculty' },
  { label: '📌 Notices & Circulars', href: '/admin/notices' },
  { label: '📰 News & Press', href: '/admin/news' },
  { label: '📅 Campus Events', href: '/admin/events' },
  { label: '🖼️ Photo Gallery Albums', href: '/admin/gallery' },
  { label: '📥 Document Downloads', href: '/admin/downloads' },
  { label: '📝 Admissions Page', href: '/admin/admissions-config' },
  { label: '📞 Contact Us Page', href: '/admin/contact-page' },
  { label: '🧭 Drag & Drop Menu Manager', href: '/admin/navigation' },
  { label: '⚙️ Site Branding & Settings', href: '/admin/settings' },
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
