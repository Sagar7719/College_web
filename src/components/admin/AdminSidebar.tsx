'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './admin.module.css';

interface NavSubItem {
  label: string;
  href: string;
  badge?: string;
}

interface NavItem {
  label: string;
  href?: string;
  icon: string;
  badge?: string;
  subItems?: NavSubItem[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const enterpriseNavGroups: NavGroup[] = [
  {
    label: 'MAIN CONSOLE',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' }
    ],
  },
  {
    label: 'WEBSITE MENU PAGES (NON-TECH CMS)',
    items: [
      { label: 'Home Page Editor', href: '/admin/homepage', icon: '🏠' },
      {
        label: 'About Us Section',
        icon: '📖',
        subItems: [
          { label: 'Overview & Legacy', href: '/admin/about-page' },
          { label: "Principal's Desk Message", href: '/admin/about-page/principal' },
          { label: 'Governing Body & Council', href: '/admin/about-page/governing-body' },
          { label: 'IQAC Cell & NAAC Grade', href: '/admin/about-page/iqac' },
        ],
      },
      {
        label: 'Academics Section',
        icon: '🎓',
        subItems: [
          { label: 'Courses & Degree Programs', href: '/admin/courses' },
          { label: 'Departments & HODs', href: '/admin/departments' },
          { label: 'Faculty Directory', href: '/admin/faculty' },
        ],
      },
      {
        label: 'Notices & Updates',
        icon: '📌',
        subItems: [
          { label: 'Official Notices & Circulars', href: '/admin/notices' },
          { label: 'News & Press Releases', href: '/admin/news' },
          { label: 'Campus Events Calendar', href: '/admin/events' },
        ],
      },
      {
        label: 'Media & Downloads',
        icon: '🖼️',
        subItems: [
          { label: 'Photo Gallery Albums', href: '/admin/gallery' },
          { label: 'Document Downloads', href: '/admin/downloads' },
          { label: 'Media Asset Library', href: '/admin/media' },
        ],
      },
      { label: 'Admissions Page', href: '/admin/admissions-config', icon: '📝' },
      { label: 'Contact Us Page', href: '/admin/contact-page', icon: '📞' },
    ],
  },
  {
    label: 'MENU BUILDER & TOOLS',
    items: [
      { label: 'Drag & Drop Menu Manager', href: '/admin/navigation', icon: '🧭', badge: 'Interactive' },
      { label: 'Custom CMS Pages', href: '/admin/pages', icon: '📄' },
      { label: 'Data Backup & Restore', href: '/admin/backup', icon: '📦', badge: '1-Click' },
      { label: 'Footer Links Editor', href: '/admin/footer', icon: '🦶' },
      { label: 'Site Branding & Logo', href: '/admin/settings', icon: '⚙️' },
      { label: 'Contact Inquiries', href: '/admin/contact-messages', icon: '✉️' },
    ],
  },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'A';

  // Open state for accordion submenus
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    'About Us Section': true,
    'Academics Section': true,
    'Notices & Updates': true,
    'Media & Downloads': true,
  });

  const toggleSubMenu = (label: string) => {
    setOpenSubMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className={styles.sidebar}>
      {/* Executive Glassmorphic Header */}
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarBrandBadge}>🎓</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className={styles.sidebarTitle}>College CMS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 8px #4ADE80' }}></span>
            <span className={styles.sidebarSubTitle} style={{ margin: 0, color: '#4ADE80' }}>
              Firestore Live
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Body */}
      <div className={styles.sidebarBody}>
        {enterpriseNavGroups.map((group, idx) => (
          <div key={idx} className={styles.navGroup}>
            <div className={styles.navGroupLabel}>
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
                          background: isChildActive ? 'linear-gradient(90deg, rgba(200, 90, 50, 0.28) 0%, rgba(200, 90, 50, 0.08) 100%)' : 'transparent',
                          color: isChildActive ? '#FFAA8A' : '#F5F0E8',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          padding: '0.625rem 0.875rem',
                          borderRadius: '8px',
                          borderLeft: isChildActive ? '3px solid #C85A32' : '3px solid transparent',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <span className={styles.sidebarLinkIcon}>{item.icon}</span>
                          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: isChildActive ? '#FFAA8A' : '#F5F0E8' }}>
                            {item.label}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {item.badge && (
                            <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#FFAA8A', background: 'rgba(200, 90, 50, 0.25)', padding: '2px 6px', borderRadius: '4px' }}>
                              {item.badge}
                            </span>
                          )}
                          <span style={{ fontSize: '0.75rem', color: isChildActive ? '#FFAA8A' : 'rgba(245, 240, 232, 0.6)' }}>
                            {isSubMenuOpen ? '▲' : '▼'}
                          </span>
                        </div>
                      </button>

                      {isSubMenuOpen && item.subItems && (
                        <ul
                          style={{
                            listStyle: 'none',
                            paddingLeft: 22,
                            marginTop: 4,
                            marginBottom: 6,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                            borderLeft: '1px dashed rgba(255, 255, 255, 0.15)',
                            marginLeft: 18,
                          }}
                        >
                          {item.subItems.map((sub) => {
                            const isSubActive = pathname === sub.href;
                            return (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    fontSize: '0.8125rem',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    color: isSubActive ? '#FFAA8A' : 'rgba(245, 240, 232, 0.85)',
                                    fontWeight: isSubActive ? 800 : 600,
                                    backgroundColor: isSubActive ? 'rgba(200, 90, 50, 0.22)' : 'transparent',
                                    borderLeft: isSubActive ? '3px solid #C85A32' : '3px solid transparent',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  <span>{sub.label}</span>
                                  {sub.badge && (
                                    <span style={{ fontSize: '0.625rem', padding: '1px 5px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF' }}>
                                      {sub.badge}
                                    </span>
                                  )}
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
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: isDirectActive ? '#FFAA8A' : '#F5F0E8',
                        background: isDirectActive ? 'linear-gradient(90deg, rgba(200, 90, 50, 0.28) 0%, rgba(200, 90, 50, 0.08) 100%)' : 'transparent',
                        borderLeft: isDirectActive ? '3px solid #C85A32' : '3px solid transparent',
                        borderRadius: '8px',
                        padding: '0.625rem 0.875rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className={styles.sidebarLinkIcon}>{item.icon}</span>
                        <span style={{ color: isDirectActive ? '#FFAA8A' : '#F5F0E8', fontWeight: isDirectActive ? 800 : 600, fontSize: '0.875rem' }}>
                          {item.label}
                        </span>
                      </div>
                      {item.badge && (
                        <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#4ADE80', background: 'rgba(74, 222, 128, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                          {item.badge}
                        </span>
                      )}
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
