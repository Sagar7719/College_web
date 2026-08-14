'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Compass,
  Home,
  BookOpen,
  GraduationCap,
  Bell,
  Image as ImageIcon,
  FileSignature,
  PhoneCall,
  FileText,
  Database,
  PanelBottom,
  Settings,
  Mail,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Search,
  X,
  LogOut,
  ShieldCheck,
  GraduationCap as CollegeIcon,
} from 'lucide-react';
import styles from './admin.module.css';

interface NavSubItem {
  label: string;
  href: string;
  badge?: string;
}

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
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
      { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={18} /> }
    ],
  },
  {
    label: 'WEBSITE STRUCTURE & PAGES',
    items: [
      { label: 'Drag & Drop Menu Manager', href: '/admin/navigation', icon: <Compass size={18} />, badge: 'Interactive' },
      { label: 'Home Page Editor', href: '/admin/homepage', icon: <Home size={18} /> },
      {
        label: 'About Us Section',
        icon: <BookOpen size={18} />,
        subItems: [
          { label: 'Overview & Legacy', href: '/admin/about-page' },
          { label: "Principal's Desk Message", href: '/admin/about-page/principal' },
          { label: 'Governing Body & Council', href: '/admin/about-page/governing-body' },
          { label: 'IQAC Cell & NAAC Grade', href: '/admin/about-page/iqac' },
        ],
      },
      {
        label: 'Academics Section',
        icon: <GraduationCap size={18} />,
        subItems: [
          { label: 'Courses & Degree Programs', href: '/admin/courses' },
          { label: 'Departments & HODs', href: '/admin/departments' },
          { label: 'Faculty Directory', href: '/admin/faculty' },
        ],
      },
      {
        label: 'Notices & Updates',
        icon: <Bell size={18} />,
        subItems: [
          { label: 'Official Notices & Circulars', href: '/admin/notices' },
          { label: 'News & Press Releases', href: '/admin/news' },
          { label: 'Campus Events Calendar', href: '/admin/events' },
        ],
      },
      {
        label: 'Media & Downloads',
        icon: <ImageIcon size={18} />,
        subItems: [
          { label: 'Photo Gallery Albums', href: '/admin/gallery' },
          { label: 'Document Downloads', href: '/admin/downloads' },
          { label: 'Media Asset Library', href: '/admin/media' },
        ],
      },
      { label: 'Admissions Page', href: '/admin/admissions-config', icon: <FileSignature size={18} /> },
      { label: 'Contact Us Page', href: '/admin/contact-page', icon: <PhoneCall size={18} /> },
    ],
  },
  {
    label: 'SYSTEM & DATA ENGINE',
    items: [
      { label: 'Custom CMS Pages', href: '/admin/pages', icon: <FileText size={18} /> },
      { label: 'Data Backup & Restore', href: '/admin/backup', icon: <Database size={18} />, badge: '1-Click' },
      { label: 'Footer Links Editor', href: '/admin/footer', icon: <PanelBottom size={18} /> },
      { label: 'Site Branding & Logo', href: '/admin/settings', icon: <Settings size={18} /> },
      { label: 'Contact Inquiries', href: '/admin/contact-messages', icon: <Mail size={18} /> },
    ],
  },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'A';

  // Sidebar Collapse state (Persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Search Filter Query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Open state for accordion submenus
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    'About Us Section': true,
    'Academics Section': true,
    'Notices & Updates': true,
    'Media & Downloads': true,
  });

  useEffect(() => {
    const savedCollapse = localStorage.getItem('admin_sidebar_collapsed');
    if (savedCollapse !== null) {
      setIsCollapsed(savedCollapse === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('admin_sidebar_collapsed', String(nextState));
  };

  const toggleSubMenu = (label: string) => {
    if (isCollapsed) setIsCollapsed(false);
    setOpenSubMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Filter items based on searchQuery
  const filteredNavGroups = searchQuery.trim()
    ? enterpriseNavGroups.map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          const matchMain = item.label.toLowerCase().includes(searchQuery.toLowerCase());
          const matchSub = item.subItems?.some((sub) => sub.label.toLowerCase().includes(searchQuery.toLowerCase()));
          return matchMain || matchSub;
        }),
      })).filter((group) => group.items.length > 0)
    : enterpriseNavGroups;

  return (
    <aside
      className={styles.sidebar}
      style={{
        width: isCollapsed ? '76px' : '280px',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Executive Glassmorphic Header */}
      <div
        className={styles.sidebarHeader}
        style={{
          padding: isCollapsed ? '1rem 0.75rem' : '1.25rem 1.25rem 1rem',
          justifyContent: isCollapsed ? 'center' : 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div className={styles.sidebarBrandBadge}>
            <CollegeIcon size={22} />
          </div>
          {!isCollapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className={styles.sidebarTitle}>College CMS</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 8px #4ADE80' }}></span>
                <span className={styles.sidebarSubTitle} style={{ margin: 0, color: '#4ADE80' }}>
                  Firestore Live
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Collapse Toggle Button */}
        <button
          type="button"
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#FFAA8A',
            borderRadius: '8px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Quick Search Filter (Expanded Mode) */}
      {!isCollapsed && (
        <div style={{ padding: '0.75rem 1.25rem 0.25rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }} />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px 7px 30px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                fontSize: '0.8125rem',
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation Body */}
      <div className={styles.sidebarBody}>
        {filteredNavGroups.map((group, idx) => (
          <div key={idx} className={styles.navGroup}>
            {!isCollapsed && (
              <div className={styles.navGroupLabel}>
                {group.label}
              </div>
            )}
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
                        title={isCollapsed ? item.label : undefined}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: isCollapsed ? 'center' : 'space-between',
                          background: isChildActive ? 'linear-gradient(90deg, rgba(200, 90, 50, 0.28) 0%, rgba(200, 90, 50, 0.08) 100%)' : 'transparent',
                          color: isChildActive ? '#FFAA8A' : '#F5F0E8',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          padding: isCollapsed ? '0.625rem 0' : '0.625rem 0.875rem',
                          borderRadius: '8px',
                          borderLeft: isChildActive ? '3.5px solid #C85A32' : '3.5px solid transparent',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <span className={styles.sidebarLinkIcon}>{item.icon}</span>
                          {!isCollapsed && (
                            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: isChildActive ? '#FFAA8A' : '#F5F0E8' }}>
                              {item.label}
                            </span>
                          )}
                        </div>
                        {!isCollapsed && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {item.badge && (
                              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#FFAA8A', background: 'rgba(200, 90, 50, 0.25)', padding: '2px 6px', borderRadius: '4px' }}>
                                {item.badge}
                              </span>
                            )}
                            <span style={{ fontSize: '0.75rem', color: isChildActive ? '#FFAA8A' : 'rgba(245, 240, 232, 0.6)' }}>
                              {isSubMenuOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </span>
                          </div>
                        )}
                      </button>

                      {!isCollapsed && isSubMenuOpen && item.subItems && (
                        <ul
                          style={{
                            listStyle: 'none',
                            paddingLeft: 22,
                            marginTop: 4,
                            marginBottom: 6,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                            borderLeft: '1px dashed rgba(255, 255, 255, 0.18)',
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
                      title={isCollapsed ? item.label : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCollapsed ? 'center' : 'space-between',
                        color: isDirectActive ? '#FFAA8A' : '#F5F0E8',
                        background: isDirectActive ? 'linear-gradient(90deg, rgba(200, 90, 50, 0.28) 0%, rgba(200, 90, 50, 0.08) 100%)' : 'transparent',
                        borderLeft: isDirectActive ? '3.5px solid #C85A32' : '3.5px solid transparent',
                        borderRadius: '8px',
                        padding: isCollapsed ? '0.625rem 0' : '0.625rem 0.875rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className={styles.sidebarLinkIcon}>{item.icon}</span>
                        {!isCollapsed && (
                          <span style={{ color: isDirectActive ? '#FFAA8A' : '#F5F0E8', fontWeight: isDirectActive ? 800 : 600, fontSize: '0.875rem' }}>
                            {item.label}
                          </span>
                        )}
                      </div>
                      {!isCollapsed && item.badge && (
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

      {/* User Status & Sign Out Footer */}
      <div
        className={styles.sidebarFooter}
        style={{
          padding: isCollapsed ? '0.875rem 0.5rem' : '0.875rem 1rem',
          flexDirection: isCollapsed ? 'column' : 'row',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          alignItems: 'center',
          gap: isCollapsed ? 8 : 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div className={styles.sidebarUserAvatar}>{userInitial}</div>
          {!isCollapsed && (
            <div className={styles.sidebarUserInfo}>
              <div className={styles.sidebarUserName}>{user?.email || 'Administrator'}</div>
              <div className={styles.sidebarUserStatus} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck size={12} color="#4ADE80" />
                <span>Super Admin</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Logout Button */}
        <button
          type="button"
          onClick={() => logout()}
          title="Sign Out of Admin Console"
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#F87171',
            borderRadius: '6px',
            padding: isCollapsed ? '6px' : '5px 10px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s ease',
          }}
        >
          <LogOut size={14} />
          {!isCollapsed && <span>Exit</span>}
        </button>
      </div>
    </aside>
  );
};
