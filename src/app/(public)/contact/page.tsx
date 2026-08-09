import React from 'react';
import type { Metadata } from 'next';
import { siteSettingsService } from '@/services/site-settings.service';
import { Card, CardBody, Badge, Input, Button } from '@/components/ui';

export async function generateMetadata(): Promise<Metadata> {
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
        <Card variant="bordered">
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3>Send A Message</h3>
            <Input label="Your Name" placeholder="Enter full name" required />
            <Input label="Email Address" type="email" placeholder="name@example.com" required />
            <Input label="Subject" placeholder="e.g. Admission Inquiry" required />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary)' }}>Message</label>
              <textarea
                rows={4}
                placeholder="Type your message here..."
                style={{
                  padding: '0.625rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                }}
              />
            </div>
            <Button variant="primary" size="md">Send Message</Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
