import React from 'react';
import type { Metadata } from 'next';
import { pagesService } from '@/services/pages.service';
import { departmentsService } from '@/services/cms-modules.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { PageSectionRenderer } from '@/components/page-builder';
import { DepartmentsClient } from './DepartmentsClient';

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await pagesService.getPageBySlug('departments');
  if (cmsPage && cmsPage.status === 'published' && (cmsPage.seo?.metaTitle || cmsPage.title)) {
    return {
      title: cmsPage.seo?.metaTitle || cmsPage.title,
      description: cmsPage.seo?.metaDescription,
      alternates: { canonical: '/departments' },
    };
  }

  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'Shivaji University, Kolhapur';
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

  return <DepartmentsClient initialDepartments={departments} />;
}
