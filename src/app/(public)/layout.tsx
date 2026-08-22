import React from 'react';
import { Header, Footer } from '@/components/layout';
import { siteSettingsService } from '@/services/site-settings.service';
import { navigationService } from '@/services/navigation.service';
import { noticesService } from '@/services/cms-modules.service';
import { WebsitePopupModal } from '@/components/common/WebsitePopupModal';
import MaintenancePage from './maintenance/page';
import { Notice } from '@/types';

/**
 * Deterministically selects ONE active popup notice based on:
 * 1. status === 'published'
 * 2. Within publication lifecycle (publishDate / expiryDate)
 * 3. isUrgent === true OR tag === 'IMP' / 'URGENT'
 * 4. Sorting: isUrgent first, newest publishDate, ID tie-breaker
 */
function selectActivePopupNotice(notices: Notice[]): Notice | null {
  if (!Array.isArray(notices) || notices.length === 0) return null;

  const now = new Date();

  const eligible = notices.filter((n) => {
    if (n.status !== 'published') return false;

    const tag = (n.tag || '').toUpperCase().trim();
    const isUrgentOrImp = n.isUrgent || tag === 'IMP' || tag === 'URGENT';
    if (!isUrgentOrImp) return false;

    if (n.expiryDate) {
      const expDate = new Date(n.expiryDate);
      if (!isNaN(expDate.getTime()) && expDate < now) {
        return false;
      }
    }

    return true;
  });

  if (eligible.length === 0) return null;

  eligible.sort((a, b) => {
    if (a.isUrgent !== b.isUrgent) {
      return a.isUrgent ? -1 : 1;
    }
    const timeA = a.publishDate ? new Date(a.publishDate).getTime() : 0;
    const timeB = b.publishDate ? new Date(b.publishDate).getTime() : 0;
    if (timeA !== timeB) {
      return timeB - timeA;
    }
    return (b.id || '').localeCompare(a.id || '');
  });

  return eligible[0] || null;
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await siteSettingsService.getSettings();
  const navItems = await navigationService.getNavigationItems();
  const notices = await noticesService.getPublished();
  const popupNotice = selectActivePopupNotice(notices);

  // If Maintenance Mode is ON, render clean public maintenance screen
  if (settings.maintenanceMode) {
    return <MaintenancePage message={settings.maintenanceMessage} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header initialSettings={settings} initialNavItems={navItems} />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
      <WebsitePopupModal notice={popupNotice} />
    </div>
  );
}