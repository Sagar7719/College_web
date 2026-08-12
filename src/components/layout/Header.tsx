'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteSettingsService, defaultSettings } from '@/services/site-settings.service';
import { navigationService } from '@/services/navigation.service';
import { SiteSettings, NavigationItem } from '@/types';
import { Menu } from 'lucide-react';
import styles from './layout.module.css';
import { MobileDrawer } from './MobileDrawer';

const defaultFallbackNav: NavigationItem[] = [
  { id: 'nav_sys_home', label: 'Home', path: '/', isCMSPage: true, isSystemPage: true, systemKey: 'home', order: 0, visible: true },
  { id: 'nav_sys_academics', label: 'Academics', path: '/courses', isCMSPage: true, isSystemPage: true, systemKey: 'academics', order: 1, visible: true },
  { id: 'nav_sys_admissions', label: 'Admissions', path: '/admissions', isCMSPage: true, isSystemPage: true, systemKey: 'admissions', order: 2, visible: true },
  { id: 'nav_sys_notices', label: 'Notices', path: '/notices', isCMSPage: true, isSystemPage: true, systemKey: 'notices', order: 3, visible: true },
  { id: 'nav_sys_contact', label: 'Contact Us', path: '/contact', isCMSPage: true, isSystemPage: true, systemKey: 'contact', order: 4, visible: true },
  { id: 'nav_sys_about', label: 'About Us', path: '/about', isCMSPage: true, isSystemPage: true, systemKey: 'about', order: 5, visible: true },
];

export interface HeaderProps {
  initialSettings?: SiteSettings | null;
  initialNavItems?: NavigationItem[];
}

export const Header: React.FC<HeaderProps> = ({ initialSettings, initialNavItems }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(initialSettings || null);
  const [navItems, setNavItems] = useState<NavigationItem[]>(
    initialNavItems && initialNavItems.length > 0 ? initialNavItems : defaultFallbackNav
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
      return;
    }
    let alive = true;
    siteSettingsService.getSettings()
      .then((data) => { if (alive) setSettings(data); })
      .catch(() => {});
    return () => { alive = false; };
  }, [initialSettings]);

  useEffect(() => {
    if (initialNavItems && initialNavItems.length > 0) {
      setNavItems(initialNavItems);
      return;
    }
    let alive = true;
    navigationService.getNavigationItems()
      .then((items) => {
        if (alive && items && items.length > 0) setNavItems(items);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [initialNavItems]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenDropdownId(null);
    };
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setOpenDropdownId(null);
  }, [pathname]);

  const isHeroOverlayPage =
    pathname === '/' ||
    pathname === '/admissions' ||
    pathname === '/departments' ||
    pathname === '/notices' ||
    pathname === '/contact' ||
    pathname === '/about';

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const collegeInfo = settings?.collegeInfo || defaultSettings.collegeInfo;
  const rawName = collegeInfo.name || 'Jaysingpur College, Jaysingpur';
  const collegeName = rawName.toLowerCase().includes('jaysingpur college jaysingpur')
    ? 'Jaysingpur College, Jaysingpur'
    : rawName;
  const tagline = collegeInfo.tagline || 'Empowering Education & Innovation';
  const logoSrc = '/images/college_emblem.png';

  const handleDropdownKeyDown = (e: React.KeyboardEvent, itemId: string) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      setOpenDropdownId(openDropdownId === itemId ? null : itemId);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpenDropdownId(itemId);
    }
  };

  const navClassName = isHeroOverlayPage
    ? `${styles.unifiedHeaderNav} ${styles.heroTransparentNav} ${isScrolled ? styles.heroNavScrolled : ''}`
    : styles.unifiedHeaderNav;

  return (
    <header className={isHeroOverlayPage ? styles.headerShellTransparent : styles.headerShell}>
      {/* UNIFIED BRAND & NAVBAR (Transparent Overlay on Home, Surface on Subpages) */}
      <nav className={navClassName} aria-label="Main Navigation">
        <div className="container" ref={navRef}>
          <div className={styles.unifiedHeaderInner}>
            {/* Left: Official Emblem Logo + Enlarged Title Case College Name */}
            <Link href="/" className={styles.logoGroup} title={collegeName}>
              <img
                src={logoSrc}
                alt={`${collegeName} Official Emblem Logo`}
                className={styles.logoImage}
              />
              <div className={styles.logoTextWrapper}>
                <div className={styles.collegeTitle}>{collegeName}</div>
                <p className={styles.collegeSubtitle}>{tagline}</p>
              </div>
            </Link>

            {/* Right: Modern Single-Line Navbar (No Apply Now Button) */}
            <div className={styles.navAndCtaGroup}>
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
                        <button
                          type="button"
                          className={`${styles.navItemLink} ${styles.navItemWithDropdown} ${isActive ? styles.navItemActive : ''}`}
                          aria-expanded={isDropdownOpen}
                          aria-haspopup="true"
                          onClick={() => setOpenDropdownId(isDropdownOpen ? null : item.id)}
                          onKeyDown={(e) => handleDropdownKeyDown(e, item.id)}
                        >
                          <span>{item.label}</span>
                          <span className={`${styles.dropdownArrow} ${isDropdownOpen ? styles.dropdownArrowOpen : ''}`}>▼</span>
                        </button>
                        {isDropdownOpen && (
                          <ul className={styles.dropdownMenu} role="menu">
                            {item.children?.map((child) => {
                              const isChildItemActive = pathname === child.path;
                              const isExt =
                                child.isExternal ||
                                child.path.startsWith('http://') ||
                                child.path.startsWith('https://');

                              if (isExt) {
                                return (
                                  <li key={child.id} role="menuitem">
                                    <a
                                      href={child.path}
                                      className={styles.dropdownItemLink}
                                      target={child.targetBlank ? '_blank' : undefined}
                                      rel={child.targetBlank ? 'noopener noreferrer' : undefined}
                                    >
                                      {child.label}
                                    </a>
                                  </li>
                                );
                              }

                              return (
                                <li key={child.id} role="menuitem">
                                  <Link
                                    href={child.path}
                                    className={`${styles.dropdownItemLink} ${isChildItemActive ? styles.dropdownItemActive : ''}`}
                                  >
                                    {child.label}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  }

                  const isExt =
                    item.isExternal ||
                    item.path.startsWith('http://') ||
                    item.path.startsWith('https://');

                  if (isExt) {
                    return (
                      <li key={item.id}>
                        <a
                          href={item.path}
                          className={styles.navItemLink}
                          target={item.targetBlank ? '_blank' : undefined}
                          rel={item.targetBlank ? 'noopener noreferrer' : undefined}
                        >
                          {item.label}
                        </a>
                      </li>
                    );
                  }

                  return (
                    <li key={item.id}>
                      <Link
                        href={item.path}
                        className={`${styles.navItemLink} ${isActive ? styles.navItemActive : ''}`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Mobile Hamburger Toggle Button */}
              <button
                type="button"
                className={styles.mobileToggleBtn}
                onClick={() => setIsMobileOpen(true)}
                aria-label="Open Navigation Menu"
              >
                <Menu size={28} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        navItems={navItems}
        pathname={pathname}
      />
    </header>
  );
};
