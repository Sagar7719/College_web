'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationService } from '@/services/navigation.service';
import { NavigationItem } from '@/types';
import styles from './layout.module.css';
import { MobileDrawer } from './MobileDrawer';

const defaultFallbackNav: NavigationItem[] = [
  { id: 'nav_home', label: 'Home', path: '/', isCMSPage: false, order: 0, visible: true },
  { id: 'nav_about', label: 'About Us', path: '/about', isCMSPage: false, order: 1, visible: true },
  { id: 'nav_academics', label: 'Academics', path: '/departments', isCMSPage: false, order: 2, visible: true },
  { id: 'nav_admissions', label: 'Admissions', path: '/admissions', isCMSPage: false, order: 3, visible: true },
  { id: 'nav_notices', label: 'Notices', path: '/notices', isCMSPage: false, order: 4, visible: true },
  { id: 'nav_contact', label: 'Contact Us', path: '/contact', isCMSPage: false, order: 5, visible: true },
];

export const Navbar: React.FC = () => {
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let alive = true;
    navigationService.getNavigationItems()
      .then((items) => {
        if (alive) {
          if (items && items.length > 0) {
            setNavItems(items);
          } else {
            setNavItems(defaultFallbackNav);
          }
        }
      })
      .catch(() => {
        if (alive) {
          setNavItems(defaultFallbackNav);
        }
      });
    return () => { alive = false; };
  }, []);

  return (
    <>
      <nav className={styles.navbar} aria-label="Main Navigation">
        <div className="container">
          <div className={styles.navContainer}>
            <ul className={styles.navList}>
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <li key={item.id}>
                    {item.isExternal ? (
                      <a
                        href={item.externalUrl || item.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.navItemLink}
                      >
                        {item.label} ↗
                      </a>
                    ) : (
                      <Link
                        href={item.path}
                        className={`${styles.navItemLink} ${isActive ? styles.navItemActive : ''}`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>

            <button
              className={styles.mobileToggleBtn}
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open mobile navigation menu"
            >
              ☰
            </button>
          </div>
        </div>
      </nav>

      <MobileDrawer
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        navItems={navItems}
        pathname={pathname}
      />
    </>
  );
};
