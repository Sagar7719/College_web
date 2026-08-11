import React from 'react';
import { Header, Footer } from '@/components/layout';
import { siteSettingsService } from '@/services/site-settings.service';
import { navigationService } from '@/services/navigation.service';
import MaintenancePage from './maintenance/page';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await siteSettingsService.getSettings();
  const navItems = await navigationService.getNavigationItems();

  // If Maintenance Mode is ON, render clean public maintenance screen
  if (settings.maintenanceMode) {
    return <MaintenancePage message={settings.maintenanceMessage} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header initialSettings={settings} initialNavItems={navItems} />
      <main style={{ flex: 1, padding: '2.5rem 0', backgroundColor: 'var(--bg-main)' }}>
        <div className="container">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
