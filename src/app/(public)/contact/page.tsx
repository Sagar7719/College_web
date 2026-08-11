import React from 'react';
import type { Metadata } from 'next';
import { pagesService } from '@/services/pages.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { PageSectionRenderer } from '@/components/page-builder';
import { Card, CardBody, Badge } from '@/components/ui';
import { ContactForm } from '@/components/public/ContactForm';



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
  const collegeName = settings.collegeInfo?.name || 'College';
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
  const cmsPage = await pagesService.getPageBySlug('contact');
  if (cmsPage && cmsPage.status === 'published' && cmsPage.sections?.length > 0) {
    return <PageSectionRenderer sections={cmsPage.sections} />;
  }

  const settings = await siteSettingsService.getSettings();
  const info = settings.collegeInfo;
  const social = settings.socialLinks || {};

  const fullAddress = [info.address, info.city, info.state, info.postalCode].filter(Boolean).join(', ');

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Badge variant="info" style={{ marginBottom: '0.5rem' }}>Reach Campus</Badge>
        <h1>Contact Us</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Have questions regarding admissions, academic programs, or campus visits? Connect with us.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Contact Details Card */}
        <Card variant="bordered">
          <CardBody>
            <h3>Campus Information</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.25rem', padding: 0 }}>
              {fullAddress && (
                <li>
                  <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.25rem' }}>📍 Campus Address:</strong>
                  <p className="small-text" style={{ margin: 0, color: 'var(--text-secondary)' }}>{fullAddress}</p>
                </li>
              )}
              {info.phone && (
                <li>
                  <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.25rem' }}>📞 Phone &amp; Helpline:</strong>
                  <p className="small-text" style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    {info.phone}
                    {info.alternatePhone && ` / ${info.alternatePhone}`}
                  </p>
                </li>
              )}
              {info.email && (
                <li>
                  <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.25rem' }}>✉️ Official Email:</strong>
                  <p className="small-text" style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    <a href={`mailto:${info.email}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                      {info.email}
                    </a>
                  </p>
                </li>
              )}
              {info.websiteUrl && (
                <li>
                  <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.25rem' }}>🌐 Website:</strong>
                  <p className="small-text" style={{ margin: 0 }}>
                    <a href={info.websiteUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                      {info.websiteUrl}
                    </a>
                  </p>
                </li>
              )}
            </ul>

            {/* Social Links on Contact Page */}
            {Object.values(social).some(Boolean) && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                <strong style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>Follow Our Official Channels:</strong>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {social.facebook && <a href={social.facebook} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.875rem' }}>Facebook</a>}
                  {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.875rem' }}>Instagram</a>}
                  {social.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.875rem' }}>LinkedIn</a>}
                  {social.youtube && <a href={social.youtube} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.875rem' }}>YouTube</a>}
                  {social.twitter && <a href={social.twitter} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.875rem' }}>Twitter/X</a>}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Public Contact Form */}
        <ContactForm />

      </div>
    </div>
  );
}
