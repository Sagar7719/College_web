import React from 'react';
import type { Metadata } from 'next';
import { pagesService } from '@/services/pages.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { contactPageConfigService } from '@/services/enterprise-cms.service';
import { ContactClient } from './ContactClient';

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await pagesService.getPageBySlug('contact');
  if (cmsPage && cmsPage.status === 'published' && (cmsPage.seo?.metaTitle || cmsPage.title)) {
    return {
      title: cmsPage.seo?.metaTitle || cmsPage.title,
      description: cmsPage.seo?.metaDescription,
      alternates: { canonical: '/contact' },
    };
  }

  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'Shivaji University, Kolhapur';
  const title = `Contact Us — ${collegeName}`;
  const description = `Get in touch with ${collegeName}. Official campus address, admissions helpline, and department contact emails.`;
  const ogImageUrl = settings.seoConfig?.defaultOgImageUrl || settings.collegeInfo?.logoUrl;

  return {
    title,
    description,
    alternates: {
      canonical: '/contact',
    },
    openGraph: {
      title,
      description,
      url: '/contact',
      siteName: collegeName,
      type: 'website',
      ...(ogImageUrl ? { images: [{ url: ogImageUrl, alt: title }] } : {}),
    },
  };
}

export default async function ContactPage() {
  const [settings, contactData] = await Promise.all([
    siteSettingsService.getSettings(),
    contactPageConfigService.get(),
  ]);

  const collegeInfo = settings.collegeInfo || {};
  const socialLinks = settings.socialLinks || {};

  return <ContactClient collegeInfo={collegeInfo} socialLinks={socialLinks} contactData={contactData} />;
}
