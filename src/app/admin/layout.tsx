'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import { AuthGuard } from '@/components/admin/AuthGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminMobileDrawer } from '@/components/admin/AdminMobileDrawer';
import styles from '@/components/admin/admin.module.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // On Login page, render layout without sidebar/header
  if (pathname === '/admin/login') {
    return (
      <AuthProvider>
        <AuthGuard>{children}</AuthGuard>
      </AuthProvider>
    );
  }

  // Helper to format route title
  const getRouteTitle = (path: string) => {
    if (path.includes('/pages')) return 'Page Builder & CMS Pages';
    if (path.includes('/navigation')) return 'Dynamic Navigation Manager';
    if (path.includes('/departments')) return 'Departments Management';
    if (path.includes('/courses')) return 'Courses & Degree Programs';
    if (path.includes('/faculty')) return 'Faculty Directory Management';
    if (path.includes('/notices')) return 'Notices & Circulars';
    if (path.includes('/news')) return 'Campus News';
    if (path.includes('/events')) return 'Events Calendar';
    if (path.includes('/contact-messages')) return 'Contact Messages Management';

    if (path.includes('/gallery')) return 'Photo Gallery Albums';
    if (path.includes('/downloads')) return 'Document Downloads';
    if (path.includes('/media')) return 'Cloudinary Media Library';
    if (path.includes('/settings')) return 'Site Settings & Branding';
    if (path.includes('/maintenance')) return 'Maintenance Mode Control';
    if (path.includes('/setup')) return 'First-Time Setup Wizard';
    return 'Admin CMS Dashboard';
  };

  return (
    <AuthProvider>
      <AuthGuard>
        <div className={styles.adminShell}>
          <AdminSidebar />
          <div className={styles.mainWrapper}>
            <AdminHeader
              title={getRouteTitle(pathname)}
              onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            />
            <main className={styles.adminMain}>{children}</main>
          </div>
          <AdminMobileDrawer
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}
