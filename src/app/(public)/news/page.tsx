import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { newsService } from '@/services/cms-modules.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { Badge, EmptyState } from '@/components/ui';
import { Newspaper, Calendar, User, ArrowRight, Sparkles, Clock, Globe } from 'lucide-react';
import styles from '../inner.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'College';
  const title = `News & Press Releases — ${collegeName}`;
  const description = `Read latest stories, research achievements, campus highlights, and press releases from ${collegeName}.`;
  const ogImageUrl = settings.seoConfig?.defaultOgImageUrl || settings.collegeInfo?.logoUrl;

  return {
    title,
    description,
    alternates: {
      canonical: '/news',
    },
    openGraph: {
      title,
      description,
      url: '/news',
      siteName: collegeName,
      type: 'website',
      ...(ogImageUrl ? { images: [{ url: ogImageUrl, alt: title }] } : {}),
    },
  };
}

export default async function NewsPage() {
  const articles = await newsService.getPublished();

  return (
    <div style={{ backgroundColor: '#FAF7F2', minHeight: '85vh', paddingBottom: '4rem' }}>
      {/* ==============================================================================
         1. HERO HEADER BANNER (INSTITUTIONAL THEME)
         ============================================================================== */}
      <section className={styles.innerDarkHeroBanner}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.08,
            backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 10, maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '30px',
              backgroundColor: 'rgba(200, 90, 50, 0.2)',
              border: '1.5px solid rgba(200, 90, 50, 0.5)',
              color: '#FCD3C1',
              fontSize: '0.8125rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}
          >
            <Sparkles size={14} color="#FCD3C1" />
            <span>Official Campus Press &amp; Media Cell</span>
          </div>

          <h1
            style={{
              fontSize: '2.75rem',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: '0 0 1rem 0',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            News &amp; Press Releases
          </h1>

          <p style={{ fontSize: '1.0625rem', color: '#DED4C5', margin: '0 auto', maxWidth: '750px', lineHeight: 1.6 }}>
            Discover breaking campus news, research breakthroughs, academic honors, cultural celebrations, and press announcements from our institutional community.
          </p>
        </div>
      </section>

      {/* ==============================================================================
         2. NEWS ARTICLES CARDS GRID
         ============================================================================== */}
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem 0 1.5rem' }}>
        {articles.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {articles.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1.5px solid #E8DFD1',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(36, 34, 31, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Cover Image or Fallback */}
                {item.coverImageUrl ? (
                  <div style={{ position: 'relative', width: '100%', height: '210px', overflow: 'hidden' }}>
                    <img
                      src={item.coverImageUrl}
                      alt={item.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: '#C85A32',
                        color: '#FFFFFF',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.725rem',
                        fontWeight: 800,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      }}
                    >
                      PRESS RELEASE
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '160px',
                      backgroundColor: '#FFF5F0',
                      borderBottom: '1.5px solid #FCD3C1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#C85A32',
                      gap: '8px',
                    }}
                  >
                    <Newspaper size={40} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em' }}>CAMPUS NEWS</span>
                  </div>
                )}

                {/* Content Box */}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Meta Strip */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#706A61', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: '#C85A32' }}>
                      <Calendar size={13} />
                      {new Date(item.publishDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    {item.author && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                        <User size={13} />
                        {item.author}
                      </span>
                    )}
                  </div>

                  <h3
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 800,
                      color: '#1F1914',
                      margin: '0 0 0.625rem 0',
                      lineHeight: 1.35,
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: '#68705A',
                      margin: '0 0 1.25rem 0',
                      lineHeight: 1.5,
                      flex: 1,
                    }}
                  >
                    {item.summary}
                  </p>

                  <div style={{ borderTop: '1px solid #E8DFD1', paddingTop: '1rem', marginTop: 'auto' }}>
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 800,
                        color: '#C85A32',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Read Story &amp; Media Highlights</span>
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No News Stories Published Yet"
            description="Campus press releases and news stories will be posted here by the college media cell."
          />
        )}
      </div>
    </div>
  );
}
