import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { departmentsService } from '@/services/cms-modules.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { Card, CardBody, Badge, Button, EmptyState } from '@/components/ui';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'College';
  const title = `Academic Departments — ${collegeName}`;
  const description = `Discover state-of-the-art academic departments, research faculties, and laboratories at ${collegeName}.`;
  const ogImageUrl = settings.seoConfig?.defaultOgImageUrl || settings.collegeInfo?.logoUrl;

  return {
    title,
    description,
    alternates: {
      canonical: '/departments',
    },
    openGraph: {
      title,
      description,
      url: '/departments',
      siteName: collegeName,
      type: 'website',
      ...(ogImageUrl ? { images: [{ url: ogImageUrl, alt: title }] } : {}),
    },
  };
}


export default async function DepartmentsPage() {
  const departments = await departmentsService.getPublished();

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Badge variant="info" style={{ marginBottom: '0.5rem' }}>Academic Departments</Badge>
        <h1>Our Departments</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Discover state-of-the-art faculties, laboratories, and specialized degree paths.
        </p>
      </div>

      {departments.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {departments.map((dept) => (
            <Card key={dept.id} variant="bordered" hoverable>
              <CardBody>
                <Badge variant="info" style={{ marginBottom: '0.5rem' }}>{dept.code}</Badge>
                <h3>{dept.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.5rem 0 1rem' }}>
                  {dept.description || 'Fostering academic excellence and research.'}
                </p>
                {dept.hodName && (
                  <p className="small-text" style={{ marginBottom: '1rem' }}>
                    <strong>HOD:</strong> {dept.hodName}
                  </p>
                )}
                <Link href={`/courses?dept=${dept.id}`}>
                  <Button variant="outline" size="sm">View Courses ➔</Button>
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Department Information Coming Soon"
          description="Department profiles and academic faculties are currently being updated by the college administrator."
        />
      )}
    </div>
  );
}
