'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { NavigationItem } from '@/types';
import styles from './layout.module.css';

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavigationItem[];
  pathname: string;
}

function getItemPath(item: NavigationItem): string {
  if (item.path && item.path !== '#' && item.path.trim() !== '') {
    return item.path;
  }
  const labelLower = (item.label || '').toLowerCase();
  const keyLower = (item.systemKey || '').toLowerCase();
  const idLower = (item.id || '').toLowerCase();

  if (keyLower === 'about' || idLower.includes('about') || labelLower.includes('about')) {
    return '/about';
  }
  if (keyLower === 'academics' || idLower.includes('academics') || labelLower.includes('course') || labelLower.includes('department')) {
    return '/departments';
  }
  if (keyLower === 'admissions' || idLower.includes('admissions') || labelLower.includes('admission')) {
    return '/admissions';
  }
  if (keyLower === 'notices' || idLower.includes('notices') || labelLower.includes('notice') || labelLower.includes('circular')) {
    return '/notices';
  }
  if (keyLower === 'contact' || idLower.includes('contact') || labelLower.includes('contact')) {
    return '/contact';
  }
  return '/';
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  navItems,
  pathname,
}) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Focus trapping system
  useEffect(() => {
    if (!isOpen) return;

    const focusableElements = drawerRef.current?.querySelectorAll(
      'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    setTimeout(() => {
      firstElement.focus();
    }, 50);

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleTabKey);
    return () => {
      window.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);

  const toggleAccordion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className={styles.drawerOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
    >
      <div
        ref={drawerRef}
        className={styles.drawerContent}
        onClick={(e) => e.stopPropagation()}
      >
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
              const targetPath = getItemPath(item);
              const hasChildren = Boolean(item.children && item.children.length > 0);
              const isExpanded = Boolean(expandedItems[item.id]);
              const isChildActive = Boolean(hasChildren && item.children?.some((child) => pathname === child.path));
              const isSelfActive = pathname === targetPath;
              const isActive = isSelfActive || isChildActive;

              if (hasChildren) {
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={(e) => toggleAccordion(item.id, e)}
                      className={`${styles.drawerAccordionToggle} ${isActive ? styles.drawerNavLinkActive : ''}`}
                      aria-expanded={isExpanded}
                    >
                      <span>{item.label}</span>
                      <span className={`${styles.dropdownArrow} ${isExpanded ? styles.dropdownArrowOpen : ''}`}>
                        ▼
                      </span>
                    </button>

                    {isExpanded && (
                      <ul className={styles.drawerSubNavList}>
                        {targetPath && targetPath !== '#' && (
                          <li>
                            <Link
                              href={targetPath}
                              className={`${styles.drawerSubNavLink} ${isSelfActive ? styles.drawerSubNavLinkActive : ''}`}
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
                                  className={`${styles.drawerSubNavLink} ${isSubActive ? styles.drawerSubNavLinkActive : ''}`}
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
                      className={`${styles.drawerNavLink} ${isActive ? styles.drawerNavLinkActive : ''}`}
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

        <div className={styles.drawerFooter}>
          <Link href="/admissions" className={styles.drawerCtaBtn} onClick={onClose}>
            Apply Now →
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
};
