'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { NavigationItem } from '@/types';
import styles from './layout.module.css';

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavigationItem[];
  pathname: string;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  navItems,
  pathname,
}) => {
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
      <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <span className={styles.drawerTitle}>Navigation Menu</span>
          <button
            onClick={onClose}
            className={styles.drawerCloseBtn}
            aria-label="Close mobile navigation"
          >
            ✕
          </button>
        </div>
        <div className={styles.drawerBody}>
          <ul className={styles.drawerNavList}>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.id}>
                  {item.isExternal ? (
                    <a
                      href={item.externalUrl || item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.drawerNavLink}
                      onClick={onClose}
                    >
                      {item.label} ↗
                    </a>
                  ) : (
                    <Link
                      href={item.path}
                      className={styles.drawerNavLink}
                      style={{
                        fontWeight: isActive ? 700 : 500,
                        backgroundColor: isActive ? 'var(--bg-light)' : 'transparent',
                      }}
                      onClick={onClose}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
