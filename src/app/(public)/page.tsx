import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { pagesService } from '@/services/pages.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { noticesService, eventsService, departmentsService } from '@/services/cms-modules.service';
import { PageSectionRenderer } from '@/components/page-builder';
import { Button, Card, CardBody, Badge } from '@/components/ui';

export async function generateMetadata(): Promise<Metadata> {
  const homePage = await pagesService.getPageBySlug('home');
  if (homePage && homePage.status === 'published' && (homePage.seo?.metaTitle || homePage.title)) {
    return {
      title: homePage.seo?.metaTitle || homePage.title,
      description: homePage.seo?.metaDescription,
      alternates: {
        canonical: '/',
      },
      openGraph: homePage.seo?.ogImageUrl
        ? {
            images: [{ url: homePage.seo.ogImageUrl }],
          }
        : undefined,
    };
  }

  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'College';
  const title = settings.seoConfig?.defaultMetaTitle || `${collegeName} | Official Portal`;
  const description = settings.seoConfig?.defaultMetaDescription || settings.collegeInfo?.description || `Official website of ${collegeName}.`;

  return {
    title,
    description,
    alternates: {
      canonical: '/',
    },
  };
}


export default async function HomePage() {
  // Try fetching dynamic home page from Firestore if created by Admin
  const homePage = await pagesService.getPageBySlug('home');

  if (homePage && homePage.status === 'published' && homePage.sections?.length > 0) {
    return <PageSectionRenderer sections={homePage.sections} />;
  }

  // Fallback Academic College Home Layout when Firestore is initially empty
  const notices = await noticesService.getPublished(5);
  const upcomingEvents = await eventsService.getUpcoming();
  const departments = await departmentsService.getPublished();

  return (
    <div>
      {/* Hero Banner Section */}
      <section
        style={{
          backgroundColor: 'var(--primary)',
          color: '#FFFFFF',
          padding: '4.5rem 2rem',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          marginBottom: '3rem',
        }}
      >
        <Badge variant="info" style={{ marginBottom: '1rem' }}>
          Welcome to College of Academic Excellence
        </Badge>
        <h1 style={{ color: '#FFFFFF', fontSize: '2.5rem', marginBottom: '1rem' }}>
          Empowering Minds, Shaping Futures
        </h1>
        <p
          style={{
            fontSize: '1.125rem',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '720px',
            margin: '0 auto 2rem',
            lineHeight: 1.6,
          }}
        >
          Dedicated to academic rigor, pioneering research, and producing global leaders across science, technology, and humanities.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/admissions">
            <Button variant="secondary" size="lg">
              Admissions 2026
            </Button>
          </Link>
          <Link href="/departments">
            <Button variant="outline" size="lg" style={{ color: '#FFFFFF', borderColor: '#FFFFFF' }}>
              Explore Academics
            </Button>
          </Link>
        </div>
      </section>

      {/* Grid Section: Notices & Events */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          marginBottom: '3.5rem',
        }}
      >
        {/* Notice Board */}
        <Card variant="bordered">
          <CardBody>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2>Latest Notices</h2>
              <Link href="/notices">
                <Button variant="ghost" size="sm">View All ➔</Button>
              </Link>
            </div>
            {notices.length > 0 ? (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {notices.map((notice) => (
                  <li key={notice.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <Badge variant={notice.isUrgent ? 'danger' : 'info'}>{notice.category}</Badge>
                      <span className="tiny-text">{notice.publishDate.slice(0, 10)}</span>
                    </div>
                    <Link href={`/notices/${notice.id}`} style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {notice.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="small-text" style={{ color: 'var(--text-muted)' }}>
                No notices published at the moment.
              </p>
            )}
          </CardBody>
        </Card>

        {/* Campus Events */}
        <Card variant="bordered">
          <CardBody>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2>Upcoming Events</h2>
              <Link href="/events">
                <Button variant="ghost" size="sm">View All ➔</Button>
              </Link>
            </div>
            {upcomingEvents.length > 0 ? (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {upcomingEvents.map((evt) => (
                  <li key={evt.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                    <span className="tiny-text" style={{ color: 'var(--text-muted)' }}>📍 {evt.venue} • {evt.eventDate.slice(0, 10)}</span>
                    <h4 style={{ margin: '0.25rem 0' }}>{evt.title}</h4>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="small-text" style={{ color: 'var(--text-muted)' }}>
                No upcoming events scheduled at the moment.
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Academic Departments Overview */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Academic Departments</h2>
          <Link href="/departments">
            <Button variant="outline" size="sm">All Departments</Button>
          </Link>
        </div>
        {departments.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {departments.map((dept) => (
              <Card key={dept.id} variant="bordered" hoverable>
                <CardBody>
                  <Badge variant="info" style={{ marginBottom: '0.5rem' }}>{dept.code}</Badge>
                  <h3>{dept.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.5rem 0 1rem' }}>
                    {dept.description || 'Fostering excellence in education and research.'}
                  </p>
                  <Link href={`/departments/${dept.id}`}>
                    <Button variant="ghost" size="sm">View Department ➔</Button>
                  </Link>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <p className="small-text" style={{ color: 'var(--text-muted)' }}>
            Department information will be available soon.
          </p>
        )}
      </section>
    </div>
  );
}
