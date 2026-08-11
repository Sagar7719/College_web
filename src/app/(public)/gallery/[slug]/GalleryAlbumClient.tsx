'use client';

import React, { useState } from 'react';
import { GalleryImage } from '@/types';
import { GalleryLightbox } from '@/components/layout/GalleryLightbox';
import styles from '../../inner.module.css';

interface Props {
  images: GalleryImage[];
}

export function GalleryAlbumClient({ images }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className={styles.galleryGrid}>
        {images.map((img, idx) => (
          <button
            key={img.id || idx}
            onClick={() => setLightboxIndex(idx)}
            aria-label={`Open photo ${idx + 1}${img.caption ? `: ${img.caption}` : ''}`}
            className={styles.lightboxButton}
          >
            <div
              style={{
                width: '100%', height: '220px',
                backgroundColor: 'var(--color-surface-muted)',
                position: 'relative',
              }}
            >
              <img
                src={img.url}
                alt={img.altText || `Photo ${idx + 1}`}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  display: 'block', transition: 'transform var(--transition-normal)'
                }}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '0.3';
                }}
              />
              {/* Hover overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(11,31,58,0)',
                transition: 'background 0.25s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }} />
            </div>
            {img.caption && (
              <p style={{
                fontSize: '0.8125rem', color: 'var(--color-text-secondary)',
                marginTop: '0.5rem', textAlign: 'center',
                padding: '0 0.5rem',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                fontWeight: 500
              }}>
                {img.caption}
              </p>
            )}
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox
          images={images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
