'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationService } from '@/services/navigation.service';
import { NavigationItem } from '@/types';
import styles from './layout.module.css';
import { MobileDrawer } from './MobileDrawer';

const defaultFallbackNav: NavigationItem[] = [
  { id: 'nav_sys_home', label: 'Home', path: '/', isCMSPage: true, isSystemPage: true, systemKey: 'home', order: 0, visible: true },
  { id: 'nav_sys_about', label: 'About Us', path: '/about', isCMSPage: true, isSystemPage: true, systemKey: 'about', order: 1, visible: true },
  { id: 'nav_sys_academics', label: 'Academics', path: '/departments', isCMSPage: true, isSystemPage: true, systemKey: 'academics', order: 2, visible: true },
  { id: 'nav_sys_admissions', label: 'Admissions', path: '/admissions', isCMSPage: true, isSystemPage: true, systemKey: 'admissions', order: 3, visible: true },
  { id: 'nav_sys_notices', label: 'Notices', path: '/notices', isCMSPage: true, isSystemPage: true, systemKey: 'notices', order: 4, visible: true },
  { id: 'nav_sys_contact', label: 'Contact Us', path: '/contact', isCMSPage: true, isSystemPage: true, systemKey: 'contact', order: 5, visible: true },
];

export interface NavbarProps {
  initialNavItems?: NavigationItem[];
}

export const Navbar: React.FC<NavbarProps> = ({ initialNavItems }) => {
  const [navItems, setNavItems] = useState<NavigationItem[]>(
    initialNavItems && initialNavItems.length > 0 ? initialNavItems : defaultFallbackNav
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (initialNavItems && initialNavItems.length > 0) {
      setNavItems(initialNavItems);
      return;
    }
    let alive = true;
    navigationService.getNavigationItems()
      .then((items) => {
        if (alive && items && items.length > 0) {
          setNavItems(items);
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [initialNavItems]);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close open dropdown on route change
  useEffect(() => {
    setOpenDropdownId(null);
  }, [pathname]);

  return (
    <>
      <nav className={styles.navbar} aria-label="Main Navigation">
        <div className="container" ref={navRef}>
          <div className={styles.navContainer}>
            <ul className={styles.navList}>
              {navItems.map((item) => {
                const hasChildren = Boolean(item.children && item.children.length > 0);
                const isChildActive = Boolean(hasChildren && item.children?.some((child) => pathname === child.path));
                const isSelfActive = pathname === item.path;
                const isActive = isSelfActive || isChildActive;
                const isDropdownOpen = openDropdownId === item.id;

                if (hasChildren) {
                  return (
                    <li
                      key={item.id}
                      className={styles.navDropdownWrapper}
                      onMouseEnter={() => setOpenDropdownId(item.id)}
                      onMouseLeave={() => setOpenDropdownId(null)}
                    >
                      {item.isExternal ? (
                        <a
                          href={item.externalUrl || item.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${styles.navItemLink} ${styles.navItemWithDropdown} ${isActive ? styles.navItemActive : ''}`}
                          onClick={() => setOpenDropdownId(null)}
                        >
                          {item.label}
                          <span
                            className={`${styles.dropdownArrow} ${isDropdownOpen ? styles.dropdownArrowOpen : ''}`}
                          >
                            ▼
                          </span>
                        </a>
                      ) : (
                        <Link
                          href={item.path}
                          className={`${styles.navItemLink} ${styles.navItemWithDropdown} ${isActive ? styles.navItemActive : ''}`}
                          onClick={() => setOpenDropdownId(null)}
                        >
                          {item.label}
                          <span
                            className={`${styles.dropdownArrow} ${isDropdownOpen ? styles.dropdownArrowOpen : ''}`}
                          >
                            ▼
                          </span>
                        </Link>
                      )}

                      {isDropdownOpen && (
                        <ul className={styles.dropdownMenu} role="menu">
                          {item.path && item.path !== '#' && (
                            <li role="none">
                              <Link
                                href={item.path}
                                role="menuitem"
                                className={`${styles.dropdownItemLink} ${isSelfActive ? styles.dropdownItemActive : ''}`}
                                onClick={() => setOpenDropdownId(null)}
                              >
                                Overview ({item.label})
                              </Link>
                            </li>
                          )}
                          {item.children?.map((child) => {
                            const isSubActive = pathname === child.path;
                            return (
                              <li key={child.id} role="none">
                                {child.isExternal ? (
                                  <a
                                    href={child.externalUrl || child.path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    role="menuitem"
                                    className={styles.dropdownItemLink}
                                    onClick={() => setOpenDropdownId(null)}
                                  >
                                    {child.label} ↗
                                  </a>
                                ) : (
                                  <Link
                                    href={child.path}
                                    role="menuitem"
                                    className={`${styles.dropdownItemLink} ${isSubActive ? styles.dropdownItemActive : ''}`}
                                    onClick={() => setOpenDropdownId(null)}
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
