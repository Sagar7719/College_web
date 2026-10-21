import React from 'react';
import type { Metadata } from 'next';
import { galleryService } from '@/services/cms-modules.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { GalleryClient } from './GalleryClient';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'Shivaji University, Kolhapur';
  const title = `Photo Gallery & Media Albums — ${collegeName}`;
  const description = `Browse campus photo albums, annual fests, convocations, and infrastructure galleries at ${collegeName}.`;
  const ogImageUrl = settings.seoConfig?.defaultOgImageUrl || settings.collegeInfo?.logoUrl;

  return {
    title,
    description,
    alternates: {
      canonical: '/gallery',
    },
    openGraph: {
      title,
      description,
      url: '/gallery',
      siteName: collegeName,
      type: 'website',
      ...(ogImageUrl ? { images: [{ url: ogImageUrl, alt: title }] } : {}),
    },
  };
}

export default async function GalleryPage() {
  const albums = await galleryService.getPublished();
  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'Shivaji University, Kolhapur';

  return <GalleryClient initialAlbums={albums} collegeName={collegeName} />;
}
