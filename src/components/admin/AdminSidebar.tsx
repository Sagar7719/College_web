'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './admin.module.css';

interface NavSubItem {
  label: string;
  href: string;
  icon?: string;
}

interface NavItem {
  label: string;
  href?: string;
  icon: string;
  subItems?: NavSubItem[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const websiteMatchedNavGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', href: '/admin/dashboard', icon: '📊' }],
  },
  {
    label: 'Website Menu Pages (Non-Tech CMS)',
    items: [
      { label: '🏠 Home Page', href: '/admin/homepage', icon: '🏠' },
      {
        label: '📖 About Us',
        icon: '📖',
        subItems: [
          { label: 'About Overview & Legacy', href: '/admin/about-page' },
          { label: "Principal's Desk Message", href: '/admin/about-page/principal' },
          { label: 'Governing Body & Council', href: '/admin/about-page/governing-body' },
          { label: 'IQAC Cell & NAAC', href: '/admin/about-page/iqac' },
        ],
      },
      {
        label: '🎓 Academics',
        icon: '🎓',
        subItems: [
          { label: 'Courses & Degree Programs', href: '/admin/courses' },
          { label: 'Departments & HODs', href: '/admin/departments' },
          { label: 'Faculty Directory', href: '/admin/faculty' },
        ],
      },
      {
        label: '📌 Notices & Updates',
        icon: '📌',
        subItems: [
          { label: 'Official Notices & Circulars', href: '/admin/notices' },
          { label: 'News & Press Releases', href: '/admin/news' },
          { label: 'Campus Events Calendar', href: '/admin/events' },
        ],
      },
      {
        label: '🖼️ Media & Downloads',
        icon: '🖼️',
        subItems: [
          { label: 'Photo Gallery Albums', href: '/admin/gallery' },
          { label: 'Document Downloads', href: '/admin/downloads' },
          { label: 'Media Asset Library', href: '/admin/media' },
        ],
      },
      { label: '🎓 Admissions Page', href: '/admin/admissions-config', icon: '📝' },
      { label: '📞 Contact Us Page', href: '/admin/contact-page', icon: '📞' },
    ],
  },
  {
    label: 'Menu Builder & Settings',
    items: [
      { label: '🧭 Drag & Drop Menu Manager', href: '/admin/navigation', icon: '🧭' },
      { label: '📄 Custom CMS Pages', href: '/admin/pages', icon: '📄' },
      { label: '🦶 Footer Links Editor', href: '/admin/footer', icon: '🦶' },
      { label: '⚙️ Site Branding & Logo', href: '/admin/settings', icon: '⚙️' },
      { label: '✉️ Form Inquiries', href: '/admin/contact-messages', icon: '✉️' },
    ],
  },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'A';

  // Open state for accordion submenus
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    '📖 About Us': true,
    '🎓 Academics': true,
    '📌 Notices & Updates': true,
    '🖼️ Media & Downloads': true,
  });

  const toggleSubMenu = (label: string) => {
    setOpenSubMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

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
        {websiteMatchedNavGroups.map((group, idx) => (
          <div key={idx} className={styles.navGroup}>
            <div className={styles.navGroupLabel} style={{ color: '#A09A90', fontWeight: 800 }}>
              {group.label}
            </div>
            <ul className={styles.sidebarList}>
              {group.items.map((item) => {
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isSubMenuOpen = openSubMenus[item.label] ?? false;
                const isDirectActive = item.href ? pathname === item.href : false;
                const isChildActive = hasSubItems && item.subItems?.some((sub) => pathname === sub.href);

                if (hasSubItems) {
                  return (
                    <li key={item.label} className={styles.sidebarListItem} style={{ marginBottom: 4 }}>
                      <button
                        type="button"
                        onClick={() => toggleSubMenu(item.label)}
                        className={`${styles.sidebarLink} ${isChildActive ? styles.sidebarLinkActive : ''}`}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: isChildActive ? 'rgba(200, 90, 50, 0.22)' : 'transparent',
                          color: isChildActive ? '#FFAA8A' : '#E2DFD8',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className={styles.sidebarLinkIcon}>{item.icon}</span>
                          <span style={{ fontWeight: 700, color: isChildActive ? '#FFAA8A' : '#E2DFD8' }}>
                            {item.label}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', opacity: 0.8, color: '#E2DFD8' }}>
                          {isSubMenuOpen ? '▲' : '▼'}
                        </span>
                      </button>

                      {isSubMenuOpen && item.subItems && (
                        <ul
                          style={{
                            listStyle: 'none',
                            paddingLeft: 28,
                            marginTop: 4,
                            marginBottom: 6,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                          }}
                        >
                          {item.subItems.map((sub) => {
                            const isSubActive = pathname === sub.href;
                            return (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  style={{
                                    display: 'block',
                                    fontSize: '0.8125rem',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    color: isSubActive ? '#FFAA8A' : 'rgba(226, 223, 216, 0.85)',
                                    fontWeight: isSubActive ? 800 : 600,
                                    backgroundColor: isSubActive ? 'rgba(200, 90, 50, 0.22)' : 'transparent',
                                    borderLeft: isSubActive ? '3px solid #C85A32' : '3px solid transparent',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  {sub.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={item.href || item.label} className={styles.sidebarListItem}>
                    <Link
                      href={item.href || '#'}
                      className={`${styles.sidebarLink} ${isDirectActive ? styles.sidebarLinkActive : ''}`}
                      style={{ color: isDirectActive ? '#FFAA8A' : '#E2DFD8' }}
                    >
                      <span className={styles.sidebarLinkIcon}>{item.icon}</span>
                      <span style={{ color: isDirectActive ? '#FFAA8A' : '#E2DFD8', fontWeight: isDirectActive ? 800 : 600 }}>
                        {item.label}
                      </span>
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
