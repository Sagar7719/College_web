import React from 'react';
import type { Metadata } from 'next';
import { coursesService } from '@/services/cms-modules.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { CoursesClient } from './CoursesClient';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'Shivaji University, Kolhapur';
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
  const courses = await coursesService.getPublished();
  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'Shivaji University, Kolhapur';

  return <CoursesClient initialCourses={courses} collegeName={collegeName} />;
}
