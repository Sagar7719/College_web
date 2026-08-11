import React from 'react';
import Link from 'next/link';
import { pagesService } from '@/services/pages.service';
import {
  departmentsService,
  coursesService,
  facultyService,
  noticesService,
  newsService,
  eventsService,
  galleryService,
  downloadsService,
} from '@/services/cms-modules.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { Card, CardBody, Button, Badge } from '@/components/ui';
import styles from '@/components/admin/admin.module.css';

export default async function AdminDashboardPage() {
  const [
    pages,
    departments,
    courses,
    faculty,
    notices,
    news,
    events,
    gallery,
    downloads,
    settings,
  ] = await Promise.all([
    pagesService.getAllPages().catch(() => []),
    departmentsService.getAll().catch(() => []),
    coursesService.getAll().catch(() => []),
    facultyService.getAll().catch(() => []),
    noticesService.getAll().catch(() => []),
    newsService.getAll().catch(() => []),
    eventsService.getAll().catch(() => []),
    galleryService.getAll().catch(() => []),
    downloadsService.getAll().catch(() => []),
    siteSettingsService.getSettings().catch(() => null),
  ]);

  const collegeName = settings?.collegeInfo?.name || 'College CMS';
  const isSetupCompleted = Boolean(settings?.setupCompleted);
  const isMaintenanceActive = Boolean(settings?.maintenanceMode);

  const metrics = [
    { title: 'Dynamic Pages', count: pages.length, icon: '📄', href: '/admin/pages' },
    { title: 'Departments', count: departments.length, icon: '🏛️', href: '/admin/departments' },
    { title: 'Courses & Programs', count: courses.length, icon: '🎓', href: '/admin/courses' },
    { title: 'Faculty Members', count: faculty.length, icon: '👨‍🏫', href: '/admin/faculty' },
    { title: 'Notices & Circulars', count: notices.length, icon: '📌', href: '/admin/notices' },
    { title: 'News Stories', count: news.length, icon: '📰', href: '/admin/news' },
    { title: 'Campus Events', count: events.length, icon: '📅', href: '/admin/events' },
    { title: 'Photo Albums', count: gallery.length, icon: '🖼️', href: '/admin/gallery' },
    { title: 'Downloads', count: downloads.length, icon: '📥', href: '/admin/downloads' },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <Badge variant="info">CMS Administration</Badge>
          {isSetupCompleted ? (
            <Badge variant="success">Setup Completed ✓</Badge>
          ) : (
            <Badge variant="warning">Initial Setup Pending</Badge>
          )}
          {isMaintenanceActive && (
            <Badge variant="danger">🚨 Maintenance Mode Active</Badge>
          )}
        </div>
        <h1 className={styles.headerTitle} style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{collegeName} Overview</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem', margin: 0 }}>
          Manage dynamic pages, dynamic navigation, academic departments, media, and site settings.
        </p>
      </div>

      {/* Onboarding Notice Banner if Setup Incomplete */}
      {!isSetupCompleted && (
        <div className={styles.noticeBannerBlue}>
          <div>
            <h4 className={styles.noticeBannerTitle}>
              🚀 Complete Your First-Time College Setup
            </h4>
            <p className={styles.noticeBannerDesc}>
              Configure your college branding, campus address, contact details, and principal information using the guided wizard.
            </p>
          </div>
          <Link href="/admin/setup">
            <Button variant="primary" size="md">
              Launch Setup Wizard →
            </Button>
          </Link>
        </div>
      )}

      {/* Maintenance Mode Warning Banner if Active */}
      {isMaintenanceActive && (
        <div className={styles.noticeBannerRed}>
          <div>
            <h4 className={styles.noticeBannerTitle}>
              🚨 Public Maintenance Mode is Active
            </h4>
            <p className={styles.noticeBannerDesc}>
              Public visitors are seeing the maintenance page. Admin CMS remains accessible for you.
            </p>
          </div>
          <Link href="/admin/settings">
            <Button variant="danger" size="sm">
              Manage in Settings ⚙️
            </Button>
          </Link>
        </div>
      )}

      {/* Summary Metrics Cards Grid */}
      <div className={styles.metricsGrid}>
        {metrics.map((m) => (
          <Link key={m.title} href={m.href} style={{ textDecoration: 'none' }}>
            <div className={styles.metricCard}>
              <div className={styles.metricIcon}>{m.icon}</div>
              <div>
                <p className={styles.metricTitle}>{m.title}</p>
                <p className={styles.metricValue}>{m.count}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Action & Draft Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        <Card variant="bordered">
          <CardBody style={{ padding: '1.75rem' }}>
            <h3 className={styles.headerTitle} style={{ marginBottom: '0.25rem', fontSize: '1.1875rem' }}>⚡ Quick Content Actions</h3>
            <div className={styles.quickActionsFlex}>
              <Link href="/admin/pages">
                <Button variant="primary" size="sm">Create New Page 📄</Button>
              </Link>
              <Link href="/admin/notices">
                <Button variant="secondary" size="sm">Post Notice 📌</Button>
              </Link>
              <Link href="/admin/gallery">
                <Button variant="outline" size="sm">Upload Gallery 🖼️</Button>
              </Link>
              <Link href="/admin/navigation">
                <Button variant="outline" size="sm">Manage Menu 🧭</Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant="ghost" size="sm">Settings ⚙️</Button>
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card variant="bordered">
          <CardBody style={{ padding: '1.75rem' }}>
            <h3 className={styles.headerTitle} style={{ marginBottom: '0.5rem', fontSize: '1.1875rem' }}>📝 Content Overview</h3>
            <p className="small-text" style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
              {pages.length > 0
                ? `${pages.filter((p) => p.status === 'published').length} published page(s) currently active on the public website.`
                : 'No dynamic pages configured yet. Click "Create New Page" to add website pages without coding.'}
            </p>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              <Link href="/admin/settings" style={{ fontSize: '0.875rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 700 }}>
                Configure College Settings &amp; Branding →
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
