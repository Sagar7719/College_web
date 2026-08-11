'use client';

import React, { useState, useEffect } from 'react';
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
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

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

  const toggleAccordion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
              const hasChildren = Boolean(item.children && item.children.length > 0);
              const isExpanded = Boolean(expandedItems[item.id]);
              const isChildActive = Boolean(hasChildren && item.children?.some((child) => pathname === child.path));
              const isSelfActive = pathname === item.path;
              const isActive = isSelfActive || isChildActive;

              if (hasChildren) {
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={(e) => toggleAccordion(item.id, e)}
                      className={styles.drawerAccordionToggle}
                      aria-expanded={isExpanded}
                    >
                      <span>{item.label}</span>
                      <span className={`${styles.dropdownArrow} ${isExpanded ? styles.dropdownArrowOpen : ''}`}>
                        ▼
                      </span>
                    </button>

                    {isExpanded && (
                      <ul className={styles.drawerSubNavList}>
                        {item.path && item.path !== '#' && (
                          <li>
                            <Link
                              href={item.path}
                              className={styles.drawerSubNavLink}
                              style={{
                                fontWeight: isSelfActive ? 700 : 500,
                              }}
                              onClick={onClose}
                            >
                              Overview ({item.label})
                            </Link>
                          </li>
                        )}
                        {item.children?.map((child) => {
                          const isSubActive = pathname === child.path;
                          return (
                            <li key={child.id}>
                              {child.isExternal ? (
                                <a
                                  href={child.externalUrl || child.path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.drawerSubNavLink}
                                  onClick={onClose}
                                >
                                  {child.label} ↗
                                </a>
                              ) : (
                                <Link
                                  href={child.path}
                                  className={styles.drawerSubNavLink}
                                  style={{
                                    fontWeight: isSubActive ? 700 : 500,
                                  }}
                                  onClick={onClose}
                                >
                                  {child.label}
                                </Link>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }

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
