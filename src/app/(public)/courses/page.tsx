import React from 'react';
import type { Metadata } from 'next';
import { coursesService } from '@/services/cms-modules.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { Card, CardBody, Badge, EmptyState, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'College';
  const title = `Courses & Degree Programs — ${collegeName}`;
  const description = `Explore undergraduate, postgraduate, and doctoral degree programs offered at ${collegeName}.`;
  const ogImageUrl = settings.seoConfig?.defaultOgImageUrl || settings.collegeInfo?.logoUrl;

  return {
    title,
    description,
    alternates: {
      canonical: '/courses',
    },
    openGraph: {
      title,
      description,
      url: '/courses',
      siteName: collegeName,
      type: 'website',
      ...(ogImageUrl ? { images: [{ url: ogImageUrl, alt: title }] } : {}),
    },
  };
}


export default async function CoursesPage() {
  const courses = await coursesService.getAll();

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Badge variant="info" style={{ marginBottom: '0.5rem' }}>Programs Offered</Badge>
        <h1>Courses & Degree Programs</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Explore undergraduate, postgraduate, and diploma programs.
        </p>
      </div>

      {courses.length > 0 ? (
        <Card variant="bordered">
          <CardBody style={{ padding: 0 }}>
            <Table responsive>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Program Name</TableHead>
                  <TableHead>Degree Level</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Eligibility</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell><Badge variant="default">{course.code}</Badge></TableCell>
                    <TableCell style={{ fontWeight: 600, color: 'var(--primary)' }}>{course.title}</TableCell>
                    <TableCell>{course.degreeType}</TableCell>
                    <TableCell>{course.durationYears} Years</TableCell>
                    <TableCell style={{ fontSize: '0.875rem' }}>{course.eligibility || 'Higher Secondary Pass'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      ) : (
        <EmptyState
          title="No Courses Listed Yet"
          description="Degree program details will be available soon."
        />
      )}
    </div>
  );
}
