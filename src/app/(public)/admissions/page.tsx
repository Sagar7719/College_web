import React from 'react';
import type { Metadata } from 'next';
import { pagesService } from '@/services/pages.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { admissionsConfigService } from '@/services/enterprise-cms.service';
import { AdmissionsClient } from './AdmissionsClient';

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await pagesService.getPageBySlug('admissions');
  if (cmsPage && cmsPage.status === 'published' && (cmsPage.seo?.metaTitle || cmsPage.title)) {
    return {
      title: cmsPage.seo?.metaTitle || cmsPage.title,
      description: cmsPage.seo?.metaDescription,
      alternates: { canonical: '/admissions' },
    };
  }

  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'Jaysingpur College';
  const title = `Admissions 2026-2027 — ${collegeName}`;
  const description = `Explore admissions criteria, eligibility, counseling dates, and online application guidelines for ${collegeName}.`;

  return {
    title,
    description,
    alternates: {
      canonical: '/admissions',
    },
    openGraph: {
      title,
      description,
      url: '/admissions',
      siteName: collegeName,
      type: 'website',
    },
  };
}

export default async function AdmissionsPage() {
  const admissionsData = await admissionsConfigService.get();

  return <AdmissionsClient admissionsData={admissionsData} />;
}
