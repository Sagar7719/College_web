'use client';

import React from 'react';
import Link from 'next/link';
import {
  HeroSection,
  HeadingSection,
  RichTextSection,
  ImageSection,
  ImageTextSection,
  TwoColumnSection,
  ThreeColumnSection,
  CardGridSection,
  CTASection,
  FAQSection,
  NoticeListSection,
  DocumentDownloadsSection,
  GallerySection,
  SpacerSection,
  DocumentItem,
} from '@/types';
import { galleryService, downloadsService } from '@/services/cms-modules.service';
import { Button, Card, CardBody, Badge } from '@/components/ui';
import { sanitizeHtml } from '@/lib/sanitize';
import styles from './SectionBlocks.module.css';
import { FAQAccordion } from './FAQAccordion';

// 1. Hero Block
export const HeroBlock: React.FC<{ section: HeroSection }> = ({ section }) => (
  <div
    className={styles.heroBlock}
    style={section.backgroundImageUrl ? { backgroundImage: `url(${section.backgroundImageUrl})` } : undefined}
  >
    <div className={styles.heroOverlay}>
      <h1 className={styles.heroTitle}>{section.title}</h1>
      {section.subtitle && <p className={styles.heroSubtitle}>{section.subtitle}</p>}
      {section.buttonLabel && section.buttonUrl && (
        <Link href={section.buttonUrl}>
          <Button variant="secondary" size="lg">
            {section.buttonLabel}
          </Button>
        </Link>
      )}
    </div>
  </div>
);

// 2. Heading Block
export const HeadingBlock: React.FC<{ section: HeadingSection }> = ({ section }) => {
  const alignStyle: React.CSSProperties = { textAlign: section.align || 'left' };
  return (
    <div className={styles.headingBlock} style={alignStyle}>
      {section.level === 'h1' && <h1>{section.title}</h1>}
      {section.level === 'h2' && <h2>{section.title}</h2>}
      {section.level === 'h3' && <h3>{section.title}</h3>}
      {section.subtitle && <p className="small-text" style={{ marginTop: '0.25rem' }}>{section.subtitle}</p>}
    </div>
  );
};

// 3. Rich Text Block
export const RichTextBlock: React.FC<{ section: RichTextSection }> = ({ section }) => (
  <div
    className={styles.richTextBlock}
    dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.content) }}
  />
);

// 4. Image Block
export const ImageBlock: React.FC<{ section: ImageSection }> = ({ section }) => (
  <div className={styles.imageBlock} style={{ textAlign: section.alignment || 'center' }}>
    <img src={section.imageUrl} alt={section.altText || 'Page Image'} />
    {section.caption && <p className={styles.imageCaption}>{section.caption}</p>}
  </div>
);

// 5. Image + Text Block
export const ImageTextBlock: React.FC<{ section: ImageTextSection }> = ({ section }) => {
  const isRight = section.imagePosition === 'right';
  return (
    <div className={styles.imageTextBlock}>
      {!isRight && (
        <div className={styles.imageBlock}>
          <img src={section.imageUrl} alt={section.altText || section.title} />
        </div>
      )}
      <div>
        <h3>{section.title}</h3>
        <div className={styles.richTextBlock} dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.content) }} />
      </div>
      {isRight && (
        <div className={styles.imageBlock}>
          <img src={section.imageUrl} alt={section.altText || section.title} />
        </div>
      )}
    </div>
  );
};

// 6. Two Column Block
export const TwoColumnBlock: React.FC<{ section: TwoColumnSection }> = ({ section }) => (
  <div className={styles.twoColumnBlock}>
    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.col1Content) }} />
    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.col2Content) }} />
  </div>
);

// 7. Three Column Block
export const ThreeColumnBlock: React.FC<{ section: ThreeColumnSection }> = ({ section }) => (
  <div className={styles.threeColumnBlock}>
    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.col1Content) }} />
    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.col2Content) }} />
    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.col3Content) }} />
  </div>
);

