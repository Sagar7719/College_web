'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  GraduationCap as CollegeIcon,
  ChevronDown,
  ChevronRight,
  LogOut,
  ShieldCheck,
  X,
} from 'lucide-react';
import { enterpriseNavGroups } from './AdminSidebar';
import styles from './admin.module.css';

export interface AdminMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminMobileDrawer: React.FC<AdminMobileDrawerProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'A';

  // Submenu open states
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    'About Us Section': true,
    'Academics Section': true,
    'Notices & Updates': true,
    'Media & Downloads': true,
  });

  const toggleSubMenu = (label: string) => {
    setOpenSubMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

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
      <div
        className={styles.drawerContainer}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brand Header with Close Button */}
        <div className={styles.sidebarHeader} style={{ padding: '1rem 1.25rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div className={styles.sidebarBrandBadge}>
              <CollegeIcon size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div className={styles.sidebarTitle} style={{ fontSize: '1rem' }}>College CMS</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#15803D' }}></span>
                <span className={styles.sidebarSubTitle} style={{ margin: 0 }}>
                  Firestore Live
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation drawer"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5DDD2',
              color: '#78716C',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className={styles.sidebarBody} style={{ padding: '0.75rem 0' }}>
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
                            background: isChildActive ? '#EFE2D6' : 'transparent',
                            color: isChildActive ? '#B4532A' : '#292524',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            padding: '0.625rem 0.875rem',
                            borderRadius: '8px',
                            borderLeft: isChildActive ? '3.5px solid #B4532A' : '3.5px solid transparent',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                            <span className={styles.sidebarLinkIcon} style={{ color: isChildActive ? '#B4532A' : '#78716C' }}>
                              {item.icon}
                            </span>
                            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: isChildActive ? '#B4532A' : '#292524' }}>
                              {item.label}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {item.badge && (
                              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#15803D', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
                                {item.badge}
                              </span>
                            )}
                            <span style={{ fontSize: '0.75rem', color: isChildActive ? '#B4532A' : '#78716C' }}>
                              {isSubMenuOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </span>
                          </div>
                        </button>

                        {isSubMenuOpen && item.subItems && (
                          <ul
                            style={{
                              listStyle: 'none',
                              paddingLeft: 20,
                              marginTop: 4,
                              marginBottom: 6,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 3,
                              borderLeft: '1px dashed #D6CEC5',
                              marginLeft: 18,
                            }}
                          >
                            {item.subItems.map((sub) => {
                              const isSubActive = pathname === sub.href;
                              return (
                                <li key={sub.href}>
                                  <Link
                                    href={sub.href}
                                    onClick={onClose}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      fontSize: '0.8125rem',
                                      padding: '6px 12px',
                                      borderRadius: '6px',
                                      color: isSubActive ? '#B4532A' : '#78716C',
                                      fontWeight: isSubActive ? 800 : 600,
                                      backgroundColor: isSubActive ? '#EFE2D6' : 'transparent',
                                      borderLeft: isSubActive ? '3px solid #B4532A' : '3px solid transparent',
                                      textDecoration: 'none',
                                    }}
                                  >
                                    <span>{sub.label}</span>
                                    {sub.badge && (
                                      <span style={{ fontSize: '0.625rem', padding: '1px 5px', borderRadius: '3px', background: '#DCFCE7', color: '#15803D' }}>
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
                        onClick={onClose}
                        className={`${styles.sidebarLink} ${isDirectActive ? styles.sidebarLinkActive : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          color: isDirectActive ? '#B4532A' : '#292524',
                          background: isDirectActive ? '#EFE2D6' : 'transparent',
                          borderLeft: isDirectActive ? '3.5px solid #B4532A' : '3.5px solid transparent',
                          borderRadius: '8px',
                          padding: '0.625rem 0.875rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className={styles.sidebarLinkIcon} style={{ color: isDirectActive ? '#B4532A' : '#78716C' }}>
                            {item.icon}
                          </span>
                          <span style={{ color: isDirectActive ? '#B4532A' : '#292524', fontWeight: isDirectActive ? 800 : 600, fontSize: '0.875rem' }}>
                            {item.label}
                          </span>
                        </div>
                        {item.badge && (
                          <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#15803D', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
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
        <div className={styles.sidebarFooter}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
            <div className={styles.sidebarUserAvatar} style={{ background: '#78716C', color: '#FFFFFF' }}>
              {userInitial}
            </div>
            <div className={styles.sidebarUserInfo}>
              <div className={styles.sidebarUserName} style={{ color: '#292524' }}>
                {user?.email || 'Administrator'}
              </div>
              <div className={styles.sidebarUserStatus} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck size={12} color="#15803D" />
                <span>Super Admin</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            title="Sign Out of Admin Console"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5DDD2',
              color: '#B4532A',
              borderRadius: '6px',
              padding: '5px 10px',
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
            <span>Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
