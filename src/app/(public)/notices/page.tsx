import React from 'react';
import type { Metadata } from 'next';
import { pagesService } from '@/services/pages.service';
import { noticesService } from '@/services/cms-modules.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { NoticesClient } from './NoticesClient';

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await pagesService.getPageBySlug('notices');
  if (cmsPage && cmsPage.status === 'published' && (cmsPage.seo?.metaTitle || cmsPage.title)) {
    return {
      title: cmsPage.seo?.metaTitle || cmsPage.title,
      description: cmsPage.seo?.metaDescription,
      alternates: { canonical: '/notices' },
    };
  }

  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'Jaysingpur College';
  const title = `Official Notices & Circulars — ${collegeName}`;
  const description = `Stay updated with official academic circulars, exam schedules, and administrative announcements from ${collegeName}.`;
  const ogImageUrl = settings.seoConfig?.defaultOgImageUrl || settings.collegeInfo?.logoUrl;

  return {
    title,
    description,
    alternates: {
      canonical: '/notices',
    },
    openGraph: {
      title,
      description,
      url: '/notices',
      siteName: collegeName,
      type: 'website',
      ...(ogImageUrl ? { images: [{ url: ogImageUrl, alt: title }] } : {}),
    },
  };
}

export default async function NoticesPage() {
  const notices = await noticesService.getPublished(20);

  return <NoticesClient initialNotices={notices} />;
}
