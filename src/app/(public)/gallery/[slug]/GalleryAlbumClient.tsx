'use client';

import React, { useState } from 'react';
import { GalleryImage } from '@/types';
import { GalleryLightbox } from '@/components/layout/GalleryLightbox';

interface Props {
  images: GalleryImage[];
}

export function GalleryAlbumClient({ images }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {images.map((img, idx) => (
          <button
            key={img.id || idx}
            onClick={() => setLightboxIndex(idx)}
            aria-label={`Open photo ${idx + 1}${img.caption ? `: ${img.caption}` : ''}`}
            style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              borderRadius: 'var(--radius-md)', overflow: 'hidden',
              display: 'block', width: '100%',
            }}
          >
            <div
              style={{
                width: '100%', height: '200px',
                backgroundColor: 'var(--neutral-200)',
                borderRadius: 'var(--radius-md)', overflow: 'hidden',
                position: 'relative',
              }}
            >
              <img
                src={img.url}
                alt={img.altText || `Photo ${idx + 1}`}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  display: 'block', transition: 'transform 0.25s ease',
                }}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '0.3';
                }}
              />
              {/* Hover overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(10,37,64,0)',
                transition: 'background 0.2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }} />
            </div>
            {img.caption && (
              <p style={{
                fontSize: '0.8rem', color: 'var(--text-muted)',
                marginTop: '0.375rem', textAlign: 'center',
                padding: '0 0.25rem',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
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