// 8. Card Grid Block
export const CardGridBlock: React.FC<{ section: CardGridSection }> = ({ section }) => (
  <div style={{ marginBottom: '3rem' }}>
    {section.title && <h2 style={{ marginBottom: '1.5rem' }}>{section.title}</h2>}
    <div className={styles.cardGridBlock}>
      {section.cards.map((card) => (
        <Card key={card.id} variant="bordered" hoverable>
          <CardBody>
            {card.imageUrl && (
              <img
                src={card.imageUrl}
                alt={card.title}
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}
              />
            )}
            <h3>{card.title}</h3>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>{card.description}</p>
            {card.linkUrl && (
              <div style={{ marginTop: '1rem' }}>
                <Link href={card.linkUrl}>
                  <Button variant="outline" size="sm">
                    {card.linkText || 'Learn More'}
                  </Button>
                </Link>
              </div>
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  </div>
);

// 9. CTA Block
export const CTABlock: React.FC<{ section: CTASection }> = ({ section }) => (
  <div className={styles.ctaBlock}>
    <h2>{section.title}</h2>
    {section.description && <p style={{ margin: '1rem 0 1.5rem', color: 'var(--text-secondary)' }}>{section.description}</p>}
    {section.buttonUrl ? (
      <Link href={section.buttonUrl}>
        <Button variant="primary" size="lg">
          {section.buttonLabel || 'Learn More'}
        </Button>
      </Link>
    ) : section.buttonLabel ? (
      <Button variant="primary" size="lg">
        {section.buttonLabel}
      </Button>
    ) : null}
  </div>
);

// 10. FAQ Block
export const FAQBlock: React.FC<{ section: FAQSection }> = ({ section }) => (
  <div style={{ marginBottom: '3rem' }}>
    {section.title && <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>{section.title}</h2>}
    <FAQAccordion items={section.items} />
  </div>
);

// 11. Notice List Embed Block
export const NoticeListBlock: React.FC<{ section: NoticeListSection }> = ({ section }) => (
  <div className={styles.embedBlockContainer}>
    <div className={styles.embedBlockHeader}>
      <h3 className={styles.embedBlockTitle}>{section.title || 'Official College Notices'}</h3>
      <Link href="/notices">
        <Button variant="outline" size="sm">View All Notices</Button>
      </Link>
    </div>
    <Badge variant="info">Category: {section.categoryLimit || 'All Categories'}</Badge>
    <p className="small-text" style={{ marginTop: '0.75rem', color: 'var(--color-text-muted)' }}>
      Embedded notice feed displays latest college updates dynamically.
    </p>
  </div>
);

// 12. Document Downloads Embed Block — fetches live from Downloads CMS
export function DocumentDownloadsBlock({ section }: { section: DocumentDownloadsSection }) {
  const [docs, setDocs] = React.useState<DocumentItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    downloadsService.getPublished()
      .then((data) => {
        if (active) {
          let filtered = data;
          if (section.categoryFilter) {
            filtered = data.filter((d) => d.category === section.categoryFilter);
          }
          setDocs(filtered);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Failed to load documents:", err);
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [section.categoryFilter]);

  return (
    <div className={styles.embedBlockContainer}>
      <div className={styles.embedBlockHeader}>
        <h3 className={styles.embedBlockTitle}>{section.title || 'Downloads & Resources'}</h3>
        <Link href="/downloads">
          <Button variant="outline" size="sm">View All Downloads</Button>
        </Link>
      </div>

      {loading ? (
        <p className="small-text" style={{ color: 'var(--color-text-muted)' }}>
          Loading downloads...
        </p>
      ) : docs.length === 0 ? (
        <p className="small-text" style={{ color: 'var(--color-text-muted)' }}>
          {section.categoryFilter
            ? `No published documents in the "${section.categoryFilter}" category.`
            : 'No downloadable documents published yet.'}
        </p>
      ) : (
        <div className={styles.downloadList}>
          {docs.slice(0, 6).map((doc) => (
            <div key={doc.id} className={styles.downloadItem}>
              <div className={styles.downloadMeta}>
                <div>
                  <Badge variant="default" style={{ marginBottom: '0.25rem' }}>{doc.category || 'General'}</Badge>
                </div>
                <p className={styles.downloadTitle}>{doc.title}</p>
                {doc.fileSizeFormatted && (
                  <p className={styles.downloadInfo}>
                    {doc.fileType || 'PDF'} · {doc.fileSizeFormatted}
                  </p>
                )}
              </div>
              {doc.fileUrl && (
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{ textDecoration: 'none', flexShrink: 0 }}
                >
                  <Button variant="primary" size="sm">📥 Download</Button>
                </a>
              )}
            </div>
          ))}
          {docs.length > 6 && (
            <Link href="/downloads" style={{ fontSize: '0.875rem', color: 'var(--color-primary)', textDecoration: 'none', marginTop: '0.5rem', fontWeight: 600 }}>
              View all {docs.length} documents →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// 13. Gallery Embed Block — fetches album images from Gallery CMS
export function GalleryBlock({ section }: { section: GallerySection }) {
  const [images, setImages] = React.useState<{ id: string; url: string; altText?: string; caption?: string }[]>([]);
  const [albumTitle, setAlbumTitle] = React.useState<string | undefined>();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    const fetchGallery = async () => {
      let loadedImages: { id: string; url: string; altText?: string; caption?: string }[] = [];
      let title: string | undefined;

      if (section.albumId) {
        try {
          const albums = await galleryService.getPublished();
          const album = albums.find((a) => a.id === section.albumId || a.slug === section.albumId);
          if (album) {
            loadedImages = album.images || [];
            title = album.title;
          }
        } catch (err) {
          console.warn("Failed to load gallery album:", err);
        }
      }

      if (loadedImages.length === 0 && section.imageUrls && section.imageUrls.length > 0) {
        loadedImages = section.imageUrls.map((url, i) => ({ id: `static_${i}`, url }));
      }

      if (active) {
        setImages(loadedImages);
        setAlbumTitle(title);
        setLoading(false);
      }
    };

    fetchGallery();

    return () => {
      active = false;
    };
  }, [section.albumId, section.imageUrls]);

  return (
    <div style={{ marginBottom: '3rem' }}>
      {(section.title || albumTitle) && (
        <h3 style={{ marginBottom: '1rem' }}>{section.title || albumTitle}</h3>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading gallery...</p>
      ) : images.length === 0 ? (
        <div style={{
          padding: '2rem', backgroundColor: 'var(--bg-light)',
          borderRadius: 'var(--radius-lg)', textAlign: 'center',
          border: '1px dashed var(--border-color)',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {section.albumId ? 'No images found in this album.' : 'No gallery album selected. Configure this section in the Page Builder.'}
          </p>
          <Link href="/gallery" style={{ fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'none' }}>
            Browse Gallery →
          </Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {images.slice(0, 8).map((img, i) => (
              <img
                key={img.id || i}
                src={img.url}
                alt={img.altText || `Gallery photo ${i + 1}`}
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-md)', display: 'block' }}
                loading="lazy"
              />
            ))}
          </div>
          {images.length > 8 && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <Link href="/gallery" style={{ fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'none' }}>
                View full gallery →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// 14. Spacer Block
export const SpacerBlock: React.FC<{ section: SpacerSection }> = ({ section }) => {
  const className =
    section.height === 'sm' ? styles.spacerSm : section.height === 'lg' ? styles.spacerLg : styles.spacerMd;
  return <div className={className} aria-hidden="true" />;
};
