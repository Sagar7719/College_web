import React from 'react';
import type { Metadata } from 'next';
import { pagesService } from '@/services/pages.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { AboutClient } from './AboutClient';

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await pagesService.getPageBySlug('about');
  if (cmsPage && cmsPage.status === 'published' && (cmsPage.seo?.metaTitle || cmsPage.title)) {
    return {
      title: cmsPage.seo?.metaTitle || cmsPage.title,
      description: cmsPage.seo?.metaDescription,
      alternates: { canonical: '/about' },
      openGraph: cmsPage.seo?.ogImageUrl ? { images: [{ url: cmsPage.seo.ogImageUrl }] } : undefined,
    };
  }

  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'Jaysingpur College';
  const title = `About Us — ${collegeName}`;
  const description = `Learn more about ${collegeName}, our mission, vision, history, and leadership message.`;
  const ogImageUrl = settings.seoConfig?.defaultOgImageUrl || settings.collegeInfo?.logoUrl;

  return {
    title,
    description,
    alternates: {
      canonical: '/about',
    },
    openGraph: {
      title,
      description,
      url: '/about',
      siteName: collegeName,
      type: 'website',
      ...(ogImageUrl ? { images: [{ url: ogImageUrl, alt: title }] } : {}),
    },
  };
}

export default async function AboutPage() {
  const settings = await siteSettingsService.getSettings();
  const collegeInfo = settings.collegeInfo || {};

  return <AboutClient collegeInfo={collegeInfo} />;
}
