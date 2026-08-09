import React from 'react';
import type { Metadata } from 'next';
import { siteSettingsService } from '@/services/site-settings.service';
import { DownloadsClient } from './DownloadsClient';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'College';
  const title = `Document Downloads & Academic Resources — ${collegeName}`;
  const description = `Download official forms, syllabi, fee structures, exam schedules, and circulars from ${collegeName}.`;
  const ogImageUrl = settings.seoConfig?.defaultOgImageUrl || settings.collegeInfo?.logoUrl;

  return {
    title,
    description,
    alternates: {
      canonical: '/downloads',
    },
    openGraph: {
      title,
      description,
      url: '/downloads',
      siteName: collegeName,
      type: 'website',
      ...(ogImageUrl ? { images: [{ url: ogImageUrl, alt: title }] } : {}),
    },
  };
}

export default function DownloadsPage() {
  return <DownloadsClient />;
}
