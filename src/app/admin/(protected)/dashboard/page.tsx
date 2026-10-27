import React from 'react';
import Link from 'next/link';
import { getAdminDb } from '@/lib/firebase/admin';
import { siteSettingsService } from '@/services/site-settings.service';
import { Button } from '@/components/ui';
import {
  FileText,
  Landmark,
  GraduationCap,
  Users,
  Megaphone,
  Newspaper,
  Calendar,
  Image as ImageIcon,
  Download,
} from 'lucide-react';
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

  const collegeName = settings?.collegeInfo?.name || 'Shivaji University Kolhapur';
  const isSetupCompleted = Boolean(settings?.setupCompleted);
  const isMaintenanceActive = Boolean(settings?.maintenanceMode);

  const metrics = [
    { title: 'Dynamic Pages', count: pagesCount, icon: <FileText size={22} />, href: '/admin/pages', theme: styles.metricTerracotta },
    { title: 'Departments', count: departmentsCount, icon: <Landmark size={22} />, href: '/admin/departments', theme: styles.metricEmerald },
    { title: 'Courses & Programs', count: coursesCount, icon: <GraduationCap size={22} />, href: '/admin/courses', theme: styles.metricSapphire },
    { title: 'Faculty Members', count: facultyCount, icon: <Users size={22} />, href: '/admin/faculty', theme: styles.metricPurple },
    { title: 'Notices & Circulars', count: noticesCount, icon: <Megaphone size={22} />, href: '/admin/notices', theme: styles.metricGold },
    { title: 'News Stories', count: newsCount, icon: <Newspaper size={22} />, href: '/admin/news', theme: styles.metricCrimson },
    { title: 'Campus Events', count: eventsCount, icon: <Calendar size={22} />, href: '/admin/events', theme: styles.metricTeal },
    { title: 'Photo Albums', count: galleryCount, icon: <ImageIcon size={22} />, href: '/admin/gallery', theme: styles.metricIndigo },
    { title: 'Downloads Center', count: downloadsCount, icon: <Download size={22} />, href: '/admin/downloads', theme: styles.metricMint },
  ];

  return (
    <div className={styles.adminMainInner}>
      {/* Welcome Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span
            style={{
              backgroundColor: '#F5EBE6',
              color: '#B4532A',
              padding: '4px 12px',
              borderRadius: '100px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            CMS Administration
          </span>
          {isSetupCompleted ? (
            <span
              style={{
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                padding: '4px 12px',
                borderRadius: '100px',
                fontSize: '0.8125rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Setup Completed ✓
            </span>
          ) : (
            <span
              style={{
                backgroundColor: '#FEF3C7',
                color: '#D97706',
                padding: '4px 12px',
                borderRadius: '100px',
                fontSize: '0.8125rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Initial Setup Pending
            </span>
          )}
          {isMaintenanceActive && (
            <span
              style={{
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                padding: '4px 12px',
                borderRadius: '100px',
                fontSize: '0.8125rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              🚨 Maintenance Mode Active
            </span>
          )}
        </div>
        <h1 className={styles.dashboardTitle}>
          {collegeName} Overview
        </h1>
        <p className={styles.dashboardSubtitle}>
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

      {/* Coordinated Pastel Metric Stat Cards Grid */}
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
