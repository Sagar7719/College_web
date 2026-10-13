import React from 'react';
import Link from 'next/link';
import { getAdminDb } from '@/lib/firebase/admin';
import { siteSettingsService } from '@/services/site-settings.service';
import { Button, Badge } from '@/components/ui';
import styles from '@/components/admin/admin.module.css';

export default async function AdminDashboardPage() {
  const db = getAdminDb();
  const [
    pagesCount,
    departmentsCount,
    coursesCount,
    facultyCount,
    noticesCount,
    newsCount,
    eventsCount,
    galleryCount,
    downloadsCount,
    settings,
  ] = await Promise.all([
    db.collection('pages').count().get().then((s) => s.data().count).catch(() => 0),
    db.collection('departments').count().get().then((s) => s.data().count).catch(() => 0),
    db.collection('courses').count().get().then((s) => s.data().count).catch(() => 0),
    db.collection('faculty').count().get().then((s) => s.data().count).catch(() => 0),
    db.collection('notices').count().get().then((s) => s.data().count).catch(() => 0),
    db.collection('news').count().get().then((s) => s.data().count).catch(() => 0),
    db.collection('events').count().get().then((s) => s.data().count).catch(() => 0),
    db.collection('gallery').count().get().then((s) => s.data().count).catch(() => 0),
    db.collection('downloads').count().get().then((s) => s.data().count).catch(() => 0),
    siteSettingsService.getSettings().catch(() => null),
  ]);

  const collegeName = settings?.collegeInfo?.name || 'College CMS';
  const isSetupCompleted = Boolean(settings?.setupCompleted);
  const isMaintenanceActive = Boolean(settings?.maintenanceMode);

  const metrics = [
    { title: 'Dynamic Pages', count: pagesCount, icon: '📄', href: '/admin/pages', theme: styles.metricTerracotta },
    { title: 'Departments', count: departmentsCount, icon: '🏛️', href: '/admin/departments', theme: styles.metricEmerald },
    { title: 'Courses & Programs', count: coursesCount, icon: '🎓', href: '/admin/courses', theme: styles.metricSapphire },
    { title: 'Faculty Members', count: facultyCount, icon: '👨‍🏫', href: '/admin/faculty', theme: styles.metricPurple },
    { title: 'Notices & Circulars', count: noticesCount, icon: '📌', href: '/admin/notices', theme: styles.metricGold },
    { title: 'News Stories', count: newsCount, icon: '📰', href: '/admin/news', theme: styles.metricCrimson },
    { title: 'Campus Events', count: eventsCount, icon: '📅', href: '/admin/events', theme: styles.metricTeal },
    { title: 'Photo Albums', count: galleryCount, icon: '🖼️', href: '/admin/gallery', theme: styles.metricIndigo },
    { title: 'Downloads Center', count: downloadsCount, icon: '📥', href: '/admin/downloads', theme: styles.metricTerracotta },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ marginBottom: '2rem' }}>
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
        <h1 className={styles.headerTitle} style={{ fontSize: '2.15rem', marginBottom: '0.5rem' }}>{collegeName} Overview</h1>
        <p style={{ color: '#706A61', fontSize: '0.9375rem', margin: 0 }}>
          Manage dynamic pages, navigation, academic departments, notices, faculty, and site settings.
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

      {/* 3D Squircle RGB Metrics Cards Grid */}
      <div className={styles.metricsGrid}>
        {metrics.map((m) => (
          <Link key={m.title} href={m.href} style={{ textDecoration: 'none' }}>
            <div className={`${styles.metricCard} ${m.theme}`}>
              <div className={styles.metricIconBox}>{m.icon}</div>
              <div>
                <p className={styles.metricTitle}>{m.title}</p>
                <p className={styles.metricValue}>{m.count}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
